/**
 * Тестовый скрипт для проверки формата подписи
 * 
 * Запуск: node utils/testSignature.js
 */

require('dotenv').config();
const { buildCanonicalString, signRequest } = require('./finikSigner');
const { loadPrivateKey } = require('./loadPrivateKey');

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 ТЕСТИРОВАНИЕ ФОРМАТА ПОДПИСИ');
console.log('═══════════════════════════════════════════════════════\n');

// Тестовые данные
const testData = {
  httpMethod: 'POST',
  path: '/payment',
  headers: {
    Host: 'api.acquiring.averspay.kg',
    'x-api-key': process.env.FINIK_API_KEY || 'test-api-key',
    'x-api-timestamp': Date.now().toString()
  },
  queryStringParameters: undefined,
  body: {
    Amount: 100,
    CardType: 'FINIK_QR',
    PaymentId: 'test-payment-id',
    RedirectUrl: 'https://example.com/success',
    Data: {
      accountId: process.env.FINIK_ACCOUNT_ID || 'test-account-id',
      merchantCategoryCode: '0742',
      name_en: 'Test Payment',
      webhookUrl: 'https://example.com/webhook'
    }
  }
};

console.log('1️⃣  ТЕСТОВЫЕ ДАННЫЕ:');
console.log('─────────────────────────────────────────────────────');
console.log('Path:', testData.path);
console.log('Host:', testData.headers.Host);
console.log('x-api-key:', testData.headers['x-api-key'].substring(0, 10) + '...');
console.log('x-api-timestamp:', testData.headers['x-api-timestamp']);
console.log('Body:', JSON.stringify(testData.body, null, 2));

console.log('\n2️⃣  КАНОНИЧЕСКАЯ СТРОКА:');
console.log('─────────────────────────────────────────────────────');
const canonicalString = buildCanonicalString(testData);
console.log('Каноническая строка (с видимыми переносами строк):');
console.log('─────────────────────────────────────────────────────');
console.log(JSON.stringify(canonicalString));
console.log('─────────────────────────────────────────────────────');
console.log('Каноническая строка (как текст):');
console.log('─────────────────────────────────────────────────────');
console.log(canonicalString);
console.log('─────────────────────────────────────────────────────');

// Разбиваем по частям для проверки
const parts = canonicalString.split('\n');
console.log('\nЧасти канонической строки:');
parts.forEach((part, index) => {
  console.log(`   ${index + 1}. [${part.length} символов] ${JSON.stringify(part)}`);
});

console.log('\n3️⃣  ГЕНЕРАЦИЯ ПОДПИСИ:');
console.log('─────────────────────────────────────────────────────');

try {
  const privateKey = loadPrivateKey();
  const signature = signRequest(testData, privateKey);
  
  console.log('✅ Подпись сгенерирована успешно');
  console.log('   Длина подписи:', signature.length, 'символов');
  console.log('   Первые 50 символов:', signature.substring(0, 50) + '...');
  
  console.log('\n4️⃣  ПРОВЕРКА ФОРМАТА:');
  console.log('─────────────────────────────────────────────────────');
  
  // Проверяем формат канонической строки
  const expectedFormat = [
    'post',                    // 1. lowercase method
    '/payment',                // 2. path
    'host:...&x-api-key:...&x-api-timestamp:...', // 3. headers
    '',                        // 4. query params (пусто)
    '{"Amount":100,...}'       // 5. body
  ];
  
  console.log('Ожидаемый формат:');
  expectedFormat.forEach((part, index) => {
    const actual = parts[index] || '';
    let match = false;
    
    if (index === 0) {
      match = actual === 'post';
    } else if (index === 1) {
      match = actual === '/payment';
    } else if (index === 2) {
      match = actual.includes('host:') && actual.includes('x-api-key:');
    } else if (index === 3) {
      match = actual === '';
    } else if (index === 4) {
      match = actual.startsWith('{');
    }
    
    console.log(`   ${index + 1}. ${match ? '✅' : '❌'} ${part.substring(0, 50)}...`);
    if (!match) {
      console.log(`      Фактически: ${JSON.stringify(actual)}`);
    }
  });
  
} catch (error) {
  console.error('❌ Ошибка генерации подписи:', error.message);
  console.error('   Проверьте приватный ключ: npm run check-key');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('💡 Если подпись генерируется, но Финик возвращает 403:');
console.log('   1. Проверьте, что каноническая строка соответствует документации Финика');
console.log('   2. Проверьте правильность API Key и AccountId');
console.log('   3. Проверьте, что аккаунт активирован');
console.log('   4. Свяжитесь с поддержкой Финика с этой канонической строкой');
console.log('═══════════════════════════════════════════════════════\n');

