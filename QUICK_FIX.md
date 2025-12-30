# Быстрое исправление ошибки с ключом

## Шаг 1: Проверьте ключ

Запустите команду для проверки:

```bash
npm run check-key
```

Это покажет, в чем проблема с ключом.

## Шаг 2: Правильный формат .env

### Вариант A: Многострочный формат (рекомендуется)

В файле `.env` используйте такой формат:

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(вставьте все строки вашего ключа)
...
-----END PRIVATE KEY-----"
```

**ВАЖНО:**
- Используйте кавычки `"` в начале и конце
- Используйте реальные переносы строк (Enter)
- Не используйте `\n` в этом варианте

### Вариант B: Одна строка с \n

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

## Шаг 3: Как получить ключ из файла

Если у вас есть файл `finik_private.pem`:

### Windows (PowerShell):
```powershell
Get-Content finik_private.pem | ForEach-Object { $_ }
```

### Linux/Mac:
```bash
cat finik_private.pem
```

Скопируйте весь вывод (включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`) и вставьте в `.env` с кавычками.

## Шаг 4: Проверка после исправления

1. Сохраните `.env` файл
2. Перезапустите сервер
3. Запустите проверку: `npm run check-key`
4. Должно показать: ✅ Ключ успешно использован для подписи!

## Пример правильного .env

```env
PORT=3000
NODE_ENV=development

FINIK_API_KEY=ваш_api_ключ
FINIK_ACCOUNT_ID=ваш_account_id
FINIK_ENVIRONMENT=production

FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bH0p5Zr5jpYF3bF1v1J2Z5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
-----END PRIVATE KEY-----"
```

## Если все еще не работает

1. Убедитесь, что файл называется именно `.env` (не `.env.txt`)
2. Убедитесь, что нет лишних пробелов в начале/конце ключа
3. Попробуйте пересоздать ключ:
   ```bash
   openssl genrsa -out finik_private.pem 2048
   ```
4. Проверьте логи сервера для детальной ошибки

