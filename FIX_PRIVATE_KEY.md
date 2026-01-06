# Исправление ошибки с приватным ключом

## Ошибка: `error:1E08010C:DECODER routines::unsupported`

Эта ошибка возникает когда Node.js не может декодировать приватный ключ из переменной окружения.

## Решение

### Способ 1: Использовать реальные переносы строк (рекомендуется)

В файле `.env` используйте реальные переносы строк:

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(все строки ключа здесь)
...
-----END PRIVATE KEY-----"
```

**Важно:** Используйте кавычки вокруг всего ключа!

### Способ 2: Использовать \n в одной строке

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### Способ 3: Читать ключ из файла (для продакшена)

Создайте файл `finik_private.pem` и читайте его в коде:

```javascript
const fs = require('fs');
const privateKeyPem = fs.readFileSync('finik_private.pem', 'utf8');
```

## Проверка формата ключа

Убедитесь, что ваш ключ начинается с:
- `-----BEGIN PRIVATE KEY-----` или
- `-----BEGIN RSA PRIVATE KEY-----`

И заканчивается:
- `-----END PRIVATE KEY-----` или
- `-----END RSA PRIVATE KEY-----`

## Пример правильного .env файла

```env
FINIK_API_KEY=your_api_key_here
FINIK_ACCOUNT_ID=your_account_id_here
FINIK_ENVIRONMENT=production

FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bH0p5Zr5jpYF3bF1v1J2Z5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
-----END PRIVATE KEY-----"
```

## Генерация нового ключа

Если у вас еще нет ключа, сгенерируйте его:

```bash
openssl genrsa -out finik_private.pem 2048
```

Затем скопируйте содержимое файла в `.env`:

```bash
cat finik_private.pem
```

## Отладка

Если ошибка все еще возникает:

1. Проверьте, что ключ не содержит лишних пробелов в начале/конце
2. Убедитесь, что все строки ключа присутствуют
3. Проверьте, что используется правильный формат (PEM, не DER)
4. Попробуйте перезапустить сервер после изменения .env

## Обновление кода

Код теперь автоматически нормализует ключ (заменяет \n на реальные переносы строк), но лучше использовать правильный формат с самого начала.




