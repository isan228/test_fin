const fs = require('fs');
const path = require('path');

/**
 * Загружает приватный ключ из переменной окружения или файла
 * Поддерживает несколько способов:
 * 1. Из переменной окружения FINIK_PRIVATE_PEM
 * 2. Из файла, указанного в FINIK_PRIVATE_PEM_FILE
 * 3. Из файла finik_private.pem в корне проекта
 */
function loadPrivateKey() {
  // Способ 1: Из файла (приоритет)
  const keyFile = process.env.FINIK_PRIVATE_PEM_FILE || 'finik_private.pem';
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
  
  // Способ 2: Из переменной окружения
  let privateKeyPem = process.env.FINIK_PRIVATE_PEM;
  
  if (!privateKeyPem) {
    throw new Error('FINIK_PRIVATE_PEM не установлен. Установите переменную окружения или создайте файл finik_private.pem');
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




