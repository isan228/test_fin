const fs = require('fs');
const path = require('path');

/**
 * Загружает приватный ключ из файла privat1
 * Приоритет:
 * 1. Из файла privat1 в корне проекта (основной способ)
 * 2. Из файла, указанного в FINIK_PRIVATE_PEM_FILE (для совместимости)
 * 3. Из переменной окружения FINIK_PRIVATE_PEM (fallback)
 */
function loadPrivateKey() {
  // Способ 1: Из файла privat1 (основной способ)
  const keyFile = 'privat1';
  const keyFilePath = path.resolve(process.cwd(), keyFile);
  
  if (fs.existsSync(keyFilePath)) {
    try {
      const keyFromFile = fs.readFileSync(keyFilePath, 'utf8').trim();
      console.log(`✅ Ключ загружен из файла: ${keyFile}`);
      return keyFromFile;
    } catch (error) {
      console.warn(`⚠️  Не удалось прочитать файл ${keyFile}: ${error.message}`);
    }
  }
  
  // Способ 2: Из файла, указанного в переменной окружения (для совместимости)
  const customKeyFile = process.env.FINIK_PRIVATE_PEM_FILE;
  if (customKeyFile) {
    const customKeyFilePath = path.resolve(process.cwd(), customKeyFile);
    if (fs.existsSync(customKeyFilePath)) {
      try {
        const keyFromFile = fs.readFileSync(customKeyFilePath, 'utf8').trim();
        console.log(`✅ Ключ загружен из файла: ${customKeyFile}`);
        return keyFromFile;
      } catch (error) {
        console.warn(`⚠️  Не удалось прочитать файл ${customKeyFile}: ${error.message}`);
      }
    }
  }
  
  // Способ 3: Из переменной окружения (fallback)
  let privateKeyPem = process.env.FINIK_PRIVATE_PEM;
  
  if (!privateKeyPem) {
    throw new Error('Приватный ключ не найден. Создайте файл privat1 в корне проекта или установите FINIK_PRIVATE_PEM в .env');
  }
  
  // Нормализация ключа
  privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();
  
  // Убираем возможные лишние кавычки в начале/конце
  if (privateKeyPem.startsWith('"') && privateKeyPem.endsWith('"')) {
    privateKeyPem = privateKeyPem.slice(1, -1);
  }
  if (privateKeyPem.startsWith("'") && privateKeyPem.endsWith("'")) {
    privateKeyPem = privateKeyPem.slice(1, -1);
  }
  
  return privateKeyPem.trim();
}

module.exports = { loadPrivateKey };




