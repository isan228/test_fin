# Откат изменений на сервере

## Удаление новой структуры и возврат к старой версии

На сервере выполните:

### Вариант 1: Откат к коммиту до рефакторинга

```bash
cd /var/www/finik

# Найдите коммит до рефакторинга (до "Refactor: migrate to new architecture")
git log --oneline | grep -B 5 "Refactor: migrate"

# Откатитесь к коммиту перед рефакторингом (например, 8243261)
git reset --hard 8243261

# Или откатитесь к предыдущему коммиту
git reset --hard HEAD~20
```

### Вариант 2: Удалить только новую структуру src/

```bash
cd /var/www/finik

# Удалите новую структуру
rm -rf src/

# Верните старый server.js
git checkout 8243261 -- server.js

# Верните старые routes
git checkout 8243261 -- routes/
git checkout 8243261 -- utils/

# Обновите package.json
git checkout 8243261 -- package.json

# Установите зависимости
npm install
```

### Вариант 3: Полный откат через git

```bash
cd /var/www/finik

# Сохраните текущий .env (если нужно)
cp .env .env.backup

# Откатитесь к коммиту до рефакторинга
git fetch origin
git reset --hard origin/main~20

# Или к конкретному коммиту
git reset --hard 8243261

# Восстановите .env
cp .env.backup .env

# Установите зависимости
npm install

# Перезапустите сервер
pm2 restart finik-api
```

### Вариант 4: Удалить все и клонировать заново

```bash
cd /var/www

# Сохраните .env
cp finik/.env /tmp/finik.env.backup

# Удалите проект
rm -rf finik

# Клонируйте заново
git clone https://github.com/isan228/test_fin.git finik
cd finik

# Откатитесь к старому коммиту
git reset --hard 8243261

# Восстановите .env
cp /tmp/finik.env.backup .env

# Установите зависимости
npm install

# Перезапустите сервер
pm2 restart finik-api
```

## Проверка после отката

```bash
# Проверьте, что старый server.js работает
ls -la server.js
cat server.js | head -10

# Проверьте логи
pm2 logs finik-api --lines 20

# Должно быть:
# 🚀 Сервер запущен на http://2.56.179.126:3000
# 💳 Finik Payment API: POST http://2.56.179.126:3000/api/finik/payment
```

## Коммит для отката

Коммит до рефакторинга: `8243261` (или любой коммит до "Refactor: migrate to new architecture")

