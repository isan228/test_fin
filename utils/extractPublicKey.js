/**
 * Извлекает публичный ключ из приватного ключа
 * 
 * Запуск: node utils/extractPublicKey.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { loadPrivateKey } = require('./loadPrivateKey');

console.log('═══════════════════════════════════════════════════════');
console.log('🔑 ИЗВЛЕЧЕНИЕ ПУБЛИЧНОГО КЛЮЧА ИЗ ПРИВАТНОГО');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Пробуем загрузить из файла priv1.pem, если есть
  const fs = require('fs');
  const path = require('path');
  const priv1Path = path.resolve(process.cwd(), 'priv1.pem');
  
  let privateKeyPem;
  if (fs.existsSync(priv1Path)) {
    console.log('📁 Используется файл priv1.pem');
    privateKeyPem = fs.readFileSync(priv1Path, 'utf8').trim();
  } else {
    // Загружаем приватный ключ через loadPrivateKey
    privateKeyPem = loadPrivateKey();
  }
  
  console.log('✅ Приватный ключ загружен');
  console.log('   Начало:', privateKeyPem.substring(0, 50) + '...');
  console.log('   Конец:', '...' + privateKeyPem.substring(privateKeyPem.length - 50));
  console.log('');
  
  // Извлекаем публичный ключ
  let publicKeyPem;
  
  try {
    // Пробуем создать приватный ключ и извлечь публичный
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem'
    });
    
    const publicKey = crypto.createPublicKey(privateKey);
    publicKeyPem = publicKey.export({
      type: 'spki',
      format: 'pem'
    });
    
    console.log('✅ Публичный ключ успешно извлечен!\n');
  } catch (error) {
    // Пробуем с типом pkcs1
    try {
      const privateKey = crypto.createPrivateKey({
        key: privateKeyPem,
        format: 'pem',
        type: 'pkcs1'
      });
      
      const publicKey = crypto.createPublicKey(privateKey);
      publicKeyPem = publicKey.export({
        type: 'spki',
        format: 'pem'
      });
      
      console.log('✅ Публичный ключ успешно извлечен (pkcs1)!\n');
    } catch (pkcs1Error) {
      throw new Error(`Ошибка извлечения публичного ключа: ${error.message}. Попробуйте: ${pkcs1Error.message}`);
    }
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 ПУБЛИЧНЫЙ КЛЮЧ (отправьте этот ключ в Финик):');
  console.log('═══════════════════════════════════════════════════════');
  console.log(publicKeyPem);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('💡 ИНСТРУКЦИЯ:');
  console.log('   1. Скопируйте публичный ключ выше');
  console.log('   2. Отправьте его в поддержку Финика');
  console.log('   3. Укажите, что это для PRODUCTION окружения');
  console.log('   4. Укажите AccountId:', process.env.FINIK_ACCOUNT_ID || 'НЕ УСТАНОВЛЕН');
  console.log('\n💾 Альтернатива: Если у вас есть файл publ1.pem, используйте его:');
  console.log('   cat publ1.pem');
  console.log('═══════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.error('');
  console.error('💡 Проверьте:');
  console.error('   1. Приватный ключ установлен в .env (FINIK_PRIVATE_PEM)');
  console.error('   2. Или файл finik_private.pem существует в корне проекта');
  console.error('   3. Формат ключа правильный (PEM)');
  process.exit(1);
}

