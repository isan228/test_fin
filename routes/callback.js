const express = require('express');
const router = express.Router();
const { Payment, ApiKey } = require('../models');
const crypto = require('crypto');

// Callback endpoint для обработки ответов от Финика
router.post('/finik', async (req, res) => {
  try {
    console.log('Callback received from Finik:', JSON.stringify(req.body, null, 2));

    const callbackData = req.body;

    // Здесь нужно будет добавить проверку подписи согласно документации Финика
    // Пока сохраняем данные как есть

    // Ищем платеж по paymentId
    let payment = await Payment.findOne({
      where: { paymentId: callbackData.paymentId || callbackData.id }
    });

    if (payment) {
      // Обновляем существующий платеж
      await payment.update({
        status: callbackData.status || payment.status,
        callbackData: callbackData
      });
    } else {
      // Создаем новый платеж (если callback пришел раньше, чем создание платежа)
      // Нужно будет определить apiKeyId из данных callback
      const defaultApiKey = await ApiKey.findOne({ where: { isActive: true } });
      
      payment = await Payment.create({
        apiKeyId: defaultApiKey ? defaultApiKey.id : 1,
        paymentId: callbackData.paymentId || callbackData.id || crypto.randomUUID(),
        amount: callbackData.amount || 0,
        currency: callbackData.currency || 'RUB',
        status: callbackData.status || 'pending',
        callbackData: callbackData
      });
    }

    // Отправляем ответ Финику (согласно их документации)
    res.json({ 
      success: true, 
      message: 'Callback processed',
      paymentId: payment.paymentId 
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

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

