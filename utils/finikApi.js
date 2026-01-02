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

  // Нормализуем окружение (BETA -> beta, PRODUCTION -> production)
  const normalizedEnv = environment.toLowerCase();
  const baseUrl = FINIK_API_URLS[normalizedEnv] || FINIK_API_URLS.production;
  const host = new URL(baseUrl).host;
  const timestamp = Date.now().toString();
  // Путь для создания платежа (может быть /payment или /v1/payment в зависимости от версии API)
  const path = process.env.FINIK_API_PATH || '/payment';

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
    // Логируем каноническую строку для отладки подписи
    const { buildCanonicalString } = require('./finikSigner');
    const canonicalString = buildCanonicalString(requestData);
    
    // Логируем запрос для отладки (без чувствительных данных)
    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 Создание платежа в Финике:');
    console.log('   Full URL:', `${baseUrl}${path}`);
    console.log('   Path:', path);
    console.log('   Amount:', amount);
    console.log('   PaymentId:', body.PaymentId);
    console.log('   AccountId:', accountId);
    console.log('   Environment:', normalizedEnv, `(нормализовано из: ${environment})`);
    console.log('   Base URL:', baseUrl);
    console.log('   Host:', host);
    console.log('   Timestamp:', timestamp);
    console.log('   API Key (первые 10 символов):', apiKey ? apiKey.substring(0, 10) + '...' : 'НЕ УСТАНОВЛЕН');
    console.log('   Signature:', signature ? signature.substring(0, 20) + '...' : 'НЕ СГЕНЕРИРОВАНА');
    console.log('   Canonical String (для подписи):');
    console.log('   ───────────────────────────────────────────────────');
    console.log(canonicalString);
    console.log('   ───────────────────────────────────────────────────');
    console.log('   Request Body:', JSON.stringify(body, null, 2));
    console.log('   Headers:', JSON.stringify({
      'content-type': 'application/json',
      'x-api-key': apiKey ? apiKey.substring(0, 10) + '...' : 'НЕ УСТАНОВЛЕН',
      'x-api-timestamp': timestamp,
      'signature': signature ? signature.substring(0, 20) + '...' : 'НЕ СГЕНЕРИРОВАНА'
    }, null, 2));
    console.log('═══════════════════════════════════════════════════════');

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

    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 Ответ от Финика:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Location:', response.headers.location);
    console.log('   Response Data:', JSON.stringify(response.data, null, 2));
    console.log('   Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('═══════════════════════════════════════════════════════');

    if (response.status === 302) {
      // Получаем URL платежа из заголовка Location
      let paymentUrl = response.headers.location;
      
      console.log('🔗 Finik redirect URL:', paymentUrl);
      
      // Проверяем статус в URL
      const urlStatus = paymentUrl.includes('status=failed') ? 'failed' : 
                       paymentUrl.includes('status=success') ? 'success' : 'unknown';
      
      if (urlStatus === 'failed') {
        console.error('❌ ⚠️  ⚠️  ⚠️  ПЛАТЕЖ СОЗДАН СО СТАТУСОМ FAILED ⚠️  ⚠️  ⚠️');
        console.error('═══════════════════════════════════════════════════════');
        console.error('Возможные причины:');
        console.error('   1. ❌ Неправильный AccountId:', accountId);
        console.error('   2. ❌ Неправильный API Key (первые 10 символов):', apiKey ? apiKey.substring(0, 10) + '...' : 'НЕ УСТАНОВЛЕН');
        console.error('   3. ❌ Неправильное окружение:', environment, '(должно быть production или beta)');
        console.error('   4. ❌ Аккаунт не активирован в системе Финика');
        console.error('   5. ❌ Проблема с подписью запроса');
        console.error('   6. ❌ Неправильный формат данных в запросе');
        console.error('═══════════════════════════════════════════════════════');
        console.error('Отправленные данные:');
        console.error('   AccountId:', accountId);
        console.error('   MerchantCategoryCode:', merchantCategoryCode);
        console.error('   Name (en):', name_en);
        console.error('   WebhookUrl:', webhookUrl);
        console.error('   RedirectUrl:', redirectUrl);
        console.error('   Amount:', amount);
        console.error('═══════════════════════════════════════════════════════');
        console.error('💡 Рекомендации:');
        console.error('   1. Проверьте правильность AccountId и API Key в .env');
        console.error('   2. Убедитесь, что аккаунт активирован в системе Финика');
        console.error('   3. Проверьте, что используете правильное окружение (production/beta)');
        console.error('   4. Свяжитесь с поддержкой Финика для проверки аккаунта');
        console.error('═══════════════════════════════════════════════════════');
      } else if (urlStatus === 'success') {
        console.log('✅ Платеж успешно создан!');
      } else {
        console.log('⚠️  Статус в URL неизвестен');
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
