const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const callbackRoutes = require('./routes/callback');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Callback Routes
app.use('/callback', callbackRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Проверка подключения к БД и синхронизация
sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено успешно.');
    
    // Синхронизация моделей с БД (создание таблиц, если их нет)
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('✅ Модели синхронизированы с базой данных.');
    
    // Запуск сервера
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Сервер запущен на http://${process.env.SERVER_IP || 'localhost'}:${PORT}`);
      console.log(`📝 API доступно по адресу: http://${process.env.SERVER_IP || 'localhost'}:${PORT}/api`);
      console.log(`🔔 Callback endpoint: http://${process.env.SERVER_IP || 'localhost'}:${PORT}/callback/finik`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к базе данных:', err);
    process.exit(1);
  });

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message 
  });
});

module.exports = app;

