const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { signRequest, verifySignature } = require('./finikSigner');

// Публичные ключи Финика для проверки подписей
const FINIK_PUBLIC_KEYS = {
  production: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuF/PUmhMPPidcMxhZBPb
BSGJoSphmCI+h6ru8fG8guAlcPMVlhs+ThTjw2LHABvciwtpj51ebJ4EqhlySPyT
hqSfXI6Jp5dPGJNDguxfocohaz98wvT+WAF86DEglZ8dEsfoumojFUy5sTOBdHEu
g94B4BbrJvjmBa1YIx9Azse4HFlWhzZoYPgyQpArhokeHOHIN2QFzJqeriANO+wV
aUMta2AhRVZHbfyJ36XPhGO6A5FYQWgjzkI65cxZs5LaNFmRx6pjnhjIeVKKgF99
4OoYCzhuR9QmWkPl7tL4Kd68qa/xHLz0Psnuhm0CStWOYUu3J7ZpzRK8GoEXRcr8
tQIDAQAB
-----END PUBLIC KEY-----`,
  beta: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlrlKz/8gLWd1ARWGA/8
o3a3Qy8G+hPifyqiPosiTY6nCHovANMIJXk6DH4qAqqZeLu8pLGxudkPbv8dSyG7
F9PZEAryMPzjoB/9P/F6g0W46K/FHDtwTM3YIVvstbEbL19m8yddv/xCT9JPPJTb
LsSTVZq5zCqvKzpupwlGS3Q3oPyLAYe+ZUn4Bx2J1WQrBu3b08fNaR3E8pAkCK27
JqFnP0eFfa817VCtyVKcFHb5ij/D0eUP519Qr/pgn+gsoG63W4pPHN/pKwQUUiAy
uLSHqL5S2yu1dffyMcMVi9E/Q2HCTcez5OvOllgOtkNYHSv9pnrMRuws3u87+hNT
ZwIDAQAB
-----END PUBLIC KEY-----`
};

// URL API Финика
const FINIK_API_URLS = {
  production: 'https://api.acquiring.averspay.kg',
  beta: 'https://beta.api.acquiring.averspay.kg'
};

/**
 * Создает платеж в системе Финика
 * 
 * @param {Object} params - Параметры платежа
 * @param {Number} params.amount - Сумма платежа
 * @param {String} params.paymentId - Уникальный ID платежа (UUID)
 * @param {String} params.redirectUrl - URL для редиректа после оплаты
 * @param {String} params.accountId - ID корпоративного аккаунта
 * @param {String} params.merchantCategoryCode - MCC код
 * @param {String} params.name_en - Название QR кода
 * @param {String} params.webhookUrl - URL для webhook
 * @param {String} params.description - Описание (опционально)
 * @param {Number} params.startDate - Начало действия QR (опционально, timestamp)
 * @param {Number} params.endDate - Конец действия QR (опционально, timestamp)
 * @param {String} params.apiKey - API ключ от Финика
 * @param {String} params.privateKey - Приватный ключ (PEM)
 * @param {String} params.environment - Окружение: 'production' или 'beta'
 * @returns {Promise<Object>} Результат создания платежа
 */
