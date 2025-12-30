const express = require('express');
const router = express.Router();
const { ApiKey, Payment } = require('../models');
const crypto = require('crypto');

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

module.exports = router;
