# Исправление ошибки: apiKeyId cannot be null

## Проблема

При создании платежа через `/api/finik/payment` возникает ошибка:
```
null value in column "apiKeyId" of relation "payments" violates not-null constraint
```

## Причина

В базе данных колонка `apiKeyId` имеет ограничение NOT NULL, но платежи могут создаваться через переменные окружения без привязки к конкретному ApiKey в БД.

## Решение

Запустите миграцию на сервере:

```bash
cd /var/www/finik
npm run migrate
```

Или напрямую через sequelize-cli:

```bash
cd /var/www/finik
npx sequelize-cli db:migrate
```

Миграция `20240101000006-fix-api-key-id-nullable.js` изменит колонку `apiKeyId` в таблице `payments`, разрешив NULL значения.

## Проверка

После запуска миграции проверьте структуру таблицы:

```bash
# Подключитесь к PostgreSQL
sudo -u postgres psql finik_db

# Проверьте структуру колонки
\d payments
```

Колонка `apiKeyId` должна иметь `nullable: true`.

## После исправления

Перезапустите сервер:

```bash
pm2 restart finik-api
```

Теперь платежи можно создавать без `apiKeyId` (когда используется прямое API через переменные окружения).

