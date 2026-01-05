-- Удаление дубликата foreign key constraint
-- В таблице payments есть два одинаковых constraint для apiKeyId

-- Удаляем дубликат (без кавычек в имени)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_apikeyid_fkey;

-- Оставляем только один правильный constraint
-- (payments_apiKeyId_fkey уже должен существовать)

-- Проверка: должен остаться только один constraint
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid = 'payments'::regclass 
-- AND conname LIKE '%apiKeyId%';

