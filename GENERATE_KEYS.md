# Генерация ключей для Финика

## Быстрый способ

### 1. Сгенерируйте пару ключей

```bash
cd /var/www/finik
chmod +x generate-keys.sh
./generate-keys.sh
```

Или вручную:

```bash
# Генерируем приватный ключ
openssl genrsa -out priv1.pem 2048
chmod 600 priv1.pem

# Извлекаем публичный ключ
openssl rsa -in priv1.pem -pubout > publ1.pem
chmod 644 publ1.pem
```

### 2. Покажите публичный ключ

```bash
cat publ1.pem
```

### 3. Отправьте публичный ключ в Финик

Скопируйте весь вывод команды `cat publ1.pem` и отправьте в поддержку Финика.

### 4. Добавьте новый API Key в .env

После того, как Финик зарегистрирует публичный ключ и выдаст новый API Key:

```bash
nano .env
```

Добавьте:
```env
FINIK_API_KEY=<новый_api_key_от_финика>
FINIK_ACCOUNT_ID=<ваш_account_id>
FINIK_ENVIRONMENT=production
```

**ВАЖНО:** Не нужно добавлять `FINIK_PRIVATE_PEM` в .env - код будет использовать файл `priv1.pem` автоматически!

### 5. Перезапустите сервер

```bash
pm2 restart finik-api
```

## Как это работает

Код автоматически ищет ключ в следующем порядке:
1. **priv1.pem** (новый способ - приоритет)
2. Файл из `FINIK_PRIVATE_PEM_FILE` (если установлен)
3. `finik_private.pem` (старый способ)
4. `FINIK_PRIVATE_PEM` из .env (если файлов нет)

## Проверка

После генерации ключей проверьте:

```bash
npm run check-key
```

Должно показать:
- ✅ Ключ загружен из файла: priv1.pem
- ✅ Длина ключа: ~1700-1800 символов
- ✅ Ключ можно использовать для подписи

## Извлечение публичного ключа

Если нужно извлечь публичный ключ из priv1.pem:

```bash
npm run extract-public-key
```

Или вручную:

```bash
openssl rsa -in priv1.pem -pubout > publ1.pem
cat publ1.pem
```

## Безопасность

**ВАЖНО:**
- Никогда не коммитьте `priv1.pem` в Git!
- Установите права доступа: `chmod 600 priv1.pem`
- Добавьте в `.gitignore`:
  ```
  priv1.pem
  publ1.pem
  finik_private.pem
  ```