async function createPayment(params) {
  const {
    amount,
    paymentId,
    redirectUrl,
    accountId,
    merchantCategoryCode,
    name_en,
    webhookUrl,
    description,
    startDate,
    endDate,
    apiKey,
    privateKey,
    environment = 'production'
  } = params;

  const baseUrl = FINIK_API_URLS[environment] || FINIK_API_URLS.production;
  const host = new URL(baseUrl).host;
  const timestamp = Date.now().toString();
  const path = '/v1/payment';

  // Формируем тело запроса
  const body = {
    Amount: amount,
    CardType: 'FINIK_QR',
    PaymentId: paymentId || uuidv4(),
    RedirectUrl: redirectUrl,
    Data: {
      accountId: accountId,
      merchantCategoryCode: merchantCategoryCode,
      name_en: name_en,
      webhookUrl: webhookUrl
    }
  };

  // Добавляем опциональные поля
  if (description) {
    body.Data.description = description;
  }
  if (startDate) {
    body.Data.startDate = startDate;
  }
  if (endDate) {
    body.Data.endDate = endDate;
  }

  // Формируем данные для подписи
  const requestData = {
    httpMethod: 'POST',
    path: path,
    headers: {
      Host: host,
      'x-api-key': apiKey,
      'x-api-timestamp': timestamp
    },
    queryStringParameters: undefined,
    body: body
  };

  // Генерируем подпись
  const signature = signRequest(requestData, privateKey);

  // Отправляем запрос
  try {
    // Логируем запрос для отладки (без чувствительных данных)
    console.log('Creating payment:', {
      amount,
      paymentId: body.PaymentId,
      accountId,
      environment,
      baseUrl,
      hasSignature: !!signature
    });

    const response = await axios.post(`${baseUrl}${path}`, body, {
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'x-api-timestamp': timestamp,
        signature: signature
      },
      maxRedirects: 0, // НЕ следовать редиректу автоматически
      validateStatus: (status) => [201, 302].includes(status) || status >= 400
    });

    console.log('Finik API response:', {
      status: response.status,
      statusText: response.statusText,
      location: response.headers.location,
      data: response.data
    });

    if (response.status === 302) {
      // Получаем URL платежа из заголовка Location
      let paymentUrl = response.headers.location;
      
      console.log('Finik redirect URL:', paymentUrl);
      
      // Если это redirect URL на api.acquiring.averspay.kg, возможно нужно следовать редиректу
      // Но согласно документации, мы НЕ должны следовать редиректу автоматически
      // URL должен быть вида: https://qr.finik.kg/... или https://api.acquiring.averspay.kg/v1/redirect?...
      
      // Если URL содержит /v1/redirect, возможно нужно извлечь paymentId и построить правильный QR URL
      // Но обычно Финик возвращает прямой URL на qr.finik.kg
      
      // Проверяем статус в URL
      const urlStatus = paymentUrl.includes('status=failed') ? 'failed' : 
                       paymentUrl.includes('status=success') ? 'success' : 'unknown';
      
      if (urlStatus === 'failed') {
        console.warn('⚠️  Payment created but status=failed in URL. Possible reasons:');
        console.warn('   - Invalid accountId or API key');
        console.warn('   - Account not activated');
        console.warn('   - Wrong environment (beta vs production)');
        console.warn('   - Missing required parameters');
      }
      
      // Пытаемся извлечь paymentId из URL для построения правильного QR URL
      let qrPaymentUrl = paymentUrl;
      const paymentIdMatch = paymentUrl.match(/paymentId=([^&]+)/);
      if (paymentIdMatch && paymentIdMatch[1]) {
        const extractedPaymentId = paymentIdMatch[1];
        // Строим URL для QR кода (формат qr.finik.kg)
        // Но это может быть неправильно, так как мы не знаем точный формат
        // Оставляем оригинальный URL, но добавляем информацию
        console.log('Extracted paymentId from URL:', extractedPaymentId);
      }
      
      return {
        success: true,
        paymentUrl: paymentUrl,
        paymentId: body.PaymentId,
        status: 'created',
        urlStatus: urlStatus,
        warning: urlStatus === 'failed' ? 'Payment URL contains status=failed. Check your credentials and account settings with Finik.' : undefined
      };
    } else if (response.status === 201) {
      return {
        success: true,
        data: response.data,
        paymentId: body.PaymentId,
        status: 'created'
      };
    } else {
      const errorMessage = response.data?.ErrorMessage || response.data?.message || `HTTP ${response.status}`;
      console.error('Finik API error:', {
        status: response.status,
        error: errorMessage,
        data: response.data
      });
      
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
        details: response.data
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.ErrorMessage || error.message,
        statusCode: error.response.status
      };
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Проверяет подпись входящего webhook от Финика
 * 
 * @param {Object} req - Express request объект
 * @param {String} environment - Окружение: 'production' или 'beta'
 * @returns {Boolean} true если подпись валидна
 */
function verifyWebhookSignature(req, environment = 'production') {
  try {
    const publicKey = FINIK_PUBLIC_KEYS[environment] || FINIK_PUBLIC_KEYS.production;
    const signature = req.headers.signature;
    const timestamp = req.headers['x-api-timestamp'];

    if (!signature || !timestamp) {
      console.error('Missing signature or timestamp in webhook');
      return false;
    }

    // Получаем путь из URL (без query string)
    const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Собираем заголовки для подписи
    const signatureHeaders = {
      Host: req.headers.host
    };
    
    // Добавляем все x-api-* заголовки
    Object.keys(req.headers).forEach(h => {
      if (h.toLowerCase().startsWith('x-api-')) {
        signatureHeaders[h] = req.headers[h];
      }
    });

    // Формируем данные для проверки подписи
    const requestData = {
      httpMethod: req.method,
      path: path,
      headers: signatureHeaders,
      queryStringParameters: Object.keys(req.query || {}).length > 0 ? req.query : undefined,
      body: req.body || {}
    };

    // Проверяем подпись
    return verifySignature(requestData, signature, publicKey);
  } catch (error) {
    console.error('Ошибка проверки подписи:', error);
    return false;
  }
}

module.exports = {
  createPayment,
  verifyWebhookSignature,
  FINIK_PUBLIC_KEYS,
  FINIK_API_URLS
};
