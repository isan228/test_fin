# Диагностика: Платеж отклонен Фиником (status=failed)

## Проблема

При создании платежа получаете:
```json
{
  "success": false,
  "status": "failed",
  "error": "Платеж отклонен Фиником (status=failed)"
}
```

## Что это означает

✅ **Хорошие новости:**
- Подпись правильная (иначе была бы ошибка 401 Unauthorized)
- Аккаунт активен (иначе была бы ошибка 403 Forbidden)
- Запрос дошел до Финика

❌ **Проблема:**
- Финик отклонил платеж из-за неправильных данных или настроек

## Возможные причины

### 1. Неправильный AccountId (наиболее вероятно)

**Проверка:**
```bash
cat .env | grep FINIK_ACCOUNT_ID
```

**Решение:**
- Убедитесь, что AccountId правильный для вашего окружения (production/beta)
- AccountId для production может отличаться от beta
- Свяжитесь с поддержкой Финика для проверки правильности AccountId

### 2. Неправильный API Key

**Проверка:**
```bash
cat .env | grep FINIK_API_KEY
```

**Решение:**
- Убедитесь, что API Key правильный для вашего окружения
- API Key для production может отличаться от beta
- Свяжитесь с поддержкой Финика для проверки правильности API Key

### 3. Неправильное окружение

**Проверка:**
```bash
cat .env | grep FINIK_ENVIRONMENT
```

**Решение:**
- Для production: `FINIK_ENVIRONMENT=production`
- Для beta: `FINIK_ENVIRONMENT=beta`
- Убедитесь, что используете правильные credentials для каждого окружения

### 4. Аккаунт не активирован

Аккаунт должен быть **активирован** в системе Финика для вашего окружения.

### 5. Проблема с данными платежа

Возможные проблемы:
- Неправильный `merchantCategoryCode`
- Неправильный формат `name_en`
- Проблемы с `webhookUrl` или `redirectUrl`

## Диагностика

### Шаг 1: Проверьте логи сервера

```bash
pm2 logs finik-api --lines 100
```

Ищите:
- `AccountId:` - должен быть правильным
- `Environment:` - должен соответствовать вашим credentials
- `Base URL:` - должен быть правильным для окружения
- Детальную информацию об ошибке

### Шаг 2: Проверьте переменные окружения

```bash
cd /var/www/finik
cat .env | grep FINIK
```

Убедитесь:
- `FINIK_API_KEY` правильный
- `FINIK_ACCOUNT_ID` правильный
- `FINIK_ENVIRONMENT` правильный (production или beta)

### Шаг 3: Проверьте файл приватного ключа

```bash
ls -la privat1
cat privat1 | head -1
```

Убедитесь, что файл `privat1` существует и содержит правильный приватный ключ.

## Что делать

### 1. Свяжитесь с поддержкой Финика

Предоставьте им:
- **AccountId:** (из .env)
- **Первые 10 символов API Key:** (из .env)
- **Окружение:** production или beta
- **PaymentId из ошибки:** (например, `0ff6ed4b-9733-4459-bc81-dcb743397005`)
- **URL запроса:** `https://api.acquiring.averspay.kg/payment` (или beta URL)

Попросите проверить:
- ✅ Активирован ли аккаунт в указанном окружении
- ✅ Правильность AccountId и API Key
- ✅ Почему платеж отклонен (детали из их системы)

### 2. Проверьте данные платежа

Убедитесь, что:
- `merchantCategoryCode` правильный (обычно `0742`)
- `name_en` не пустой и в правильном формате
- `webhookUrl` доступен из интернета
- `redirectUrl` правильный

### 3. Попробуйте с минимальными данными

```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test"
  }'
```

## Проверка URL окружения

Для **production** должно быть:
```
Base URL: https://api.acquiring.averspay.kg
```

Для **beta** должно быть:
```
Base URL: https://beta.api.acquiring.averspay.kg
```

Убедитесь, что используете правильный URL для вашего окружения.

## После исправления

1. Обновите `.env` с правильными credentials
2. Перезапустите сервер: `pm2 restart finik-api`
3. Попробуйте создать платеж снова

