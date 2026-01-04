# Исправление ошибки "An invalid signature is provided"

## Проблема

При создании платежа в **production** окружении получаете:
```json
{"success":false,"error":"An invalid signature is provided"}
```

## Причина

Ошибка означает, что **публичный ключ не зарегистрирован** в системе Финика для **production** окружения, или зарегистрирован **неправильный ключ**.

## Решение

### Шаг 1: Извлеките публичный ключ из приватного

На сервере выполните:

```bash
cd /var/www/finik
npm run extract-public-key
```

Это покажет публичный ключ, который нужно отправить в Финик.

### Шаг 2: Отправьте публичный ключ в Финик

1. Скопируйте публичный ключ из вывода команды выше
2. Отправьте его в поддержку Финика
3. Укажите:
   - **Окружение:** PRODUCTION
   - **AccountId:** (ваш AccountId из .env)
   - **Публичный ключ:** (скопированный ключ)

### Шаг 3: Проверьте credentials для production

Убедитесь, что в `.env` на сервере правильные credentials для production:

```bash
cat .env | grep FINIK
```

Должно быть:
```env
FINIK_ENVIRONMENT=production
FINIK_API_KEY=<production_api_key>
FINIK_ACCOUNT_ID=<production_account_id>
```

### Шаг 4: Перезапустите сервер

```bash
pm2 restart finik-api
```

### Шаг 5: Проверьте работу

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

## Альтернативный способ: через OpenSSL

Если команда `npm run extract-public-key` не работает, используйте OpenSSL:

```bash
# Если ключ в файле
openssl rsa -in finik_private.pem -pubout -out finik_public.pem

# Затем покажите публичный ключ
cat finik_public.pem
```

## Проверка соответствия ключей

Чтобы убедиться, что приватный и публичный ключи соответствуют друг другу:

```bash
# На сервере
npm run check-key
```

Должно показать:
- ✅ Начало ключа: ✅
- ✅ Конец ключа: ✅
- ✅ Ключ можно использовать для подписи

## Что отправить в поддержку Финика

```
Окружение: PRODUCTION
AccountId: <ваш_account_id>
API Key: <первые_10_символов>

Публичный ключ:
-----BEGIN PUBLIC KEY-----
<содержимое публичного ключа>
-----END PUBLIC KEY-----

Проблема: Получаю ошибку "An invalid signature is provided" при создании платежа.
Прошу зарегистрировать публичный ключ для production окружения.
```

## После регистрации ключа

1. Подождите подтверждения от поддержки Финика
2. Перезапустите сервер: `pm2 restart finik-api`
3. Выполните тестовый запрос
4. Проверьте, что платеж создается успешно

## Диагностика

Если после регистрации ключа ошибка остается:

1. Проверьте логи:
   ```bash
   pm2 logs finik-api --lines 100
   ```

2. Проверьте каноническую строку в логах - она должна быть правильной

3. Убедитесь, что используете правильные credentials для production

4. Свяжитесь с поддержкой Финика с логами

