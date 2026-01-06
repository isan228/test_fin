// Используем node-fetch v3 (ES modules)
import fetch from 'node-fetch';
// @mancho.devs/authorizer - CommonJS модуль, используем default import
import authorizerPkg from '@mancho.devs/authorizer';
const { Signer } = authorizerPkg;
import { randomUUID } from 'crypto';
import { FINIK_BASE_URL, FINIK_HOST, FINIK_API_PATH } from '../config/finik.js';

/**
 * Создает платеж в системе Finik
 * 
 * @param {Object} params - Параметры платежа
 * @param {Number} params.amount - Сумма платежа
 * @param {String} params.redirectUrl - URL для редиректа после оплаты
 * @param {String} params.webhookUrl - URL для webhook
 * @param {String} params.merchantCategoryCode - MCC код (по умолчанию '0742')
 * @param {String} params.name_en - Название QR кода (по умолчанию 'finik-qr')
 * @returns {Promise<Object>} Результат создания платежа { paymentUrl, paymentId }
 */
export async function createFinikPayment({ 
  amount, 
  redirectUrl, 
  webhookUrl,
  merchantCategoryCode = '0742',
  name_en = 'finik-qr'
}) {
  const timestamp = Date.now().toString();
  const paymentId = randomUUID();

  const body = {
    Amount: amount,
    CardType: 'FINIK_QR',
    PaymentId: paymentId,
    RedirectUrl: redirectUrl,
    Data: {
      accountId: process.env.FINIK_ACCOUNT_ID,
      merchantCategoryCode: merchantCategoryCode,
      name_en: name_en,
      webhookUrl: webhookUrl
    }
  };

  const requestData = {
    httpMethod: 'POST',
    path: FINIK_API_PATH,
    headers: {
      Host: FINIK_HOST,
      'x-api-key': process.env.FINIK_API_KEY,
      'x-api-timestamp': timestamp
    },
    queryStringParameters: undefined,
    body
  };

  // Генерируем подпись
  const signer = new Signer(requestData);
  const signature = await signer.sign(process.env.FINIK_PRIVATE_KEY);

  // Отправляем запрос
  const res = await fetch(`${FINIK_BASE_URL}${FINIK_API_PATH}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.FINIK_API_KEY,
      'x-api-timestamp': timestamp,
      signature
    },
    body: JSON.stringify(body),
    redirect: 'manual' // НЕ СЛЕДУЕМ за 302
  });

  if (res.status === 302) {
    const paymentUrl = res.headers.get('location');
    return {
      paymentUrl,
      paymentId
    };
  }

  // Обработка ошибок
  const text = await res.text();
  let errorMessage = `Finik error ${res.status}: ${text}`;
  
  try {
    const errorData = JSON.parse(text);
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    // Оставляем текстовое сообщение
  }

  throw new Error(errorMessage);
}

