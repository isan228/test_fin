const crypto = require('crypto');

/**
 * Сортирует объект рекурсивно по ключам
 * @param {*} obj - Объект для сортировки
 * @returns {*} Отсортированный объект
 */
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Array) {
    return obj;
  }

  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Array)) {
      sorted[key] = sortObjectKeys(obj[key]);
    } else if (obj[key] instanceof Array) {
      sorted[key] = obj[key].map(item => 
        typeof item === 'object' && item !== null ? sortObjectKeys(item) : item
      );
    } else {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

/**
 * URL-кодирует строку
 * @param {String} str - Строка для кодирования
 * @returns {String} Закодированная строка
 */
function urlEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Строит каноническую строку для подписи согласно документации Финика
 * 
 * Формат:
 * 1. lowercase(HTTP method) + "\n"
 * 2. URIAbsolutePath + "\n"
 * 3. Headers (host + все x-api-*) отсортированные + "\n"
 * 4. Query string параметры отсортированные + "\n" (или пусто если нет)
 * 5. JSON body с отсортированными ключами (compact, без пробелов)
 * 
 * @param {Object} params - Параметры запроса
 * @param {String} params.httpMethod - HTTP метод (GET, POST, etc.)
 * @param {String} params.path - Абсолютный путь (например, /v1/payment)
 * @param {Object} params.headers - Заголовки запроса
 * @param {Object} params.queryStringParameters - Query параметры (опционально)
 * @param {Object} params.body - Тело запроса (опционально)
 * @returns {String} Каноническая строка для подписи
 */
function buildCanonicalString(params) {
  const { httpMethod, path, headers, queryStringParameters, body } = params;
  
  let canonical = '';
  
  // 1. Lowercase HTTP method
  canonical += httpMethod.toLowerCase() + '\n';
  
  // 2. Absolute path (без query string)
  canonical += path + '\n';
  
  // 3. Headers: host + все x-api-* заголовки, отсортированные по имени
  const headerKeys = Object.keys(headers || {})
    .filter(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey === 'host' || lowerKey.startsWith('x-api-');
    })
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  if (headerKeys.length > 0) {
    const headerParts = headerKeys.map(key => {
      const lowerKey = key.toLowerCase();
      return `${lowerKey}:${String(headers[key])}`;
    });
    canonical += headerParts.join('&') + '\n';
  } else {
    canonical += '\n';
  }
  
  // 4. Query string parameters (отсортированные, URL-encoded)
  // Согласно документации: если нет query параметров, не добавляем \n
  if (queryStringParameters && Object.keys(queryStringParameters).length > 0) {
    const queryKeys = Object.keys(queryStringParameters).sort();
    const queryParts = queryKeys.map(key => {
      const value = queryStringParameters[key] || '';
      return `${urlEncode(key)}=${urlEncode(String(value))}`;
    });
    canonical += queryParts.join('&') + '\n';
  }
  // Если нет query параметров, не добавляем \n (согласно документации)
  
  // 5. JSON body (отсортированные ключи, compact JSON)
  if (body && Object.keys(body).length > 0) {
    const sortedBody = sortObjectKeys(body);
    canonical += JSON.stringify(sortedBody);
  }
  
  return canonical;
}

/**
 * Генерирует RSA-SHA256 подпись для запроса к Финику
 * 
 * @param {Object} requestData - Данные запроса
 * @param {String} requestData.httpMethod - HTTP метод
 * @param {String} requestData.path - Абсолютный путь
 * @param {Object} requestData.headers - Заголовки (должны включать Host и x-api-*)
 * @param {Object} requestData.queryStringParameters - Query параметры (опционально)
 * @param {Object} requestData.body - Тело запроса (опционально)
 * @param {String} privateKeyPem - Приватный ключ в формате PEM
 * @returns {String} Base64 подпись
 */
function signRequest(requestData, privateKeyPem) {
  try {
    // Нормализация приватного ключа (на случай если пришел из .env с \n)
    let normalizedKey = privateKeyPem;
    if (typeof normalizedKey === 'string') {
      // Заменяем \n на реальные переносы строк
      normalizedKey = normalizedKey.replace(/\\n/g, '\n');
      // Убираем пробелы в начале и конце, но сохраняем переносы строк внутри
      normalizedKey = normalizedKey.trim();
      
      // Убеждаемся, что есть правильные переносы строк
      // Если ключ в одной строке без переносов, это проблема
      if (!normalizedKey.includes('\n') && normalizedKey.length > 100) {
        throw new Error('Ключ должен содержать переносы строк. Используйте многострочный формат в .env или \\n в одной строке.');
      }
    }
    
    // Строим каноническую строку
    const canonicalString = buildCanonicalString(requestData);
    
    // Пробуем использовать ключ напрямую
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(canonicalString, 'utf8');
      sign.end();
      const signature = sign.sign(normalizedKey, 'base64');
      return signature;
    } catch (signError) {
      // Если не получилось, пробуем через createPrivateKey
      try {
        const privateKey = crypto.createPrivateKey({
          key: normalizedKey,
          format: 'pem',
          type: 'pkcs8' // или 'pkcs1' для RSA PRIVATE KEY
        });
        
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(canonicalString, 'utf8');
        sign.end();
        const signature = sign.sign(privateKey, 'base64');
        return signature;
      } catch (keyError) {
        // Пробуем с типом pkcs1 (для BEGIN RSA PRIVATE KEY)
        try {
          const privateKey = crypto.createPrivateKey({
            key: normalizedKey,
            format: 'pem',
            type: 'pkcs1'
          });
          
          const sign = crypto.createSign('RSA-SHA256');
          sign.update(canonicalString, 'utf8');
          sign.end();
          const signature = sign.sign(privateKey, 'base64');
          return signature;
        } catch (finalError) {
          throw new Error(`Ошибка декодирования ключа: ${finalError.message}. Проверьте формат ключа. Попробуйте: 1) Использовать реальные переносы строк в .env, 2) Убедиться что ключ начинается с -----BEGIN и заканчивается -----END`);
        }
      }
    }
  } catch (error) {
    // Более детальная ошибка для отладки
    if (error.message.includes('DECODER')) {
      throw new Error(`Ошибка декодирования приватного ключа: ${error.message}. Проверьте формат ключа в .env файле. Ключ должен быть в формате PEM с правильными переносами строк.`);
    }
    throw error;
  }
}

/**
 * Проверяет RSA-SHA256 подпись от Финика
 * 
 * @param {Object} requestData - Данные запроса
 * @param {String} requestData.httpMethod - HTTP метод
 * @param {String} requestData.path - Абсолютный путь
 * @param {Object} requestData.headers - Заголовки
 * @param {Object} requestData.queryStringParameters - Query параметры (опционально)
 * @param {Object} requestData.body - Тело запроса (опционально)
 * @param {String} signatureBase64 - Подпись в формате Base64
 * @param {String} publicKeyPem - Публичный ключ Финика в формате PEM
 * @returns {Boolean} true если подпись валидна
 */
function verifySignature(requestData, signatureBase64, publicKeyPem) {
  try {
    // Строим каноническую строку
    const canonicalString = buildCanonicalString(requestData);
    
    // Проверяем подпись
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(canonicalString, 'utf8');
    verify.end();
    
    // Проверяем подпись с публичным ключом
    const isValid = verify.verify(publicKeyPem, signatureBase64, 'base64');
    
    return isValid;
  } catch (error) {
    console.error('Ошибка проверки подписи:', error);
    return false;
  }
}

module.exports = {
  buildCanonicalString,
  signRequest,
  verifySignature,
  sortObjectKeys
};

