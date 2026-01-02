-- Быстрое исправление: добавление недостающих колонок в таблицу api_keys
-- Выполните этот скрипт в PostgreSQL на сервере

-- Добавляем колонку callbackUrl (если её нет)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "callbackUrl" VARCHAR(255);

-- Добавляем колонку finikApiKey (если её нет)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "finikApiKey" VARCHAR(255);

-- Добавляем колонку accountId (если её нет)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "accountId" VARCHAR(255);

-- Добавляем колонку environment (если её нет)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS "environment" VARCHAR(255) DEFAULT 'production' NOT NULL;

-- Проверка: должны быть добавлены все 4 колонки
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
  AND column_name IN ('callbackUrl', 'finikApiKey', 'accountId', 'environment')
ORDER BY column_name;

