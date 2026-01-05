# Тестирование системы оплаты Финик

## Подготовка

Перед тестированием убедитесь, что:

1. ✅ Сервер запущен: `http://2.56.179.126:3000`
2. ✅ В `.env` установлены переменные:
   - `FINIK_API_KEY` - API ключ от Финика
   - `FINIK_PRIVATE_PEM` - Приватный ключ (или файл `finik_private.pem`)
   - `FINIK_ACCOUNT_ID` - ID корпоративного аккаунта
   - `FINIK_ENVIRONMENT` - `production` или `beta`

3. ✅ Проверьте ключ:
   ```bash
   npm run check-key
   ```

## Способ 1: Через веб-интерфейс (самый простой)

### Шаг 1: Откройте страницу тестирования

Откройте в браузере:
```
http://2.56.179.126:3000/test-payment
```

### Шаг 2: Заполните форму

1. **Сумма платежа** - например, `100` (сомы)
2. **Redirect URL** - куда перенаправить после оплаты:
   ```
   http://2.56.179.126:3000/success
   ```
3. **Webhook URL** - куда Финик отправит статус:
   ```
   http://2.56.179.126:3000/webhooks/finik
   ```
4. **MCC код** - обычно `0742`
5. **Название QR кода** - например, `Test Payment`
6. **Описание** (опционально) - например, `Тестовый платеж`

### Шаг 3: Создайте платеж

Нажмите кнопку **"Создать тестовый платеж"**

### Шаг 4: Проверьте результат

Если все успешно, вы увидите:
- ✅ `paymentUrl` - ссылку на страницу оплаты
- ✅ `paymentId` - уникальный ID платежа
- ✅ Кнопку "Показать QR код для оплаты"

### Шаг 5: Откройте страницу оплаты

Нажмите на кнопку **"📱 Показать QR код для оплаты"** или скопируйте `paymentUrl` и откройте в браузере.

На странице оплаты вы увидите:
- QR код для сканирования
- Ссылку для открытия в приложении Финик
- Информацию о платеже

### Шаг 6: Проверьте webhook

После оплаты (или отмены) Финик отправит webhook на ваш `webhookUrl`. Проверьте логи:

```bash
pm2 logs finik-api --lines 50
```

Вы должны увидеть:
```
Webhook received from Finik: {...}
✅ Webhook processed
```

## Способ 2: Через API (cURL)

### Создание платежа

```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment",
    "description": "Тестовый платеж через API"
  }'
```

### Ответ (успех):

```json
{
  "success": true,
  "paymentUrl": "https://api.acquiring.averspay.kg/v1/redirect?paymentId=...",
  "paymentId": "dc331219-34ee-43b1-b4cd-b10748adaef0"
}
```

### Ответ (ошибка):

```json
{
  "success": false,
  "error": "Описание ошибки",
  "paymentId": "dc331219-34ee-43b1-b4cd-b10748adaef0"
}
```

### Проверка статуса платежа

```bash
curl "http://2.56.179.126:3000/api/payments?paymentId=dc331219-34ee-43b1-b4cd-b10748adaef0"
```

## Способ 3: Через JavaScript (в браузере)

Откройте консоль браузера (F12) и выполните:

```javascript
async function testPayment() {
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
  console.log('Результат:', data);
  
  if (data.success) {
    // Открыть страницу оплаты
    window.open(data.paymentUrl, '_blank');
    // Или показать QR код
    window.open(`/payment.html?paymentUrl=${encodeURIComponent(data.paymentUrl)}&paymentId=${data.paymentId}`, '_blank');
  }
}

testPayment();
```

## Проверка работы системы

### 1. Проверка создания платежа

```bash
# Создайте платеж
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 1, "redirectUrl": "http://2.56.179.126:3000/success", "webhookUrl": "http://2.56.179.126:3000/webhooks/finik", "merchantCategoryCode": "0742", "name_en": "Test"}'
```

### 2. Проверка списка платежей

```bash
curl http://2.56.179.126:3000/api/payments
```

### 3. Проверка webhook endpoint

```bash
# Проверьте, что endpoint доступен
curl -X POST http://2.56.179.126:3000/webhooks/finik \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 4. Проверка логов

```bash
pm2 logs finik-api --lines 100
```

## Типичные проблемы и решения

### Проблема: `FINIK_API_KEY не установлен`

**Решение:** Проверьте файл `.env` на сервере:
```bash
cd /var/www/finik
cat .env | grep FINIK
```

### Проблема: `Invalid signature`

**Решение:** 
1. Проверьте формат приватного ключа: `npm run check-key`
2. Убедитесь, что ключ соответствует публичному ключу, отправленному Финику

### Проблема: `status=failed` в paymentUrl

**Решение:** 
1. Проверьте `FINIK_ACCOUNT_ID` - должен быть правильным
2. Проверьте `FINIK_ENVIRONMENT` - должен соответствовать используемым ключам
3. Убедитесь, что аккаунт активирован в системе Финика

### Проблема: Webhook не приходит

**Решение:**
1. Проверьте, что `webhookUrl` доступен из интернета
2. Проверьте firewall - порт 3000 должен быть открыт
3. Проверьте логи: `pm2 logs finik-api`

## Полный цикл тестирования

1. ✅ **Создайте платеж** через веб-интерфейс или API
2. ✅ **Проверьте paymentUrl** - должен быть валидным URL
3. ✅ **Откройте paymentUrl** в браузере - должна открыться страница Финика
4. ✅ **Отсканируйте QR код** или откройте ссылку в приложении Финик
5. ✅ **Оплатите** (или отмените) платеж
6. ✅ **Проверьте webhook** - должен прийти запрос на ваш webhookUrl
7. ✅ **Проверьте статус** - запросите статус платежа через API
8. ✅ **Проверьте логи** - все должно быть залогировано

## Тестовые данные

Для тестирования можно использовать:

- **Сумма:** `1` сом (минимальная для теста)
- **Redirect URL:** `http://2.56.179.126:3000/success`
- **Webhook URL:** `http://2.56.179.126:3000/webhooks/finik`
- **MCC:** `0742`
- **Название:** `Test Payment`

## Полезные ссылки

- Веб-интерфейс тестирования: `http://2.56.179.126:3000/test-payment`
- Страница оплаты с QR: `http://2.56.179.126:3000/payment`
- API документация: `http://2.56.179.126:3000/api`
- Список платежей: `http://2.56.179.126:3000/api/payments`


