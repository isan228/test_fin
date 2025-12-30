const express = require('express');
const router = express.Router();
const { ApiKey, Payment } = require('../models');
const crypto = require('crypto');
const { generateKeyPair } = require('../utils/keyGenerator');
const { v4: uuidv4 } = require('uuid');

// Получить все API ключи
router.get('/keys', async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить один API ключ
router.get('/keys/:id', async (req, res) => {
  try {
    const key = await ApiKey.findByPk(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: 'Ключ не найден' });
    }
    res.json({ success: true, data: key });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создать новый API ключ
router.post('/keys', async (req, res) => {
  try {
    const { name, publicKey, privateKey, description } = req.body;

    if (!name || !publicKey || !privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать name, publicKey и privateKey'
      });
    }

    const apiKey = await ApiKey.create({
      name,
      publicKey,
      privateKey,
      description: description || null,
      isActive: true
    });

    res.status(201).json({ success: true, data: apiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Обновить API ключ
router.put('/keys/:id', async (req, res) => {
  try {
    const { name, publicKey, privateKey, description, isActive } = req.body;
    const key = await ApiKey.findByPk(req.params.id);

    if (!key) {
      return res.status(404).json({ success: false, error: 'Ключ не найден' });
    }

    await key.update({
      name: name || key.name,
      publicKey: publicKey || key.publicKey,
      privateKey: privateKey || key.privateKey,
      description: description !== undefined ? description : key.description,
      isActive: isActive !== undefined ? isActive : key.isActive
    });

    res.json({ success: true, data: key });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить API ключ
router.delete('/keys/:id', async (req, res) => {
  try {
    const key = await ApiKey.findByPk(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: 'Ключ не найден' });
    }

    await key.destroy();
    res.json({ success: true, message: 'Ключ удален' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить все платежи
router.get('/payments', async (req, res) => {
  try {
    const { paymentId } = req.query;
    
    let where = {};
    if (paymentId) {
      where.paymentId = paymentId;
    }
    
    const payments = await Payment.findAll({
      where: where,
      include: [{
        model: ApiKey,
        as: 'apiKey',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить платеж по ID
router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: ApiKey,
        as: 'apiKey'
      }]
    });
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Платеж не найден' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Генерация пары ключей (открытый/закрытый)
router.post('/keys/generate', async (req, res) => {
  try {
    const keyPair = generateKeyPair();
    res.json({ 
      success: true, 
      data: {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создать API ключ от Финика
router.post('/keys/create-finik', async (req, res) => {
  try {
    const { name, publicKey, privateKey, callbackUrl, finikApiKey, accountId, environment, description } = req.body;

    if (!name || !publicKey || !privateKey || !callbackUrl) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать name, publicKey, privateKey и callbackUrl'
      });
    }

    // Сохраняем ключи в БД
    const apiKey = await ApiKey.create({
      name,
      publicKey,
      privateKey,
      callbackUrl,
      finikApiKey: finikApiKey || null,
      accountId: accountId || null,
      environment: environment || 'production',
      description: description || null,
      isActive: true
    });

    res.status(201).json({ 
      success: true, 
      data: apiKey,
      message: 'API ключ успешно создан. Убедитесь, что вы отправили публичный ключ представителям Финика для получения API ключа и accountId.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создать тестовый платеж
router.post('/payments/test', async (req, res) => {
  try {
    const { 
      apiKeyId, 
      amount, 
      redirectUrl, 
      merchantCategoryCode = '0742',
      name_en,
      description,
      startDate,
      endDate
    } = req.body;

    if (!apiKeyId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать apiKeyId и amount'
      });
    }

    const apiKey = await ApiKey.findByPk(apiKeyId);
    if (!apiKey) {
      return res.status(404).json({ success: false, error: 'API ключ не найден' });
    }

    if (!apiKey.isActive) {
      return res.status(400).json({ success: false, error: 'API ключ неактивен' });
    }

    if (!apiKey.finikApiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'API ключ от Финика не указан. Укажите finikApiKey в настройках ключа.' 
      });
    }

    if (!apiKey.accountId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Account ID не указан. Укажите accountId в настройках ключа.' 
      });
    }

    // Создаем платеж в БД
    const { v4: uuidv4 } = require('uuid');
    const paymentId = uuidv4();
    
    const payment = await Payment.create({
      apiKeyId: apiKey.id,
      paymentId: paymentId,
      amount: parseFloat(amount),
      currency: 'KGS', // Валюта Кыргызстана
      status: 'pending',
      callbackData: { description: description || 'Тестовый платеж' }
    });

    // Создаем платеж через API Финика
    const { createPayment } = require('../utils/finikApi');
    
    try {
      const result = await createPayment({
        amount: parseFloat(amount),
        paymentId: paymentId,
        redirectUrl: redirectUrl || apiKey.callbackUrl || `http://2.56.179.126:3000/callback/finik`,
        accountId: apiKey.accountId,
        merchantCategoryCode: merchantCategoryCode,
        name_en: name_en || apiKey.name || 'Test Payment',
        webhookUrl: apiKey.callbackUrl || `http://2.56.179.126:3000/callback/finik`,
        description: description || null,
        startDate: startDate ? parseInt(startDate) : undefined,
        endDate: endDate ? parseInt(endDate) : undefined,
        apiKey: apiKey.finikApiKey,
        privateKey: apiKey.privateKey,
        environment: apiKey.environment || 'production'
      });

      if (result.success) {
        // Обновляем платеж данными от Финика
        await payment.update({
          callbackData: {
            ...payment.callbackData,
            paymentUrl: result.paymentUrl,
            finikResponse: result
          }
        });

        res.status(201).json({ 
          success: true, 
          data: payment,
          paymentUrl: result.paymentUrl,
          message: 'Платеж успешно создан в Финике'
        });
      } else {
        // Обновляем платеж с ошибкой
        await payment.update({
          status: 'failed',
          callbackData: {
            ...payment.callbackData,
            error: result.error,
            statusCode: result.statusCode
          }
        });

        res.status(400).json({ 
          success: false, 
          error: result.error,
          statusCode: result.statusCode,
          data: payment
        });
      }
    } catch (finikError) {
      console.error('Ошибка при создании платежа в Финике:', finikError);
      await payment.update({
        status: 'failed',
        callbackData: {
          ...payment.callbackData,
          error: finikError.message
        }
      });

      res.status(500).json({ 
        success: false, 
        error: 'Ошибка при создании платежа в Финике: ' + finikError.message,
        data: payment
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
