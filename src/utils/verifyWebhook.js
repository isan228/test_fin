import { Verifier } from '@mancho.devs/authorizer';

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

  const verifier = new Verifier(requestData);
  return verifier.verify(process.env.FINIK_PUBLIC_KEY, signature);
}

