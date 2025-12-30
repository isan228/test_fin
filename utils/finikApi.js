const { Signer, RequestData } = require('@mancho.devs/authorizer');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
  const requestData = new RequestData({
    httpMethod: 'POST',
    path: path,
    headers: {
      Host: host,
      'x-api-key': apiKey,
      'x-api-timestamp': timestamp
    },
    queryStringParameters: undefined,
    body: body
  });

  // Генерируем подпись
  const signer = new Signer(requestData);
  const signature = await signer.sign(privateKey);

  // Отправляем запрос
  try {
    const response = await axios.post(`${baseUrl}${path}`, body, {
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'x-api-timestamp': timestamp,
        signature: signature
      },
      maxRedirects: 0, // Не следовать редиректу автоматически
      validateStatus: (status) => [201, 302].includes(status) || status >= 400
    });

    if (response.status === 302) {
      // Получаем URL платежа из заголовка Location
      const paymentUrl = response.headers.location;
      return {
        success: true,
        paymentUrl: paymentUrl,
        paymentId: body.PaymentId,
        status: 'created'
      };
    } else if (response.status === 201) {
      return {
        success: true,
        data: response.data,
        paymentId: body.PaymentId,
        status: 'created'
      };
    } else {
      return {
        success: false,
        error: response.data?.ErrorMessage || `HTTP ${response.status}`,
        statusCode: response.status
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
      return false;
    }

    // Формируем каноническую строку для проверки
    const baseUrl = FINIK_API_URLS[environment] || FINIK_API_URLS.production;
    const host = new URL(baseUrl).host;

    // Получаем путь из URL (без query string)
    const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Собираем заголовки для подписи
    const signatureHeaders = {
      Host: req.headers.host || host
    };
    
    // Добавляем все x-api-* заголовки
    Object.keys(req.headers).forEach(h => {
      if (h.toLowerCase().startsWith('x-api-')) {
        signatureHeaders[h] = req.headers[h];
      }
    });

    const requestData = new RequestData({
      httpMethod: req.method,
      path: path,
      headers: signatureHeaders,
      queryStringParameters: Object.keys(req.query).length > 0 ? req.query : undefined,
      body: req.body
    });

    // Проверяем подпись
    const signer = new Signer(requestData);
    return signer.verify(publicKey, signature);
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

