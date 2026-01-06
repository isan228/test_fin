# Полное удаление проекта на сервере

## ⚠️ ВНИМАНИЕ: Это удалит весь проект!

Останется только:
- PostgreSQL (база данных)
- Nginx (веб-сервер)
- Node.js (среда выполнения)

## Команды для выполнения на сервере

```bash
# 1. Остановите PM2 процесс
pm2 stop finik-api
pm2 delete finik-api

# 2. Удалите директорию проекта
rm -rf /var/www/finik

# 3. (Опционально) Удалите базу данных PostgreSQL
# ВНИМАНИЕ: Это удалит все данные!
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finik_db;"
sudo -u postgres psql -c "DROP USER IF EXISTS finik_user;"

# 4. (Опционально) Удалите пользователя PostgreSQL
# Если создавали отдельного пользователя

# 5. Проверьте, что удалено
ls -la /var/www/ | grep finik
# Не должно быть директории finik

# 6. Проверьте PM2
pm2 list
# Не должно быть finik-api
```

## Что НЕ удаляется (остается)

- ✅ PostgreSQL сервер и все другие базы данных
- ✅ Nginx сервер
- ✅ Node.js и npm
- ✅ PM2 (процесс finik-api будет удален, но PM2 останется)
- ✅ Другие проекты в /var/www/

## Если нужно сохранить данные

Перед удалением можно сделать бэкап:

```bash
# Бэкап базы данных
sudo -u postgres pg_dump finik_db > /tmp/finik_db_backup.sql

# Бэкап .env файла (если нужно)
cp /var/www/finik/.env /tmp/finik.env.backup

# Бэкап ключей (если нужно)
cp /var/www/finik/priv1.pem /tmp/priv1.pem.backup 2>/dev/null || true
cp /var/www/finik/publ1.pem /tmp/publ1.pem.backup 2>/dev/null || true
```

## После удаления

Проект полностью удален. Если нужно будет восстановить:
1. Клонируйте репозиторий заново
2. Восстановите .env файл
3. Восстановите базу данных из бэкапа (если делали)

