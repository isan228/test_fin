/**
 * Диагностика проблемы с платежами (status=failed)
 * 
 * Запуск: node utils/diagnosePayment.js
 */

require('dotenv').config();
const { loadPrivateKey } = require('./loadPrivateKey');

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С ПЛАТЕЖАМИ');
console.log('═══════════════════════════════════════════════════════\n');

// Проверка переменных окружения
console.log('1️⃣  ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:');
console.log('─────────────────────────────────────────────────────');

const checks = {
  'FINIK_API_KEY': process.env.FINIK_API_KEY,
  'FINIK_ACCOUNT_ID': process.env.FINIK_ACCOUNT_ID,
  'FINIK_ENVIRONMENT': process.env.FINIK_ENVIRONMENT || 'production',
  'FINIK_PRIVATE_PEM': process.env.FINIK_PRIVATE_PEM ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН'
};

let hasErrors = false;

Object.entries(checks).forEach(([key, value]) => {
  if (!value || value === 'НЕ УСТАНОВЛЕН') {
    console.log(`   ❌ ${key}: НЕ УСТАНОВЛЕН`);
    hasErrors = true;
  } else {
    if (key === 'FINIK_API_KEY') {
      console.log(`   ✅ ${key}: ${value.substring(0, 10)}...${value.substring(value.length - 5)} (${value.length} символов)`);
    } else if (key === 'FINIK_PRIVATE_PEM') {
      console.log(`   ✅ ${key}: ${value}`);
    } else {
      console.log(`   ✅ ${key}: ${value}`);
    }
  }
});

// Проверка приватного ключа
console.log('\n2️⃣  ПРОВЕРКА ПРИВАТНОГО КЛЮЧА:');
console.log('─────────────────────────────────────────────────────');

try {
  const privateKey = loadPrivateKey();
  
  if (!privateKey) {
    console.log('   ❌ Приватный ключ не найден');
    hasErrors = true;
  } else {
    const hasBegin = privateKey.includes('BEGIN PRIVATE KEY') || privateKey.includes('BEGIN RSA PRIVATE KEY');
    const hasEnd = privateKey.includes('END PRIVATE KEY') || privateKey.includes('END RSA PRIVATE KEY');
    
    console.log(`   ${hasBegin ? '✅' : '❌'} Начало ключа: ${hasBegin ? '✅' : '❌'}`);
    console.log(`   ${hasEnd ? '✅' : '❌'} Конец ключа: ${hasEnd ? '✅' : '❌'}`);
    console.log(`   ✅ Длина ключа: ${privateKey.length} символов`);
    
    if (!hasBegin || !hasEnd) {
      hasErrors = true;
    }
    
    // Попытка использовать ключ для подписи
    try {
      const crypto = require('crypto');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update('test');
      sign.end();
      sign.sign(privateKey, 'base64');
      console.log('   ✅ Ключ можно использовать для подписи');
    } catch (signError) {
      console.log(`   ❌ Ошибка использования ключа: ${signError.message}`);
      hasErrors = true;
    }
  }
} catch (keyError) {
  console.log(`   ❌ Ошибка загрузки ключа: ${keyError.message}`);
  hasErrors = true;
}

// Проверка окружения
console.log('\n3️⃣  ПРОВЕРКА ОКРУЖЕНИЯ:');
console.log('─────────────────────────────────────────────────────');

const environment = process.env.FINIK_ENVIRONMENT || 'production';
const apiUrl = environment === 'beta' 
  ? 'https://beta.api.acquiring.averspay.kg'
  : 'https://api.acquiring.averspay.kg';

console.log(`   Окружение: ${environment}`);
console.log(`   API URL: ${apiUrl}`);

if (environment !== 'production' && environment !== 'beta') {
  console.log(`   ⚠️  Неизвестное окружение. Должно быть 'production' или 'beta'`);
  hasErrors = true;
}

// Рекомендации
console.log('\n4️⃣  РЕКОМЕНДАЦИИ:');
console.log('─────────────────────────────────────────────────────');

if (hasErrors) {
  console.log('   ❌ Обнаружены проблемы с конфигурацией!');
  console.log('\n   💡 Что проверить:');
  console.log('      1. Убедитесь, что все переменные установлены в .env');
  console.log('      2. Проверьте правильность FINIK_ACCOUNT_ID');
  console.log('      3. Проверьте правильность FINIK_API_KEY');
  console.log('      4. Убедитесь, что используете правильное окружение');
  console.log('      5. Проверьте, что аккаунт активирован в системе Финика');
  console.log('      6. Убедитесь, что публичный ключ зарегистрирован в Финике');
} else {
  console.log('   ✅ Базовая конфигурация выглядит правильно');
  console.log('\n   💡 Если все равно получаете status=failed:');
  console.log('      1. Проверьте логи сервера: pm2 logs finik-api');
  console.log('      2. Свяжитесь с поддержкой Финика');
  console.log('      3. Убедитесь, что аккаунт активирован');
  console.log('      4. Проверьте соответствие публичного ключа');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('📋 Для детальной диагностики проверьте логи сервера:');
console.log('   pm2 logs finik-api --lines 100');
console.log('═══════════════════════════════════════════════════════\n');

