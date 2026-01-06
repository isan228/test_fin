# Проверка формата приватного ключа

## Ошибка: "Cannot read properties of undefined (reading 'kty')"

Эта ошибка означает, что приватный ключ не загружается правильно или имеет неправильный формат.

## Решение

### 1. Проверьте формат ключа в .env

Ключ должен быть в формате **RSA PRIVATE KEY**:

```env
FINIK_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(все строки ключа)
...
-----END RSA PRIVATE KEY-----"
```

**Важно:**
- Должно быть `BEGIN RSA PRIVATE KEY` (не просто `BEGIN PRIVATE KEY`)
- Ключ должен быть в кавычках
- Используйте реальные переносы строк (не `\n`)

### 2. Проверка на сервере

```bash
cd /var/www/finik

# Проверьте, что ключ установлен
cat .env | grep FINIK_PRIVATE_KEY | head -1

# Должно начинаться с:
# FINIK_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
```

### 3. Если ключ в неправильном формате

Если у вас ключ в формате `BEGIN PRIVATE KEY` (без RSA), нужно конвертировать:

```bash
# На сервере создайте временный файл
nano temp_key.pem
# Вставьте ваш ключ (BEGIN PRIVATE KEY)
# Сохраните (Ctrl+O, Enter, Ctrl+X)

# Конвертируйте в RSA формат
openssl rsa -in temp_key.pem -out rsa_key.pem

# Скопируйте содержимое rsa_key.pem в .env
cat rsa_key.pem
```

Затем обновите `.env`:
```env
FINIK_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
[содержимое из rsa_key.pem]
-----END RSA PRIVATE KEY-----"
```

### 4. Альтернатива: используйте файл

Если проблемы с .env, можно использовать файл:

```bash
# Создайте файл
nano /var/www/finik/priv1.pem
# Вставьте ключ (BEGIN RSA PRIVATE KEY)
# Сохраните

# Обновите код для чтения из файла (или используйте существующий loadPrivateKey)
```

### 5. Проверка после исправления

```bash
# Перезапустите сервер
pm2 restart finik-api

# Проверьте логи
pm2 logs finik-api --lines 20

# Попробуйте создать платеж
curl -X POST http://2.56.179.126:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/api/webhooks/finik"
  }'
```

## Формат ключа

**Правильный формат:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(много строк)
...
-----END RSA PRIVATE KEY-----
```

**Неправильный формат:**
```
-----BEGIN PRIVATE KEY-----  ❌ (без RSA)
-----BEGIN RSA PRIVATE KEY-----\nMII...\n-----END RSA PRIVATE KEY-----  ❌ (с \n вместо переносов)
```

