# 🚀 Быстрый тест платежа

## Шаг 1: Откройте тестовую страницу

Откройте в браузере:
```
http://2.56.179.126:3000/test-payment
```

## Шаг 2: Заполните форму

1. **Сумма**: `1` (1 сом для теста)
2. **Redirect URL**: `http://2.56.179.126:3000/success`
3. **Webhook URL**: `http://2.56.179.126:3000/webhooks/finik`
4. **MCC код**: `0742`
5. **Название (en)**: `Test Payment`
6. **Описание** (опционально): `Тестовый платеж`

## Шаг 3: Создайте платеж

Нажмите кнопку **"Создать тестовый платеж"**

## Шаг 4: Проверьте результат

### ✅ Успех:
```json
{
  "success": true,
  "paymentUrl": "https://api.acquiring.averspay.kg/v1/redirect?paymentId=...",
  "paymentId": "..."
}
```

### ❌ Ошибка:
Если видите ошибку, проверьте логи:
```bash
pm2 logs finik-api --lines 50
```

## Альтернатива: Тест через cURL

```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment"
  }'
```

## Проверка логов на сервере

```bash
cd /var/www/finik
pm2 logs finik-api --lines 100
```

Ищите:
- ✅ `Ключ загружен из файла: priv1.pem`
- ✅ `Payment created successfully`
- ❌ Любые ошибки с подписью или API

