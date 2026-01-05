-- Исправление колонки apiKeyId в таблице payments
-- Делает колонку nullable для поддержки платежей без привязки к ApiKey

-- Шаг 1: Удаляем foreign key constraint (если есть)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_apiKeyId_fkey;

-- Шаг 2: Изменяем колонку на nullable
ALTER TABLE payments ALTER COLUMN "apiKeyId" DROP NOT NULL;

-- Шаг 3: Восстанавливаем foreign key constraint с правильными опциями
ALTER TABLE payments 
  ADD CONSTRAINT payments_apiKeyId_fkey 
  FOREIGN KEY ("apiKeyId") 
  REFERENCES api_keys(id) 
  ON UPDATE CASCADE 
  ON DELETE SET NULL;

-- Проверка: колонка должна быть nullable
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' AND column_name = 'apiKeyId';

