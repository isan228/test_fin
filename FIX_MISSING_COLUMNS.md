# Исправление ошибки: column "callbackUrl" does not exist

## Проблема

При обращении к `/api/keys` возникает ошибка:
```json
{"success":false,"error":"column \"callbackUrl\" does not exist"}
```

Это означает, что в базе данных отсутствуют колонки, которые были добавлены в миграциях.

## Решение 1: Запустить миграции (рекомендуется)

На сервере выполните:

```bash
cd /var/www/finik
npm run migrate
```

Это выполнит все невыполненные миграции и добавит недостающие колонки:
- `callbackUrl`
- `finikApiKey`
- `accountId`
- `environment`

## Решение 2: Временное исправление через sync (не рекомендуется для продакшена)

Если миграции не работают, можно временно изменить `server.js`:

```javascript
// Изменить строку 67:
return sequelize.sync({ alter: true });  // было: alter: false
```

⚠️ **ВНИМАНИЕ:** `alter: true` может быть опасным в продакшене, так как может удалить данные при несовпадении типов.

После исправления перезапустите сервер:
```bash
pm2 restart finik-api
```

## Решение 3: Добавить колонки вручную через SQL

Если у вас есть доступ к PostgreSQL:

```sql
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "callbackUrl" VARCHAR(255);
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "finikApiKey" VARCHAR(255);
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "accountId" VARCHAR(255);
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "environment" VARCHAR(255) DEFAULT 'production' NOT NULL;
```

## Проверка после исправления

После применения любого из решений проверьте:

```bash
curl http://2.56.179.126:3000/api/keys
```

Должен вернуться список ключей без ошибок.

## Рекомендация

Используйте **Решение 1** (миграции) - это самый безопасный и правильный способ.

