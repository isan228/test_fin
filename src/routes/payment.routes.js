import express from 'express';
import { createFinikPayment } from '../services/finik.service.js';

const router = express.Router();

/**
 * POST /api/payments/create
 * Создает платеж в системе Finik
 * 
 * Body:
 * {
 *   "amount": 100,
 *   "redirectUrl": "https://your-site.com/payment/success",
 *   "webhookUrl": "https://your-site.com/api/webhooks/finik",
 *   "merchantCategoryCode": "0742", // опционально
 *   "name_en": "finik-qr" // опционально
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const { 
      amount, 
      redirectUrl, 
      webhookUrl,
      merchantCategoryCode,
      name_en
    } = req.body;

    // Валидация обязательных полей
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'amount обязателен и должен быть больше 0' 
      });
    }

    if (!redirectUrl) {
      return res.status(400).json({ 
        error: 'redirectUrl обязателен' 
      });
    }

    if (!webhookUrl) {
      return res.status(400).json({ 
        error: 'webhookUrl обязателен' 
      });
    }

    const result = await createFinikPayment({
      amount: parseFloat(amount),
      redirectUrl,
      webhookUrl,
      merchantCategoryCode: merchantCategoryCode || '0742',
      name_en: name_en || 'finik-qr'
    });

    res.json({
      success: true,
      ...result
    });
  } catch (e) {
    console.error('Error creating payment:', e);
    res.status(500).json({ 
      success: false,
      error: e.message 
    });
  }
});

export default router;

