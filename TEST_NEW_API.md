# Тестирование новой версии API

## Шаг 1: Проверка установки зависимостей

На сервере выполните:

```bash
cd /var/www/finik
npm list @mancho.devs/authorizer node-fetch
```

Если пакеты не установлены:

```bash
npm install @mancho.devs/authorizer node-fetch@3
```

## Шаг 2: Проверка Node.js версии

```bash
node --version
```

Должно быть **18.0.0** или выше. Если нет:

```bash
# Установите Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Шаг 3: Проверка переменных окружения

```bash
cat .env | grep FINIK
```

Должно быть:
- `FINIK_ENV=beta` (или `prod`)
- `FINIK_API_KEY=...`
- `FINIK_ACCOUNT_ID=...`
- `FINIK_PRIVATE_KEY=...`
- `FINIK_PUBLIC_KEY=...`

## Шаг 4: Проверка запуска сервера

```bash
pm2 status
pm2 logs finik-api --lines 50
```

Должно быть:
```
🚀 Server started on http://2.56.179.126:3000
💳 Payment API: POST http://2.56.179.126:3000/api/payments/create
🔔 Webhook: POST http://2.56.179.126:3000/api/webhooks/finik
```

## Шаг 5: Тест создания платежа

```bash
curl -X POST http://2.56.179.126:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/api/webhooks/finik"
  }'
```

**Ожидаемый ответ (успех):**
```json
{
  "success": true,
  "paymentUrl": "https://beta.api.acquiring.averspay.kg/v1/redirect?paymentId=...",
  "paymentId": "uuid"
}
```

**Ожидаемый ответ (ошибка):**
```json
{
  "success": false,
  "error": "описание ошибки"
}
```

## Шаг 6: Проверка webhook endpoint

```bash
curl -X POST http://2.56.179.126:3000/api/webhooks/finik \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Ожидаемый ответ:**
- `401 Unauthorized` с `{"error": "Invalid signature"}` - это нормально, значит endpoint работает и проверяет подпись

## Шаг 7: Проверка логов

```bash
pm2 logs finik-api --lines 100
```

Ищите:
- ✅ `Server started` - сервер запущен
- ✅ `Webhook received and verified` - webhook работает
- ❌ Ошибки импорта модулей
- ❌ Ошибки с подписью

## Возможные проблемы

### Ошибка: "Cannot find module '@mancho.devs/authorizer'"

```bash
npm install @mancho.devs/authorizer
```

### Ошибка: "SyntaxError: Cannot use import statement"

Проверьте `package.json` - должно быть `"type": "module"`

### Ошибка: "FINIK_PRIVATE_KEY is not defined"

Проверьте `.env` файл - ключ должен быть установлен

### Ошибка: "node-fetch is not defined"

```bash
npm install node-fetch@3
```

## Чек-лист

- [ ] Node.js 18+ установлен
- [ ] Зависимости установлены (`npm install`)
- [ ] `.env` файл обновлен
- [ ] Сервер запущен (`pm2 status`)
- [ ] Тестовый платеж создан успешно
- [ ] Webhook endpoint отвечает (401 - нормально)

