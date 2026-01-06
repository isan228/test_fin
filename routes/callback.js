const express = require('express');
const router = express.Router();
const { Payment, ApiKey } = require('../models');
const crypto = require('crypto');
const { verifyWebhookSignature } = require('../utils/finikApi');

// Callback endpoint для обработки webhook от Финика
router.post('/finik', async (req, res) => {
  try {
    console.log('Webhook received from Finik:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    const webhookData = req.body;

    // Определяем окружение из заголовков или используем production по умолчанию
    // Можно добавить логику определения окружения
    const environment = 'production'; // или 'beta'

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
    // const now = Date.now();
    // const timeDiff = Math.abs(now - timestamp);
    // const fiveMinutes = 5 * 60 * 1000;
    //
    // if (timeDiff > fiveMinutes) {
    //   console.error('Timestamp too old or too far in future');
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

    // Ищем платеж по transactionId или id
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

      if (apiKey) {
        payment = await Payment.create({
          apiKeyId: apiKey.id,
          paymentId: transactionId,
          amount: amount || 0,
          currency: 'KGS', // Валюта Кыргызстана
          status: mapFinikStatus(status),
          callbackData: webhookData
        });
      }
    }

    if (payment) {
      // Обновляем существующий платеж
      await payment.update({
        status: mapFinikStatus(status),
        callbackData: webhookData,
        amount: amount || payment.amount
      });
    }

    // Отвечаем быстро (200 OK) - тяжелую работу делаем асинхронно
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

// Маппинг статусов Финика в наши статусы
function mapFinikStatus(finikStatus) {
  const statusMap = {
    'SUCCEEDED': 'success',
    'FAILED': 'failed',
    'PENDING': 'pending',
    'CANCELLED': 'cancelled'
  };
  return statusMap[finikStatus] || 'pending';
}

// GET endpoint для проверки статуса (если Финик использует GET для callbacks)
router.get('/finik', async (req, res) => {
  try {
    console.log('GET Callback received from Finik:', req.query);
    
    const paymentId = req.query.paymentId || req.query.id;
    
    if (paymentId) {
      const payment = await Payment.findOne({
        where: { paymentId }
      });
      
      if (payment) {
        return res.json({ 
          success: true, 
          data: payment 
        });
      }
    }
    
    res.json({ 
      success: false, 
      message: 'Payment not found' 
    });
  } catch (error) {
    console.error('GET Callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

