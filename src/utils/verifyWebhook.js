// @mancho.devs/authorizer - CommonJS модуль, используем default import
import authorizerPkg from '@mancho.devs/authorizer';
const { Verifier } = authorizerPkg;

/**
 * Проверяет подпись webhook от Finik
 * 
 * @param {Object} req - Express request объект
 * @returns {Boolean} true если подпись валидна
 */
export function verifyFinikWebhook(req) {
  const signature = req.headers.signature;

  if (!signature) {
    throw new Error('Missing signature header');
  }

  const requestData = {
    httpMethod: req.method,
    path: req.originalUrl || req.url,
    headers: req.headers,
    queryStringParameters: Object.keys(req.query || {}).length > 0 ? req.query : undefined,
    body: req.body || {}
  };

  const publicKey = process.env.FINIK_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('FINIK_PUBLIC_KEY не установлен в переменных окружения');
  }
  
  // Нормализуем ключ (убираем лишние пробелы и кавычки)
  const normalizedKey = publicKey
    .replace(/\\n/g, '\n')
    .replace(/^["']|["']$/g, '')
    .trim();
  
  const verifier = new Verifier(requestData);
  return verifier.verify(normalizedKey, signature);
}

