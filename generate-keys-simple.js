/**
 * Простой скрипт для генерации пары ключей priv1.pem и publ1.pem
 * 
 * Запуск: node generate-keys-simple.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('🔑 ГЕНЕРАЦИЯ ПАРЫ КЛЮЧЕЙ');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Генерируем пару ключей
  console.log('Генерация RSA ключей (2048 бит)...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Сохраняем приватный ключ
  const privateKeyPath = path.join(process.cwd(), 'priv1.pem');
  fs.writeFileSync(privateKeyPath, privateKey);
  console.log('✅ Приватный ключ сохранен: priv1.pem');
  
  // Устанавливаем права доступа (только для Unix-систем)
  if (process.platform !== 'win32') {
    fs.chmodSync(privateKeyPath, 0o600);
    console.log('✅ Права доступа установлены: 600 (только владелец может читать)');
  }

  // Сохраняем публичный ключ
  const publicKeyPath = path.join(process.cwd(), 'publ1.pem');
  fs.writeFileSync(publicKeyPath, publicKey);
  console.log('✅ Публичный ключ сохранен: publ1.pem');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 ПУБЛИЧНЫЙ КЛЮЧ (отправьте этот ключ в Финик):');
  console.log('═══════════════════════════════════════════════════════');
  console.log(publicKey);
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n💡 ИНСТРУКЦИЯ:');
  console.log('   1. Скопируйте публичный ключ выше');
  console.log('   2. Отправьте его в поддержку Финика');
  console.log('   3. Укажите, что это для PRODUCTION окружения');
  console.log('   4. Укажите ваш AccountId и API Key');
  console.log('   5. Ключи сохранены в файлах:');
  console.log('      - priv1.pem (приватный - НЕ ПЕРЕДАВАЙТЕ НИКОМУ!)');
  console.log('      - publ1.pem (публичный - отправьте в Финик)');
  console.log('═══════════════════════════════════════════════════════\n');

} catch (error) {
  console.error('❌ Ошибка генерации ключей:', error.message);
  process.exit(1);
}

