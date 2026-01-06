# Исправление 403 Forbidden: Проверка credentials

## ✅ Формат канонической строки исправлен

Формат теперь правильный:
```
post
/payment
host:api.acquiring.averspay.kg&x-api-key:...&x-api-timestamp:...

{"Amount":100,...}
```

## ❌ Если все еще получаете 403 Forbidden

Это означает, что проблема **НЕ в формате подписи**, а в **credentials или активации аккаунта**.

## Проверка credentials

### 1. Проверьте AccountId

В тесте используется: `b5c58a01-90b8-4e6c-b30a-27578ba28b0a`

Но в логах сервера был: `9c247f61-d1da-422b-93e5-9a1e9d9a47f3`

**Убедитесь, что используется правильный AccountId для beta окружения:**

```bash
cat .env | grep FINIK_ACCOUNT_ID
```

### 2. Проверьте API Key

```bash
cat .env | grep FINIK_API_KEY
```

Убедитесь, что это правильный API Key для **beta** окружения.

### 3. Проверьте окружение

```bash
cat .env | grep FINIK_ENVIRONMENT
```

Должно быть: `FINIK_ENVIRONMENT=BETA` или `FINIK_ENVIRONMENT=beta`

### 4. Проверьте, что аккаунт активирован

**Важно:** Аккаунт должен быть активирован в **beta** окружении Финика.

## Что делать

### Шаг 1: Обновите код на сервере

```bash
cd /var/www/finik
git pull
pm2 restart finik-api
```

### Шаг 2: Проверьте credentials

```bash
npm run diagnose
```

### Шаг 3: Создайте тестовый платеж

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

### Шаг 4: Проверьте логи

```bash
pm2 logs finik-api --lines 100
```

Ищите:
- `AccountId:` - должен быть правильным для beta
- `Environment: beta`
- `Base URL: https://beta.api.acquiring.averspay.kg` (для beta)
- Каноническую строку - должна быть правильной

## Если проблема остается

### Свяжитесь с поддержкой Финика

Предоставьте им:

1. **AccountId:** `9c247f61-d1da-422b-93e5-9a1e9d9a47f3` (или тот, что в .env)
2. **Первые 10 символов API Key:** `WUwZ0ydP6a...`
3. **Окружение:** `beta`
4. **Каноническую строку** (из логов):
   ```
   post
   /payment
   host:api.acquiring.averspay.kg&x-api-key:...&x-api-timestamp:...
   
   {"Amount":1,...}
   ```
5. **Полный URL запроса:** `https://api.acquiring.averspay.kg/payment` (или beta URL)

Попросите проверить:
- ✅ Активирован ли аккаунт в beta окружении
- ✅ Правильно ли зарегистрирован публичный ключ
- ✅ Правильность AccountId и API Key для beta
- ✅ Соответствует ли формат подписи их требованиям

## Возможные проблемы

1. **AccountId не для beta окружения** - используйте AccountId, выданный для beta
2. **API Key не для beta окружения** - используйте API Key, выданный для beta
3. **Аккаунт не активирован** - попросите активировать в beta
4. **Публичный ключ не зарегистрирован** - отправьте публичный ключ в Финик для beta окружения
5. **Используется production URL вместо beta** - проверьте, что `FINIK_ENVIRONMENT=beta` и используется правильный URL

## Проверка URL

Для beta должно быть:
```
Base URL: https://beta.api.acquiring.averspay.kg
```

Для production:
```
Base URL: https://api.acquiring.averspay.kg
```

Убедитесь, что используете правильный URL для вашего окружения.


