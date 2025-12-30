const crypto = require('crypto');
require('dotenv').config();

/**
 * Утилита для проверки формата приватного ключа
 */
function checkPrivateKey() {
  console.log('=== Проверка приватного ключа ===\n');
  
  const privateKeyPem = process.env.FINIK_PRIVATE_PEM;
  
  if (!privateKeyPem) {
    console.error('❌ FINIK_PRIVATE_PEM не установлен в переменных окружения');
    return false;
  }
  
  console.log('✅ FINIK_PRIVATE_PEM найден');
  console.log('Длина ключа:', privateKeyPem.length, 'символов');
  console.log('\nПервые 50 символов:', privateKeyPem.substring(0, 50));
  console.log('Последние 50 символов:', privateKeyPem.substring(privateKeyPem.length - 50));
  
  // Нормализация
  const normalized = privateKeyPem.replace(/\\n/g, '\n').trim();
  console.log('\nПосле нормализации:');
  console.log('Длина:', normalized.length, 'символов');
  
  // Проверка формата
  const hasBegin = normalized.includes('BEGIN PRIVATE KEY') || normalized.includes('BEGIN RSA PRIVATE KEY');
  const hasEnd = normalized.includes('END PRIVATE KEY') || normalized.includes('END RSA PRIVATE KEY');
  
  console.log('\nПроверка формата:');
  console.log('Начало ключа:', hasBegin ? '✅' : '❌');
  console.log('Конец ключа:', hasEnd ? '✅' : '❌');
  
  if (!hasBegin || !hasEnd) {
    console.error('\n❌ Ключ имеет неверный формат!');
    console.log('Ожидается: -----BEGIN PRIVATE KEY----- или -----BEGIN RSA PRIVATE KEY-----');
    return false;
  }
  
  // Попытка использовать ключ
  try {
    const testString = 'test';
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(testString, 'utf8');
    sign.end();
    const signature = sign.sign(normalized, 'base64');
    
    console.log('\n✅ Ключ успешно использован для подписи!');
    console.log('Тестовая подпись (первые 20 символов):', signature.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('\n❌ Ошибка при использовании ключа:');
    console.error('Тип ошибки:', error.name);
    console.error('Сообщение:', error.message);
    
    if (error.message.includes('DECODER')) {
      console.error('\n💡 Решение:');
      console.error('1. Убедитесь, что ключ в .env файле использует реальные переносы строк');
      console.error('2. Или используйте \\n в одной строке с кавычками');
      console.error('3. Проверьте, что нет лишних пробелов в начале/конце');
    }
    
    return false;
  }
}

// Запуск проверки
if (require.main === module) {
  const result = checkPrivateKey();
  process.exit(result ? 0 : 1);
}

module.exports = { checkPrivateKey };

