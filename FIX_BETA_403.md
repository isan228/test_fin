# Исправление 403 Forbidden для beta окружения

## Проблема

Получаете `403 Forbidden` при использовании beta окружения. Каноническая строка правильная, но запрос отклоняется.

## Диагностика

Из логов видно:
- ✅ Окружение: `beta`
- ✅ Путь API: `/v1/payment`
- ✅ URL: `https://beta.api.acquiring.averspay.kg/v1/payment`
- ✅ AccountId: `dfd2dba8-96c3-4bbe-a204-0a29629538cb`
- ✅ API Key: `LrYuYeZcGF...`
- ✅ Каноническая строка правильная

## Возможные причины

### 1. Публичный ключ не зарегистрирован для beta

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
   - Окружение: **BETA**
   - AccountId: `dfd2dba8-96c3-4bbe-a204-0a29629538cb`
   - API Key (первые 10 символов): `LrYuYeZcGF`

### 2. Неправильные credentials для beta

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

Свяжитесь с поддержкой Финика и уточните:
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

## Что отправить в поддержку Финика

1. **AccountId:** `dfd2dba8-96c3-4bbe-a204-0a29629538cb`
2. **API Key (первые 10 символов):** `LrYuYeZcGF`
3. **Окружение:** `beta`
4. **Публичный ключ** (из `publ1.pem`)
5. **URL:** `https://beta.api.acquiring.averspay.kg/v1/payment`
6. **Ошибка:** `403 Forbidden`
7. **Каноническая строка** (из логов)

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

