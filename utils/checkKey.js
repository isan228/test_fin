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
  
  if (privateKeyPem.length < 100) {
    console.warn('\n⚠️  ВНИМАНИЕ: Ключ слишком короткий!');
    console.warn('Полный ключ должен быть около 1700-1800 символов.');
    console.warn('Похоже, что в .env указана только первая строка ключа.');
    console.warn('\nРешение:');
    console.warn('1. Откройте файл finik_private.pem (или сгенерируйте новый)');
    console.warn('2. Скопируйте ВСЁ содержимое файла (включая BEGIN и END)');
    console.warn('3. Вставьте в .env с кавычками и реальными переносами строк');
  }
  
  console.log('\nПервые 50 символов:', privateKeyPem.substring(0, 50));
  console.log('Последние 50 символов:', privateKeyPem.substring(Math.max(0, privateKeyPem.length - 50)));
  
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
    
    // Пробуем напрямую
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(testString, 'utf8');
      sign.end();
      const signature = sign.sign(normalized, 'base64');
      
      console.log('\n✅ Ключ успешно использован для подписи!');
      console.log('Тестовая подпись (первые 20 символов):', signature.substring(0, 20) + '...');
      return true;
    } catch (directError) {
      // Пробуем через createPrivateKey
      console.log('\nПопытка через createPrivateKey...');
      
      try {
        // Сначала пробуем pkcs8 (для BEGIN PRIVATE KEY)
        const privateKey = crypto.createPrivateKey({
          key: normalized,
          format: 'pem',
          type: 'pkcs8'
        });
        
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(testString, 'utf8');
        sign.end();
        const signature = sign.sign(privateKey, 'base64');
        
        console.log('\n✅ Ключ успешно использован для подписи (через createPrivateKey pkcs8)!');
        console.log('Тестовая подпись (первые 20 символов):', signature.substring(0, 20) + '...');
        return true;
      } catch (pkcs8Error) {
        // Пробуем pkcs1 (для BEGIN RSA PRIVATE KEY)
        try {
          const privateKey = crypto.createPrivateKey({
            key: normalized,
            format: 'pem',
            type: 'pkcs1'
          });
          
          const sign = crypto.createSign('RSA-SHA256');
          sign.update(testString, 'utf8');
          sign.end();
          const signature = sign.sign(privateKey, 'base64');
          
          console.log('\n✅ Ключ успешно использован для подписи (через createPrivateKey pkcs1)!');
          console.log('Тестовая подпись (первые 20 символов):', signature.substring(0, 20) + '...');
          return true;
        } catch (pkcs1Error) {
          throw directError; // Выбрасываем оригинальную ошибку
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Ошибка при использовании ключа:');
    console.error('Тип ошибки:', error.name);
    console.error('Сообщение:', error.message);
    
    // Проверяем формат ключа
    console.log('\nАнализ ключа:');
    const lines = normalized.split('\n');
    console.log('Количество строк:', lines.length);
    console.log('Первая строка:', lines[0]);
    console.log('Последняя строка:', lines[lines.length - 1]);
    
    if (normalized.includes('BEGIN RSA PRIVATE KEY')) {
      console.log('Тип ключа: RSA PRIVATE KEY (pkcs1)');
    } else if (normalized.includes('BEGIN PRIVATE KEY')) {
      console.log('Тип ключа: PRIVATE KEY (pkcs8)');
    }
    
    if (error.message.includes('DECODER')) {
      console.error('\n💡 Решение:');
      console.error('1. Убедитесь, что ключ в .env файле использует РЕАЛЬНЫЕ переносы строк (Enter)');
      console.error('2. Или используйте \\n в одной строке с кавычками: FINIK_PRIVATE_PEM="...\\n...\\n..."');
      console.error('3. Проверьте, что нет лишних пробелов в начале/конце');
      console.error('4. Убедитесь, что ключ скопирован полностью (включая все строки между BEGIN и END)');
      console.error('\nПопробуйте пересоздать ключ:');
      console.error('  openssl genrsa -out finik_private.pem 2048');
      console.error('Затем скопируйте ВСЁ содержимое файла в .env');
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

