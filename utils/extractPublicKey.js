/**
 * Извлекает публичный ключ из приватного ключа
 * Поддерживает priv1.pem (новый) и privat1 (старый)
 * Сохраняет в publ1.pem (новый) или publ1 (старый)
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
  // Загружаем приватный ключ (автоматически найдет priv1.pem или privat1)
  const privateKeyPem = loadPrivateKey();
  
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

  // Сохраняем публичный ключ в файл publ1.pem (новый способ)
  const publicKeyPath = path.resolve(process.cwd(), 'publ1.pem');
  fs.writeFileSync(publicKeyPath, publicKeyPem, 'utf8');
  console.log(`✅ Публичный ключ сохранен в файл: publ1.pem`);
  console.log(`   Путь: ${publicKeyPath}\n`);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 ПУБЛИЧНЫЙ КЛЮЧ (отправьте этот ключ в Финик):');
  console.log('═══════════════════════════════════════════════════════');
  console.log(publicKeyPem);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('💡 ИНСТРУКЦИЯ:');
  console.log('   1. Скопируйте публичный ключ выше (или из файла publ1.pem)');
  console.log('   2. Отправьте его в поддержку Финика');
  console.log('   3. Укажите, что это для PRODUCTION окружения');
  console.log('   4. Укажите AccountId:', process.env.FINIK_ACCOUNT_ID || 'НЕ УСТАНОВЛЕН');
  console.log('\n💾 Альтернатива: Используйте файл publ1.pem:');
  console.log('   cat publ1.pem');
  console.log('═══════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.error('');
  console.error('💡 Проверьте:');
  console.error('   1. Файл priv1.pem или privat1 существует в корне проекта');
  console.error('   2. Формат ключа правильный (PEM)');
  console.error('   3. Права на запись в директорию проекта (для сохранения publ1.pem)');
  process.exit(1);
}

