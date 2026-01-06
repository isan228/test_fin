import express from 'express';
import { verifyFinikWebhook } from '../utils/verifyWebhook.js';

const router = express.Router();

/**
 * POST /api/webhooks/finik
 * Обрабатывает webhook от Finik о статусе платежа
 * 
 * ⚠️ ВАЖНО: ТОЛЬКО webhook подтверждает платеж, НЕ redirectUrl!
 * 
 * Body от Finik:
 * {
 *   "transactionId": "uuid",
 *   "status": "SUCCEEDED" | "FAILED",
 *   "amount": 100,
 *   ...
 * }
 */
router.post('/finik', async (req, res) => {
  try {
    // Проверяем подпись
    verifyFinikWebhook(req);

    const { transactionId, status, amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({ 
        error: 'Missing transactionId' 
      });
    }

    // Обработка платежа (идемпотентно)
    // TODO: Интегрировать с БД для сохранения статуса платежа
    // 1. Проверить есть ли такой transactionId в БД
    // 2. Если SUCCEEDED → отметить платёж успешным
    // 3. Если FAILED → отметить ошибку
    // 4. Сделать идемпотентно (не обрабатывать повторно)

    console.log('✅ Webhook received and verified:', {
      transactionId,
      status,
      amount,
      timestamp: new Date().toISOString()
    });

    // Здесь можно добавить логику сохранения в БД
    // Например:
    // await Payment.update(
    //   { status: status === 'SUCCEEDED' ? 'success' : 'failed' },
    //   { where: { paymentId: transactionId } }
    // );

    // Отвечаем быстро (< 1 сек) - тяжелую работу делаем асинхронно
    // Это важно для Finik, чтобы они не повторяли запрос
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(401).json({ 
      error: 'Invalid signature' 
    });
  }
});

export default router;

