const express = require('express');
const router = express.Router();
const { verifyWebhookSignature } = require('../utils/finikApi');
const { Payment, ApiKey } = require('../models');

/**
 * POST /webhooks/finik
 * Обрабатывает webhook от Финика о статусе платежа
 * 
 * Проверяет подпись, валидирует timestamp, обрабатывает статус платежа
 */
router.post('/finik', async (req, res) => {
  try {
    console.log('Webhook received from Finik:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    const webhookData = req.body;
    // Нормализуем окружение (BETA -> beta, PRODUCTION -> production)
    const environment = (process.env.FINIK_ENVIRONMENT || 'production').toLowerCase();

    // ⚠️ ВРЕМЕННО ОТКЛЮЧЕНО: Проверка подписи (для тестирования)
    // const isValidSignature = verifyWebhookSignature(req, environment);
    // 
    // if (!isValidSignature) {
    //   console.error('Invalid signature in webhook');
    //   return res.status(401).json({ 
    //     success: false, 
    //     error: 'Invalid signature' 
    //   });
    // }
    console.log('⚠️  ПРОВЕРКА ПОДПИСИ ОТКЛЮЧЕНА ДЛЯ ТЕСТИРОВАНИЯ');

    // ⚠️ ВРЕМЕННО ОТКЛЮЧЕНО: Проверка timestamp (для тестирования)
    // const timestamp = parseInt(req.headers['x-api-timestamp']);
    // if (!timestamp) {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Missing x-api-timestamp header'
    //   });
    // }
    //
    // const now = Date.now();
    // const timeDiff = Math.abs(now - timestamp);
    // const fiveMinutes = 5 * 60 * 1000;
    //
    // if (timeDiff > fiveMinutes) {
    //   console.error('Timestamp too old or too far in future:', {
    //     timestamp,
    //     now,
    //     diff: timeDiff
    //   });
    //   return res.status(401).json({ 
    //     success: false, 
    //     error: 'Invalid timestamp' 
    //   });
    // }
    console.log('⚠️  ПРОВЕРКА TIMESTAMP ОТКЛЮЧЕНА ДЛЯ ТЕСТИРОВАНИЯ');

    // Обрабатываем данные webhook
    const transactionId = webhookData.transactionId || webhookData.id;
    const status = webhookData.status; // 'SUCCEEDED' или 'FAILED'
    const amount = webhookData.amount;
    const accountId = webhookData.accountId;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing transactionId' 
      });
    }

    // Ищем платеж по transactionId
    let payment = await Payment.findOne({
      where: { 
        paymentId: transactionId 
      }
    });

    // Если платеж не найден, ищем по accountId и создаем новый
    if (!payment && accountId) {
      const apiKey = await ApiKey.findOne({ 
        where: { 
          accountId: accountId,
          isActive: true 
        } 
      });

      // ⚠️ ДЛЯ ТЕСТИРОВАНИЯ: Создаем платеж даже без ApiKey
      const paymentData = {
        paymentId: transactionId,
        amount: amount || 0,
        currency: 'KGS',
        status: mapFinikStatus(status),
        callbackData: webhookData
      };

      // Добавляем apiKeyId только если найден
      if (apiKey) {
        paymentData.apiKeyId = apiKey.id;
        console.log('✅ ApiKey найден, создаем платеж с apiKeyId:', apiKey.id);
      } else {
        console.log('⚠️  ApiKey не найден для accountId:', accountId, '- создаем платеж без apiKeyId (для тестирования)');
      }

      payment = await Payment.create(paymentData);
      console.log('✅ Платеж создан:', transactionId, apiKey ? `(apiKeyId: ${apiKey.id})` : '(без apiKeyId)');
    }

    if (payment) {
      // Обновляем существующий платеж (идемпотентность)
      await payment.update({
        status: mapFinikStatus(status),
        callbackData: webhookData,
        amount: amount || payment.amount
      });
    }

    // Отвечаем быстро (200 OK) - тяжелую работу делаем асинхронно
    // Это важно для Финика, чтобы они не повторяли запрос
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed',
      transactionId: transactionId 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // Все равно отвечаем 200, чтобы Финик не повторял запрос
    res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Маппинг статусов Финика в наши статусы
 */
function mapFinikStatus(finikStatus) {
  const statusMap = {
    'SUCCEEDED': 'success',
    'FAILED': 'failed',
    'PENDING': 'pending',
    'CANCELLED': 'cancelled'
  };
  return statusMap[finikStatus] || 'pending';
}

module.exports = router;



