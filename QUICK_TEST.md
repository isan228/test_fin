# Быстрая проверка новой версии

## На сервере выполните:

### 1. Обновите код и установите зависимости

```bash
cd /var/www/finik
git pull
npm install
```

### 2. Проверьте Node.js версию

```bash
node --version
```

Должно быть **18.0.0** или выше.

### 3. Проверьте .env

```bash
cat .env | grep FINIK
```

Должно быть:
- `FINIK_ENV=beta` (или `prod`)
- `FINIK_API_KEY=...`
- `FINIK_ACCOUNT_ID=...`
- `FINIK_PRIVATE_KEY=...` (RSA формат)
- `FINIK_PUBLIC_KEY=...`

### 4. Перезапустите сервер

```bash
pm2 restart finik-api
# или если не запущен:
pm2 start src/server.js --name finik-api
pm2 save
```

### 5. Проверьте логи

```bash
pm2 logs finik-api --lines 20
```

Должно быть:
```
🚀 Server started on http://2.56.179.126:3000
💳 Payment API: POST http://2.56.179.126:3000/api/payments/create
🔔 Webhook: POST http://2.56.179.126:3000/api/webhooks/finik
```

### 6. Тест создания платежа

```bash
curl -X POST http://2.56.179.126:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/api/webhooks/finik"
  }'
```

**Успешный ответ:**
```json
{
  "success": true,
  "paymentUrl": "https://beta.api.acquiring.averspay.kg/v1/redirect?paymentId=...",
  "paymentId": "uuid"
}
```

### 7. Тест webhook

```bash
curl -X POST http://2.56.179.126:3000/api/webhooks/finik \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Ожидаемый ответ:** `401 Unauthorized` - это нормально, значит endpoint работает.

## Если есть ошибки

### Ошибка: "Cannot find module '@mancho.devs/authorizer'"

```bash
npm install @mancho.devs/authorizer
pm2 restart finik-api
```

### Ошибка: "SyntaxError: Cannot use import statement"

Проверьте `package.json` - должно быть `"type": "module"`

### Ошибка: "FINIK_PRIVATE_KEY is not defined"

Проверьте `.env` файл - добавьте `FINIK_PRIVATE_KEY`
