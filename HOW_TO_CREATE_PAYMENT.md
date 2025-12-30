# Как создать платеж в системе Финика

## Шаг 1: Настройка переменных окружения

Создайте файл `.env` в корне проекта (скопируйте из `env.example`):

```bash
# Обязательные переменные для работы с Фиником
FINIK_API_KEY=ваш_api_ключ_от_финика
FINIK_PRIVATE_PEM=-----BEGIN PRIVATE KEY-----
Ваш приватный ключ здесь
-----END PRIVATE KEY-----
FINIK_ACCOUNT_ID=ваш_account_id_от_финика
FINIK_ENVIRONMENT=production
# Используйте 'beta' для тестирования или 'production' для продакшена
```

### Как получить эти данные:

1. **FINIK_API_KEY** и **FINIK_ACCOUNT_ID** - получите от представителей Финика
2. **FINIK_PRIVATE_PEM** - сгенерируйте сами:
   ```bash
   openssl genrsa -out finik_private.pem 2048
   ```
   Затем отправьте публичный ключ Финику:
   ```bash
   openssl rsa -in finik_private.pem -pubout > finik_public.pem
   ```

## Шаг 2: Создание платежа

Есть несколько способов создать платеж:

### Способ 1: Через веб-интерфейс

1. Откройте браузер: `http://2.56.179.126:3000/test-payment`
2. Заполните форму:
   - Сумма платежа (в сомах)
   - Redirect URL (куда перенаправить после оплаты)
   - MCC код (обычно 0742)
   - Название QR кода (на английском)
   - Webhook URL (куда Финик отправит статус)
3. Нажмите "Создать тестовый платеж"
4. Скопируйте полученный `paymentUrl` и откройте его в браузере

### Способ 2: Через API (cURL)

```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment",
    "description": "Тестовый платеж"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "paymentUrl": "https://qr.finik/...",
  "paymentId": "uuid-v4"
}
```

### Способ 3: Через JavaScript (Frontend)

```javascript
async function createPayment() {
  const response = await fetch('http://2.56.179.126:3000/api/finik/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 100,
      redirectUrl: 'http://2.56.179.126:3000/success',
      webhookUrl: 'http://2.56.179.126:3000/webhooks/finik',
      merchantCategoryCode: '0742',
      name_en: 'Test Payment',
      description: 'Тестовый платеж'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Перенаправляем пользователя на страницу оплаты
    window.location.href = data.paymentUrl;
  } else {
    console.error('Ошибка:', data.error);
  }
}
```

### Способ 4: Через Node.js (Backend)

```javascript
const axios = require('axios');

async function createPayment() {
  try {
    const response = await axios.post('http://2.56.179.126:3000/api/finik/payment', {
      amount: 100,
      redirectUrl: 'http://2.56.179.126:3000/success',
      webhookUrl: 'http://2.56.179.126:3000/webhooks/finik',
      merchantCategoryCode: '0742',
      name_en: 'Test Payment',
      description: 'Тестовый платеж'
    });

    console.log('Payment URL:', response.data.paymentUrl);
    return response.data.paymentUrl;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error.message);
  }
}
```

## Параметры запроса

### Обязательные параметры:

- **amount** (Number) - Сумма платежа в сомах (KGS)
- **redirectUrl** (String) - URL для редиректа после успешной оплаты
- **webhookUrl** (String) - URL для получения webhook о статусе платежа
- **name_en** (String) - Название QR кода (на английском)

### Опциональные параметры:

- **merchantCategoryCode** (String) - MCC код, по умолчанию "0742"
- **description** (String) - Описание платежа
- **startDate** (Number) - Начало действия QR кода (timestamp в миллисекундах)
- **endDate** (Number) - Конец действия QR кода (timestamp в миллисекундах)

## Что происходит после создания платежа?

1. **Сервер создает платеж** в системе Финика
2. **Получает paymentUrl** - ссылку на страницу оплаты
3. **Возвращает paymentUrl** клиенту
4. **Клиент перенаправляет пользователя** на paymentUrl
5. **Пользователь оплачивает** на странице Финика
6. **Финик отправляет webhook** на ваш `webhookUrl` со статусом
7. **Финик перенаправляет пользователя** на `redirectUrl` после оплаты

## Обработка webhook

Webhook автоматически обрабатывается на `POST /webhooks/finik`:

- Проверяется подпись
- Валидируется timestamp
- Обновляется статус платежа в БД
- Обеспечивается идемпотентность

## Примеры использования

### Пример 1: Простой платеж

```bash
curl -X POST http://localhost:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "redirectUrl": "https://mysite.com/success",
    "webhookUrl": "https://mysite.com/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Product Purchase"
  }'
```

### Пример 2: Платеж с ограниченным временем действия

```bash
curl -X POST http://localhost:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "redirectUrl": "https://mysite.com/success",
    "webhookUrl": "https://mysite.com/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Limited Time Offer",
    "startDate": 1737369000000,
    "endDate": 1737455400000
  }'
```

## Troubleshooting

### Ошибка: "FINIK_API_KEY не установлен"
- Проверьте, что файл `.env` существует
- Убедитесь, что переменные окружения загружены (перезапустите сервер)

### Ошибка: "Invalid signature"
- Проверьте формат приватного ключа (должен быть PEM)
- Убедитесь, что ключ соответствует публичному ключу, отправленному Финику

### Ошибка: "Invalid amount"
- Убедитесь, что amount > 0
- Проверьте, что amount - это число

### Получение HTML вместо JSON
- Это нормально для 302 редиректа
- Используйте `maxRedirects: 0` в axios
- Читайте Location header из ответа

## Проверка работы

1. Создайте тестовый платеж через API
2. Откройте полученный `paymentUrl` в браузере
3. Должна открыться страница Финика с QR кодом
4. После оплаты (или отмены) вы будете перенаправлены на `redirectUrl`
5. Финик отправит webhook на `webhookUrl` со статусом

