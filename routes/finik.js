const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createPayment, verifyWebhookSignature, FINIK_API_URLS } = require('../utils/finikApi');
const { Payment, ApiKey } = require('../models');

/**
 * POST /api/finik/payment
 * Создает платеж в системе Финика
 * 
 * Использует переменные окружения:
 * - FINIK_API_KEY
 * - FINIK_PRIVATE_PEM
 * - FINIK_ACCOUNT_ID
 * - FINIK_ENVIRONMENT (опционально, по умолчанию 'production')
 */
router.post('/payment', async (req, res) => {
  try {
    // Получаем данные из переменных окружения
    const apiKey = process.env.FINIK_API_KEY;
    let privateKeyPem = process.env.FINIK_PRIVATE_PEM;
    const accountId = process.env.FINIK_ACCOUNT_ID;
    const environment = process.env.FINIK_ENVIRONMENT || 'production';

    // Валидация обязательных переменных окружения
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'FINIK_API_KEY не установлен в переменных окружения'
      });
    }

    if (!privateKeyPem) {
      return res.status(500).json({
        success: false,
        error: 'FINIK_PRIVATE_PEM не установлен в переменных окружения'
      });
    }

    // Нормализация приватного ключа
    // Заменяем \n на реальные переносы строк и убираем лишние пробелы
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();
    
    // Проверяем формат ключа
    if (!privateKeyPem.includes('BEGIN PRIVATE KEY') && !privateKeyPem.includes('BEGIN RSA PRIVATE KEY')) {
      return res.status(500).json({
        success: false,
        error: 'FINIK_PRIVATE_PEM имеет неверный формат. Должен быть PEM формат с BEGIN PRIVATE KEY или BEGIN RSA PRIVATE KEY'
      });
    }

    if (!accountId) {
      return res.status(500).json({
        success: false,
        error: 'FINIK_ACCOUNT_ID не установлен в переменных окружения'
      });
    }

    // Получаем параметры из тела запроса
    const {
      amount,
      redirectUrl,
      merchantCategoryCode = '0742',
      name_en,
      webhookUrl,
      description,
      startDate,
      endDate
    } = req.body;

    // Валидация обязательных параметров
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount обязателен и должен быть больше 0'
      });
    }

    if (!redirectUrl) {
      return res.status(400).json({
        success: false,
        error: 'redirectUrl обязателен'
      });
    }

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'webhookUrl обязателен'
      });
    }

    if (!name_en) {
      return res.status(400).json({
        success: false,
        error: 'name_en обязателен'
      });
    }

    // Генерируем PaymentId (UUID v4)
    const paymentId = uuidv4();

    // Создаем платеж через API Финика
    const result = await createPayment({
      amount: parseFloat(amount),
      paymentId: paymentId,
      redirectUrl: redirectUrl,
      accountId: accountId,
      merchantCategoryCode: merchantCategoryCode,
      name_en: name_en,
      webhookUrl: webhookUrl,
      description: description || null,
      startDate: startDate ? parseInt(startDate) : undefined,
      endDate: endDate ? parseInt(endDate) : undefined,
      apiKey: apiKey,
      privateKey: privateKeyPem,
      environment: environment
    });

    if (result.success) {
      // Возвращаем paymentUrl для фронтенда
      res.status(200).json({
        success: true,
        paymentUrl: result.paymentUrl,
        paymentId: result.paymentId
      });
    } else {
      res.status(result.statusCode || 400).json({
        success: false,
        error: result.error,
        paymentId: result.paymentId
      });
    }
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

