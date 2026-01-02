# Исправление ошибки 403 Forbidden

## Проблема

При создании платежа получаете:
```
POST http://2.56.179.126:3000/api/finik/payment 403 (Forbidden)
Finik API error: { status: 403, error: 'Forbidden', data: { message: 'Forbidden' } }
```

## Возможные причины

### 1. Неправильный путь API (наиболее вероятно)

Финик дал URL: `https://api.acquiring.averspay.kg/payment`

**Проверка:**
```bash
# На сервере проверьте логи
pm2 logs finik-api --lines 100 | grep "Path:"
```

Должно быть:
```
Path: /payment
```

Если там `/v1/payment`, нужно изменить.

**Решение:**

В `.env` на сервере добавьте:
```bash
FINIK_API_PATH=/payment
```

Или убедитесь, что путь правильный (по умолчанию теперь `/payment`).

### 2. Неправильная подпись запроса

**Проверка:**
```bash
pm2 logs finik-api --lines 200 | grep -A 50 "Canonical String"
```

Проверьте каноническую строку - она должна соответствовать документации Финика.

**Формат канонической строки:**
```
post
/payment
host:api.acquiring.averspay.kg&x-api-key:...&x-api-timestamp:...
{"Amount":100,"CardType":"FINIK_QR",...}
```

### 3. Неправильный API Key или AccountId

**Проверка:**
```bash
npm run diagnose
```

Убедитесь, что:
- `FINIK_API_KEY` правильный для beta окружения
- `FINIK_ACCOUNT_ID` правильный для beta окружения

### 4. Аккаунт не активирован

Свяжитесь с поддержкой Финика для проверки активации аккаунта в beta окружении.

## Диагностика

### Шаг 1: Обновите код на сервере

```bash
cd /var/www/finik
git pull
pm2 restart finik-api
```

### Шаг 2: Создайте тестовый платеж

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

### Шаг 3: Проверьте логи

```bash
pm2 logs finik-api --lines 200
```

Ищите:
- `Full URL:` - должен быть `https://api.acquiring.averspay.kg/payment` (или beta URL)
- `Path:` - должен быть `/payment`
- `Canonical String` - проверьте формат
- `❌ Finik API error:` - детальная информация об ошибке

### Шаг 4: Проверьте переменные окружения

```bash
cat .env | grep FINIK
```

Убедитесь:
- `FINIK_API_PATH=/payment` (или не установлен, тогда используется `/payment` по умолчанию)
- `FINIK_ENVIRONMENT=BETA` или `beta`
- `FINIK_API_KEY` правильный
- `FINIK_ACCOUNT_ID` правильный

## Решения

### Решение 1: Убедиться что путь правильный

В `.env` на сервере:
```bash
FINIK_API_PATH=/payment
```

Или если Финик использует `/v1/payment`:
```bash
FINIK_API_PATH=/v1/payment
```

### Решение 2: Проверить подпись

В логах будет каноническая строка. Сравните её с документацией Финика.

Формат должен быть:
```
{method}\n
{path}\n
{headers}\n
{query_params}\n
{body}
```

### Решение 3: Проверить credentials

```bash
npm run diagnose
```

Если все правильно, но ошибка остается:
1. Свяжитесь с поддержкой Финика
2. Предоставьте:
   - AccountId
   - Первые 10 символов API Key
   - Каноническую строку из логов
   - Полный URL запроса

## Что проверить в логах

После обновления кода в логах будет:

```
📤 Создание платежа в Финике:
   Full URL: https://api.acquiring.averspay.kg/payment
   Path: /payment
   Canonical String (для подписи):
   ───────────────────────────────────────────────────
   post
   /payment
   host:api.acquiring.averspay.kg&x-api-key:...&x-api-timestamp:...
   {"Amount":1,...}
   ───────────────────────────────────────────────────
```

Если путь неправильный или каноническая строка не соответствует документации - это причина ошибки.

## После исправления

1. Перезапустите сервер: `pm2 restart finik-api`
2. Создайте тестовый платеж
3. Проверьте логи - должна быть детальная информация
4. Если ошибка остается - свяжитесь с поддержкой Финика с логами

