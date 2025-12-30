# Перезапуск сервера после обновления

## Проблема

После обновления кода через `git pull` сервер все еще использует старый код в памяти.

## Решение: Перезапустить сервер

### Если используете PM2:

```bash
cd /var/www/finik
git pull
npm install  # если были новые зависимости
pm2 restart finik-api
pm2 logs finik-api  # проверьте логи
```

### Если используете systemd:

```bash
cd /var/www/finik
git pull
npm install  # если были новые зависимости
sudo systemctl restart finik
sudo systemctl status finik  # проверьте статус
```

### Если запускаете напрямую через node:

```bash
cd /var/www/finik
git pull
npm install  # если были новые зависимости
# Остановите текущий процесс (Ctrl+C) и запустите снова:
npm start
# или
node server.js
```

### Если используете nodemon (dev режим):

Он должен перезапуститься автоматически, но если нет:

```bash
cd /var/www/finik
git pull
# Перезапустите nodemon
```

## Проверка после перезапуска

1. Проверьте, что сервер запущен:
```bash
curl http://2.56.179.126:3000/api/keys
```

2. Проверьте ключ:
```bash
npm run check-key
```

3. Попробуйте создать платеж:
```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment"
  }'
```

## Если все еще не работает

1. Проверьте логи сервера на ошибки
2. Убедитесь, что файл `finik_private.pem` существует в корне проекта
3. Проверьте права доступа: `chmod 600 finik_private.pem`
4. Убедитесь, что все переменные окружения установлены в `.env`

