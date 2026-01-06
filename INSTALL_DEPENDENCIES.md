# Установка зависимостей на сервере

## Проблема

Ошибка: `Cannot find package '@mancho.devs/authorizer'`

## Решение

На сервере выполните:

```bash
cd /var/www/finik

# 1. Обновите код
git pull

# 2. Установите все зависимости
npm install

# 3. Проверьте, что пакет установлен
npm list @mancho.devs/authorizer

# 4. Если пакет не установился, установите вручную
npm install @mancho.devs/authorizer node-fetch@3

# 5. Перезапустите сервер
pm2 restart finik-api

# 6. Проверьте логи
pm2 logs finik-api --lines 30
```

## Проверка установки

```bash
# Проверьте все зависимости
npm list --depth=0

# Должны быть:
# - @mancho.devs/authorizer
# - node-fetch@3.x.x
# - express
# - и другие
```

## Если npm install не работает

Попробуйте:

```bash
# Очистите кэш и node_modules
rm -rf node_modules package-lock.json
npm cache clean --force

# Установите заново
npm install
```

## Проверка версии Node.js

```bash
node --version
```

Должно быть **18.0.0** или выше. Если нет:

```bash
# Установите Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

## После установки

Перезапустите сервер:

```bash
pm2 restart finik-api
pm2 logs finik-api --lines 20
```

Должно быть:
```
🚀 Server started on http://2.56.179.126:3000
```

Без ошибок о модулях!

