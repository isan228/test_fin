# Диагностика 403 Forbidden на beta окружении

## Проблема

При переключении на beta окружение получаете:
```
Status: 403 Forbidden
Error Message: Forbidden
```

## Что проверить в логах

На сервере выполните:

```bash
pm2 logs finik-api --lines 300 | grep -A 30 "Создание платежа в Финике"
```

Ищите:
- `Environment: beta` - должно быть beta
- `Base URL:` - должно быть `https://beta.api.acquiring.averspay.kg`
- `Host:` - должно быть `beta.api.acquiring.averspay.kg`
- `Canonical String` - проверьте формат

## Возможные причины 403 на beta

### 1. Неправильные credentials для beta

**Проверка:**
```bash
cd /var/www/finik
cat .env | grep FINIK
```

Убедитесь:
- `FINIK_ENVIRONMENT=beta` (или `BETA`)
- `FINIK_API_KEY` - правильный для **beta** окружения
- `FINIK_ACCOUNT_ID` - правильный для **beta** окружения

**Важно:** Credentials для beta могут отличаться от production!

### 2. Аккаунт не активирован в beta

Аккаунт должен быть активирован в **beta** окружении Финика.

### 3. Публичный ключ не зарегистрирован в beta

Публичный ключ должен быть зарегистрирован в системе Финика для **beta** окружения.

### 4. Неправильный путь API для beta

Возможно, для beta нужен другой путь. Проверьте в логах:
- `Path: /payment` - текущий путь
- Возможно нужен `/v1/payment` для beta

Попробуйте установить:
```bash
# В .env
FINIK_API_PATH=/v1/payment
```

Затем перезапустите:
```bash
pm2 restart finik-api
```

## Диагностика

### Шаг 1: Проверьте окружение

В логах должно быть:
```
Environment: beta (нормализовано из: BETA)
Base URL: https://beta.api.acquiring.averspay.kg
Host: beta.api.acquiring.averspay.kg
```

### Шаг 2: Проверьте каноническую строку

В логах должна быть каноническая строка:
```
post
/payment
host:beta.api.acquiring.averspay.kg&x-api-key:...&x-api-timestamp:...
{"Amount":1,...}
```

Убедитесь:
- Host правильный: `beta.api.acquiring.averspay.kg`
- Путь правильный: `/payment` (или `/v1/payment`)
- Заголовки в правильном порядке: `host:` первый, затем `x-api-*`

### Шаг 3: Проверьте credentials

```bash
cd /var/www/finik
cat .env | grep FINIK
```

Должно быть:
```
FINIK_ENVIRONMENT=beta
FINIK_API_KEY=ваш_ключ_для_beta
FINIK_ACCOUNT_ID=ваш_account_id_для_beta
```

## Решение

### Вариант 1: Проверьте credentials для beta

Убедитесь, что у вас есть правильные credentials для beta окружения:
- API Key для beta
- Account ID для beta
- Публичный ключ зарегистрирован в beta

### Вариант 2: Попробуйте другой путь API

Возможно, для beta нужен путь `/v1/payment`:

```bash
cd /var/www/finik
echo "FINIK_API_PATH=/v1/payment" >> .env
pm2 restart finik-api
```

### Вариант 3: Свяжитесь с поддержкой Финика

Предоставьте:
- AccountId для beta
- Первые 10 символов API Key для beta
- Окружение: `beta`
- URL запроса: `https://beta.api.acquiring.averspay.kg/payment`
- Каноническую строку из логов

Попросите проверить:
- Активирован ли аккаунт в beta
- Правильность credentials для beta
- Зарегистрирован ли публичный ключ в beta
- Правильный ли путь API для beta

## Сравнение с production

На **production** вы получали `status=failed` (платеж создавался, но отклонялся).
На **beta** вы получаете `403 Forbidden` (запрос отклоняется до создания платежа).

Это означает:
- На production: подпись правильная, но credentials/аккаунт неправильные
- На beta: возможно неправильная подпись, неправильные credentials, или аккаунт не активирован

