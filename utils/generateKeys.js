/**
 * Генерирует пару RSA ключей и сохраняет их в файлы privat1 и publ1
 * 
 * Запуск: node utils/generateKeys.js
 */

const fs = require('fs');
const path = require('path');
const { generateKeyPair } = require('./keyGenerator');
const crypto = require('crypto');

console.log('═══════════════════════════════════════════════════════');
console.log('🔑 ГЕНЕРАЦИЯ ПАРЫ RSA КЛЮЧЕЙ ДЛЯ FINIK');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Генерируем пару ключей
  console.log('⏳ Генерация ключей...');
  const keyPair = generateKeyPair();
  console.log('✅ Ключи успешно сгенерированы!\n');

  // Пути к файлам
  const privateKeyPath = path.resolve(process.cwd(), 'privat1');
  const publicKeyPath = path.resolve(process.cwd(), 'publ1');

  // Сохраняем приватный ключ
  fs.writeFileSync(privateKeyPath, keyPair.privateKey, 'utf8');
  console.log(`✅ Приватный ключ сохранен в: privat1`);
  console.log(`   Путь: ${privateKeyPath}\n`);

  // Сохраняем публичный ключ
  fs.writeFileSync(publicKeyPath, keyPair.publicKey, 'utf8');
  console.log(`✅ Публичный ключ сохранен в: publ1`);
  console.log(`   Путь: ${publicKeyPath}\n`);

  // Проверяем, что ключи можно загрузить
  console.log('🔍 Проверка ключей...');
  
  // Проверяем приватный ключ
  try {
    const privateKey = crypto.createPrivateKey({
      key: keyPair.privateKey,
      format: 'pem'
    });
    console.log('✅ Приватный ключ валиден');
  } catch (error) {
    try {
      const privateKey = crypto.createPrivateKey({
        key: keyPair.privateKey,
        format: 'pem',
        type: 'pkcs1'
      });
      console.log('✅ Приватный ключ валиден (pkcs1)');
    } catch (pkcs1Error) {
      throw new Error(`Ошибка проверки приватного ключа: ${error.message}`);
    }
  }

  // Извлекаем публичный ключ из приватного для проверки
  try {
    const privateKey = crypto.createPrivateKey({
      key: keyPair.privateKey,
      format: 'pem'
    });
    const extractedPublicKey = crypto.createPublicKey(privateKey);
    const extractedPublicKeyPem = extractedPublicKey.export({
      type: 'spki',
      format: 'pem'
    });
    
    if (extractedPublicKeyPem === keyPair.publicKey) {
      console.log('✅ Публичный ключ соответствует приватному');
    } else {
      console.log('⚠️  Публичный ключ не соответствует приватному (но это может быть нормально)');
    }
  } catch (error) {
    console.log('⚠️  Не удалось проверить соответствие ключей:', error.message);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 ПУБЛИЧНЫЙ КЛЮЧ (отправьте этот ключ в Финик):');
  console.log('═══════════════════════════════════════════════════════');
  console.log(keyPair.publicKey);
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
  console.error('   1. Права на запись в директорию проекта');
  console.error('   2. Достаточно места на диске');
  process.exit(1);
}

