/**
 * Извлекает публичный ключ из приватного ключа (файл privat1)
 * и сохраняет его в файл publ1
 * 
 * Запуск: node utils/extractPublicKey.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadPrivateKey } = require('./loadPrivateKey');

console.log('═══════════════════════════════════════════════════════');
console.log('🔑 ИЗВЛЕЧЕНИЕ ПУБЛИЧНОГО КЛЮЧА ИЗ ПРИВАТНОГО');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Загружаем приватный ключ из файла privat1
  const privateKeyPem = loadPrivateKey();
  
  console.log('✅ Приватный ключ загружен из файла privat1');
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

  // Сохраняем публичный ключ в файл publ1
  const publicKeyPath = path.resolve(process.cwd(), 'publ1');
  fs.writeFileSync(publicKeyPath, publicKeyPem, 'utf8');
  console.log(`✅ Публичный ключ сохранен в файл: publ1`);
  console.log(`   Путь: ${publicKeyPath}\n`);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 ПУБЛИЧНЫЙ КЛЮЧ (отправьте этот ключ в Финик):');
  console.log('═══════════════════════════════════════════════════════');
  console.log(publicKeyPem);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('💡 ИНСТРУКЦИЯ:');
  console.log('   1. Скопируйте публичный ключ выше (или из файла publ1)');
  console.log('   2. Отправьте его в поддержку Финика');
  console.log('   3. Укажите, что это для PRODUCTION окружения');
  console.log('   4. После получения API ключа и AccountId, добавьте их в .env:');
  console.log('      FINIK_API_KEY=ваш_api_ключ');
  console.log('      FINIK_ACCOUNT_ID=ваш_account_id');
  console.log('═══════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.error('');
  console.error('💡 Проверьте:');
  console.error('   1. Файл privat1 существует в корне проекта');
  console.error('   2. Формат ключа правильный (PEM)');
  console.error('   3. Права на запись в директорию проекта (для сохранения publ1)');
  process.exit(1);
}

