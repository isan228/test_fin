# Полная диагностика 403 Forbidden

## Текущая ситуация

Получаете `403 Forbidden` при создании платежа, хотя:
- ✅ Каноническая строка правильная
- ✅ Путь API правильный (`/v1/payment`)
- ✅ Credentials указаны

## Известные данные из логов

- **Окружение:** `beta`
- **AccountId:** `dfd2dba8-96c3-4bbe-a204-0a29629538cb`
- **API Key (первые 10 символов):** `LrYuYeZcGF...`
- **URL:** `https://beta.api.acquiring.averspay.kg/v1/payment`
- **Каноническая строка:** Правильная (проверено)

## Возможные причины 403 Forbidden

### 1. Публичный ключ не зарегистрирован для beta окружения ⚠️ НАИБОЛЕЕ ВЕРОЯТНО

**Проблема:** Публичный ключ из `publ1.pem` не зарегистрирован в системе Финика для **beta** окружения.

**Решение:**
1. Извлеките публичный ключ:
   ```bash
   cd /var/www/finik
   npm run extract-public-key
   ```
   Или:
   ```bash
   cat publ1.pem
   ```

2. Отправьте публичный ключ в поддержку Финика с указанием:
   - **Окружение:** BETA (важно указать именно BETA!)
   - **AccountId:** `dfd2dba8-96c3-4bbe-a204-0a29629538cb`
   - **API Key (первые 10 символов):** `LrYuYeZcGF`
   - **Callback URL:** `http://2.56.179.126:3000/webhooks/finik`

### 2. Неправильные credentials для beta

**Проблема:** API Key или AccountId не соответствуют beta окружению.

**Проверка:**
```bash
cd /var/www/finik
cat .env | grep FINIK
```

Убедитесь, что:
- `FINIK_API_KEY` - правильный для **beta** окружения
- `FINIK_ACCOUNT_ID` - правильный для **beta** окружения
- `FINIK_ENVIRONMENT=beta` (или `BETA`)

**Важно:** Credentials для beta могут отличаться от production!

### 3. Аккаунт не активирован в beta

**Проблема:** Аккаунт не активирован в системе Финика для beta окружения.

**Решение:** Свяжитесь с поддержкой Финика и уточните:
- Активирован ли аккаунт в **beta** окружении?
- Правильные ли credentials для beta?

### 4. Переключение на production

Если у вас есть credentials для production, попробуйте переключиться:

```bash
cd /var/www/finik
nano .env
# Измените:
FINIK_ENVIRONMENT=production
# Убедитесь, что:
# FINIK_API_KEY - правильный для production
# FINIK_ACCOUNT_ID - правильный для production
pm2 restart finik-api
```

**Важно:** Для production тоже нужен зарегистрированный публичный ключ!

## Что отправить в поддержку Финика

### Шаг 1: Подготовьте данные

1. **Публичный ключ:**
   ```bash
   cat publ1.pem
   ```

2. **AccountId:** `dfd2dba8-96c3-4bbe-a204-0a29629538cb`

3. **API Key (первые 10 символов):** `LrYuYeZcGF`

4. **Окружение:** `beta`

5. **Callback URL:** `http://2.56.179.126:3000/webhooks/finik`

6. **Ошибка:** `403 Forbidden` при запросе к `https://beta.api.acquiring.averspay.kg/v1/payment`

### Шаг 2: Сообщение в поддержку

```
Здравствуйте!

Получаю ошибку 403 Forbidden при создании платежа в beta окружении.

Данные:
- AccountId: dfd2dba8-96c3-4bbe-a204-0a29629538cb
- API Key (первые 10 символов): LrYuYeZcGF
- Окружение: beta
- URL: https://beta.api.acquiring.averspay.kg/v1/payment
- Callback URL: http://2.56.179.126:3000/webhooks/finik

Публичный ключ (прикреплен ниже):
-----BEGIN PUBLIC KEY-----
[ваш публичный ключ из publ1.pem]
-----END PUBLIC KEY-----

Проверьте, пожалуйста:
1. Зарегистрирован ли публичный ключ для beta окружения?
2. Правильные ли credentials (API Key и AccountId) для beta?
3. Активирован ли аккаунт в beta окружении?

Каноническая строка формируется правильно, подпись генерируется корректно.
Проблема именно в 403 Forbidden от API.

Спасибо!
```

## Проверка после исправления

После того как поддержка Финика зарегистрирует ключ или активирует аккаунт:

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

Должен вернуть:
```json
{
  "success": true,
  "paymentUrl": "https://beta.api.acquiring.averspay.kg/v1/redirect?...",
  "paymentId": "..."
}
```

## Альтернатива: Использование production

Если у вас есть credentials для production и публичный ключ зарегистрирован для production:

1. Измените `.env`:
   ```bash
   FINIK_ENVIRONMENT=production
   FINIK_API_KEY=<ваш_production_api_key>
   FINIK_ACCOUNT_ID=<ваш_production_account_id>
   ```

2. Перезапустите:
   ```bash
   pm2 restart finik-api
   ```

3. Протестируйте снова

