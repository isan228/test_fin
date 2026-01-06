const fs = require('fs');
const path = require('path');

/**
 * Загружает приватный ключ из файла
 * Приоритет:
 * 1. Из файла priv1.pem (новый способ)
 * 2. Из файла privat1 (старый способ, для совместимости)
 * 3. Из файла, указанного в FINIK_PRIVATE_PEM_FILE
 * 4. Из переменной окружения FINIK_PRIVATE_PEM (fallback)
 */
function loadPrivateKey() {
  // Способ 1: Из файла priv1.pem (приоритет - новый способ)
  const keyFile1 = 'priv1.pem';
  const keyFilePath1 = path.resolve(process.cwd(), keyFile1);
  
  if (fs.existsSync(keyFilePath1)) {
    try {
      const keyFromFile = fs.readFileSync(keyFilePath1, 'utf8').trim();
      console.log(`✅ Ключ загружен из файла: ${keyFile1}`);
      return keyFromFile;
    } catch (error) {
      console.warn(`⚠️  Не удалось прочитать файл ${keyFile1}: ${error.message}`);
    }
  }
  
  // Способ 2: Из файла privat1 (старый способ, для совместимости)
  const keyFile2 = 'privat1';
  const keyFilePath2 = path.resolve(process.cwd(), keyFile2);
  
  if (fs.existsSync(keyFilePath2)) {
    try {
      const keyFromFile = fs.readFileSync(keyFilePath2, 'utf8').trim();
      console.log(`✅ Ключ загружен из файла: ${keyFile2}`);
      return keyFromFile;
    } catch (error) {
      console.warn(`⚠️  Не удалось прочитать файл ${keyFile2}: ${error.message}`);
    }
  }
  
  // Способ 3: Из файла, указанного в переменной окружения (для совместимости)
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
  
  // Способ 4: Из переменной окружения (fallback)
  let privateKeyPem = process.env.FINIK_PRIVATE_PEM;
  
  if (!privateKeyPem) {
    throw new Error('Приватный ключ не найден. Создайте файл priv1.pem (npm run generate-keys) или установите FINIK_PRIVATE_PEM в .env');
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




