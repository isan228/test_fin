# Руководство по миграции на новую версию

## Изменения

### 1. Структура проекта

Проект переведен на новую структуру:
```
src/
├── app.js
├── server.js
├── config/
│   └── finik.js
├── routes/
│   ├── payment.routes.js
│   └── webhook.routes.js
├── services/
│   └── finik.service.js
└── utils/
    └── verifyWebhook.js
```

### 2. Технологии

- **Node.js 18+** (обязательно)
- **ES Modules** (import/export вместо require)
- **@mancho.devs/authorizer** - для подписи и валидации
- **node-fetch** - для HTTP запросов

### 3. Переменные окружения

Обновлен формат `.env`:

```env
PORT=3000
FINIK_ENV=beta                    # 'beta' или 'prod'
FINIK_API_KEY=xxxxxxxxxxxxxxxx
FINIK_ACCOUNT_ID=xxxxxxxxxxxxxxxx

FINIK_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"

FINIK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"
```

### 4. API Endpoints

**Новые endpoints:**
- `POST /api/payments/create` - создание платежа
- `POST /api/webhooks/finik` - webhook от Finik

**Старые endpoints (удалены):**
- `POST /api/finik/payment` - заменен на `/api/payments/create`
- `POST /webhooks/finik` - заменен на `/api/webhooks/finik`

## Установка на сервере

### Шаг 1: Обновите код

```bash
cd /var/www/finik
git pull
```

### Шаг 2: Установите зависимости

```bash
npm install
```

Это установит:
- `@mancho.devs/authorizer`
- `node-fetch@3`

### Шаг 3: Обновите .env

Отредактируйте `.env` файл:

```bash
nano .env
```

Добавьте/измените:
```env
FINIK_ENV=beta
FINIK_API_KEY=ваш_ключ
FINIK_ACCOUNT_ID=ваш_account_id

# Приватный ключ (RSA PRIVATE KEY)
FINIK_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
[ваш ключ]
-----END RSA PRIVATE KEY-----"

# Публичный ключ (для проверки webhook)
FINIK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[публичный ключ]
-----END PUBLIC KEY-----"
```

**Важно:** 
- Используйте `FINIK_ENV=beta` для тестового окружения
- Используйте `FINIK_ENV=prod` для production
- Ключи должны быть в формате RSA (BEGIN RSA PRIVATE KEY, не BEGIN PRIVATE KEY)

### Шаг 4: Проверьте Node.js версию

```bash
node --version
```

Должно быть 18.0.0 или выше. Если нет:

```bash
# Установите Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Шаг 5: Перезапустите сервер

```bash
pm2 restart finik-api
# или
pm2 delete finik-api
pm2 start src/server.js --name finik-api
pm2 save
```

## Тестирование

### Создание платежа

```bash
curl -X POST http://2.56.179.126:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/api/webhooks/finik"
  }'
```

### Проверка webhook

```bash
curl -X POST http://2.56.179.126:3000/api/webhooks/finik \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Должен вернуть 401 (Invalid signature) - это нормально, значит endpoint работает.

## Откат на старую версию

Если что-то пошло не так:

```bash
cd /var/www/finik
git checkout <старый-commit>
npm install
pm2 restart finik-api
```

## Чек-лист

- [ ] Node.js 18+ установлен
- [ ] Зависимости установлены (`npm install`)
- [ ] `.env` файл обновлен с новыми переменными
- [ ] `FINIK_PRIVATE_KEY` в формате RSA PRIVATE KEY
- [ ] `FINIK_PUBLIC_KEY` установлен
- [ ] `FINIK_ENV` установлен (beta или prod)
- [ ] Сервер перезапущен
- [ ] Тестовый платеж создан успешно

## Проблемы

### Ошибка: "Cannot find module '@mancho.devs/authorizer'"

```bash
npm install @mancho.devs/authorizer
```

### Ошибка: "SyntaxError: Cannot use import statement"

Проверьте, что в `package.json` есть `"type": "module"`

### Ошибка: "node-fetch is not defined"

```bash
npm install node-fetch@3
```

### Ошибка: "FINIK_PRIVATE_KEY is not defined"

Проверьте `.env` файл - ключ должен быть установлен.

