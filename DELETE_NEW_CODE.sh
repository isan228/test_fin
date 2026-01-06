#!/bin/bash
# Скрипт для удаления новой структуры и возврата к старой версии

cd /var/www/finik

# Сохраните .env
cp .env .env.backup

# Откатитесь к коммиту до рефакторинга
git fetch origin
git reset --hard 8243261

# Восстановите .env
cp .env.backup .env

# Удалите новую структуру src/ если она осталась
rm -rf src/

# Установите зависимости старой версии
npm install

# Перезапустите сервер
pm2 restart finik-api

echo "✅ Откат выполнен. Старая версия восстановлена."

