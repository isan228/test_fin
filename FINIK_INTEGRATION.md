# Finik Payment System Integration

Полная интеграция с системой оплаты Финик без использования приватных npm пакетов.

## Архитектура

### Компоненты

1. **utils/finikSigner.js** - Реализация RSA-SHA256 подписи
   - `buildCanonicalString()` - Строит каноническую строку для подписи
   - `signRequest()` - Генерирует подпись для исходящих запросов
   - `verifySignature()` - Проверяет подпись входящих webhook'ов

2. **utils/finikApi.js** - API клиент для Финика
   - `createPayment()` - Создает платеж в системе Финика
   - `verifyWebhookSignature()` - Проверяет подпись webhook'а

3. **routes/finik.js** - Endpoint для создания платежей
   - `POST /api/finik/payment` - Создает платеж используя переменные окружения

4. **routes/webhooks.js** - Endpoint для обработки webhook'ов
   - `POST /webhooks/finik` - Обрабатывает статус платежа от Финика

## Алгоритм подписи

Подпись генерируется согласно документации Финика:

```
canonical = lowercase(method) + "\n"
          + absolutePath + "\n"
          + sortedHeaders + "\n"
          + sortedQueryParams + "\n"
          + sortedJsonBody
```

Где:
- **method** - HTTP метод в нижнем регистре (post, get, etc.)
- **absolutePath** - Абсолютный путь без query string (например, `/v1/payment`)
- **sortedHeaders** - Заголовки `host` и все `x-api-*`, отсортированные по имени, в формате `key:value&key:value`
- **sortedQueryParams** - Query параметры отсортированные и URL-encoded
- **sortedJsonBody** - JSON тело с отсортированными ключами (compact, без пробелов)

Подпись: RSA-SHA256(canonical) → Base64

## Переменные окружения

Создайте файл `.env` на основе `env.example`:

```bash
# Обязательные для работы с Фиником
FINIK_API_KEY=your_api_key_from_finik
FINIK_PRIVATE_PEM=-----BEGIN PRIVATE KEY-----
Your private key here
-----END PRIVATE KEY-----
FINIK_ACCOUNT_ID=your_account_id_from_finik

# Окружение (production или beta)
FINIK_ENVIRONMENT=production
```

### Получение ключей

1. **Генерация приватного/публичного ключа:**
   ```bash
   openssl genrsa -out finik_private.pem 2048
   openssl rsa -in finik_private.pem -pubout > finik_public.pem
   ```

2. **Отправьте публичный ключ** представителям Финика через безопасный канал

3. **Получите от Финика:**
   - `FINIK_API_KEY` - API ключ
   - `FINIK_ACCOUNT_ID` - ID корпоративного аккаунта

## API Endpoints

### POST /api/finik/payment

Создает платеж в системе Финика.

**Request Body:**
```json
{
  "amount": 100,
  "redirectUrl": "https://example.com/success",
  "webhookUrl": "https://example.com/webhooks/finik",
  "merchantCategoryCode": "0742",
  "name_en": "Test Payment",
  "description": "Optional description",
  "startDate": 1737369000000,
  "endDate": 1737455400000
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentUrl": "https://qr.finik/...",
  "paymentId": "uuid-v4"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "paymentId": "uuid-v4"
}
```

**Особенности:**
- Использует переменные окружения для авторизации
- Генерирует PaymentId (UUID v4) автоматически
- НЕ следует редиректу 302, возвращает URL из Location header
- Подпись генерируется автоматически

### POST /webhooks/finik

Обрабатывает webhook от Финика о статусе платежа.

**Request Headers:**
```
signature: Base64 signature
x-api-timestamp: Unix timestamp in milliseconds
x-api-key: API key (optional)
```

**Request Body:**
```json
{
  "id": "transaction-id-15423_CREDIT",
  "transactionId": "transaction-id-241234",
  "status": "SUCCEEDED",
  "amount": 100,
  "net": 100,
  "accountId": "your-account-id",
  "fields": {
    "amount": 100
  },
  "requestDate": 1737369012345,
  "transactionDate": 1737369012345,
  "transactionType": "DEBIT",
  "receiptNumber": "some-number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed",
  "transactionId": "transaction-id-241234"
}
```

**Особенности:**
- Проверяет подпись с использованием публичного ключа Финика
- Валидирует timestamp (±5 минут)
- Обеспечивает идемпотентность через transactionId
- Отвечает 200 OK быстро (тяжелая работа асинхронно)

## Примеры использования

### Создание платежа (cURL)

```bash
curl -X POST http://localhost:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "redirectUrl": "https://example.com/success",
    "webhookUrl": "https://example.com/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment"
  }'
```

### Создание платежа (JavaScript)

```javascript
const response = await fetch('http://localhost:3000/api/finik/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    redirectUrl: 'https://example.com/success',
    webhookUrl: 'https://example.com/webhooks/finik',
    merchantCategoryCode: '0742',
    name_en: 'Test Payment'
  })
});

const data = await response.json();
if (data.success) {
  // Перенаправить пользователя на data.paymentUrl
  window.location.href = data.paymentUrl;
}
```

## Безопасность

1. **Храните секреты в переменных окружения** - никогда не коммитьте `.env` файл
2. **Проверяйте подпись webhook'ов** - всегда проверяйте подпись перед обработкой
3. **Валидируйте timestamp** - защита от replay атак
4. **Идемпотентность** - обрабатывайте webhook'и идемпотентно по transactionId
5. **HTTPS в продакшене** - используйте HTTPS для всех endpoints

## Отладка

### Проверка подписи

Для отладки можно вывести каноническую строку:

```javascript
const { buildCanonicalString } = require('./utils/finikSigner');
const canonical = buildCanonicalString(requestData);
console.log('Canonical string:', canonical);
```

### Логирование

Включите детальное логирование в `routes/webhooks.js` и `routes/finik.js` для отладки.

## Troubleshooting

### Ошибка "Invalid signature"

- Проверьте, что все заголовки включены в каноническую строку
- Убедитесь, что JSON body отсортирован правильно
- Проверьте формат приватного ключа (PEM)

### Ошибка "Invalid timestamp"

- Проверьте синхронизацию времени сервера
- Убедитесь, что timestamp в миллисекундах

### Получение HTML вместо JSON

- Убедитесь, что `maxRedirects: 0` установлен в axios
- Проверьте, что вы читаете Location header из 302 ответа

## Production Checklist

- [ ] Установлены все переменные окружения
- [ ] Приватный ключ хранится безопасно
- [ ] Webhook endpoint доступен из интернета
- [ ] Используется HTTPS
- [ ] Настроен мониторинг ошибок
- [ ] Логирование настроено
- [ ] Тестирование на beta окружении пройдено



