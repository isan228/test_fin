const express = require('express');
const router = express.Router();
const { ApiKey, Payment } = require('../models');
const crypto = require('crypto');
const { generateKeyPair } = require('../utils/keyGenerator');
const axios = require('axios');

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
    const payments = await Payment.findAll({
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
    const { name, publicKey, privateKey, callbackUrl, description } = req.body;

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
      description: description || null,
      isActive: true
    });

    // Здесь будет запрос к API Финика для создания API ключа
    // Пока просто сохраняем данные, после получения документации добавим реальный запрос
    const finikApiUrl = process.env.FINIK_API_URL || 'https://api.finik.ru';
    
    try {
      // Пример запроса (нужно будет обновить согласно документации Финика)
      const response = await axios.post(`${finikApiUrl}/api/keys`, {
        name: name,
        publicKey: publicKey,
        callbackUrl: callbackUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Обновляем запись с полученным API ключом от Финика
      if (response.data && response.data.apiKey) {
        await apiKey.update({
          finikApiKey: response.data.apiKey
        });
      }

      res.status(201).json({ 
        success: true, 
        data: {
          ...apiKey.toJSON(),
          finikApiKey: response.data?.apiKey || null
        },
        message: 'API ключ успешно создан'
      });
    } catch (finikError) {
      // Если запрос к Финику не удался, все равно сохраняем ключи
      console.error('Ошибка при создании ключа в Финике:', finikError.message);
      res.status(201).json({ 
        success: true, 
        data: apiKey,
        warning: 'Ключи сохранены локально, но не удалось создать ключ в Финике. Проверьте настройки API.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Создать тестовый платеж
router.post('/payments/test', async (req, res) => {
  try {
    const { apiKeyId, amount, currency = 'RUB', description } = req.body;

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

    // Создаем платеж в БД
    const paymentId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = await Payment.create({
      apiKeyId: apiKey.id,
      paymentId: paymentId,
      amount: parseFloat(amount),
      currency: currency,
      status: 'pending',
      callbackData: { description: description || 'Тестовый платеж' }
    });

    // Здесь будет запрос к API Финика для создания платежа
    // Пока просто возвращаем созданный платеж
    const finikApiUrl = process.env.FINIK_API_URL || 'https://api.finik.ru';
    
    try {
      // Пример запроса (нужно будет обновить согласно документации Финика)
      const response = await axios.post(`${finikApiUrl}/api/payments`, {
        amount: amount,
        currency: currency,
        description: description || 'Тестовый платеж',
        callbackUrl: apiKey.callbackUrl,
        paymentId: paymentId
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey.finikApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Обновляем платеж данными от Финика
      if (response.data) {
        await payment.update({
          status: response.data.status || 'pending',
          callbackData: response.data
        });
      }

      res.status(201).json({ 
        success: true, 
        data: payment,
        finikResponse: response.data
      });
    } catch (finikError) {
      // Если запрос к Финику не удался, все равно возвращаем созданный платеж
      console.error('Ошибка при создании платежа в Финике:', finikError.message);
      res.status(201).json({ 
        success: true, 
        data: payment,
        warning: 'Платеж создан локально, но не удалось отправить в Финик. Проверьте настройки API.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
