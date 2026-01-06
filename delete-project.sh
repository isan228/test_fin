#!/bin/bash
# Скрипт для полного удаления проекта finik

echo "⚠️  ВНИМАНИЕ: Это удалит весь проект finik!"
echo "Нажмите Ctrl+C для отмены, или Enter для продолжения..."
read

# 1. Остановите и удалите PM2 процесс
echo "Остановка PM2 процесса..."
pm2 stop finik-api 2>/dev/null || true
pm2 delete finik-api 2>/dev/null || true
pm2 save

# 2. Удалите директорию проекта
echo "Удаление директории проекта..."
rm -rf /var/www/finik

# 3. Проверка
echo "Проверка удаления..."
if [ ! -d "/var/www/finik" ]; then
    echo "✅ Директория /var/www/finik удалена"
else
    echo "❌ Ошибка: директория все еще существует"
fi

# 4. Проверка PM2
echo "Проверка PM2..."
pm2 list | grep finik-api && echo "❌ Процесс все еще существует" || echo "✅ Процесс удален"

echo ""
echo "✅ Проект удален!"
echo ""
echo "Осталось:"
echo "  - PostgreSQL (база данных)"
echo "  - Nginx (веб-сервер)"
echo "  - Node.js (среда выполнения)"
echo ""
echo "Если нужно удалить базу данных:"
echo "  sudo -u postgres psql -c 'DROP DATABASE IF EXISTS finik_db;'"

