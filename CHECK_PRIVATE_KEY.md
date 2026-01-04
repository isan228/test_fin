# Проверка приватного ключа на сервере

## Проблема

При выполнении `cat .env | grep FINIK` видно, что `FINIK_PRIVATE_PEM` обрезан:
```
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY----
```

Это может означать, что ключ неполный или команда `grep` обрезала его из-за многострочности.

## Проверка полного ключа

### Способ 1: Проверить через команду check-key

```bash
cd /var/www/finik
npm run check-key
```

Эта команда покажет:
- ✅ Длину ключа (должна быть ~1700-1800 символов)
- ✅ Начало и конец ключа
- ✅ Можно ли использовать ключ для подписи

### Способ 2: Проверить через файл

Если ключ хранится в файле `finik_private.pem`:

```bash
cat finik_private.pem
```

Должен показать полный ключ:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(много строк)
...
-----END PRIVATE KEY-----
```

### Способ 3: Проверить переменную окружения напрямую

```bash
cd /var/www/finik
node -e "require('dotenv').config(); console.log('Длина ключа:', process.env.FINIK_PRIVATE_PEM?.length || 0); console.log('Начало:', process.env.FINIK_PRIVATE_PEM?.substring(0, 50)); console.log('Конец:', process.env.FINIK_PRIVATE_PEM?.substring(Math.max(0, (process.env.FINIK_PRIVATE_PEM?.length || 0) - 50)));"
```

## Если ключ неполный

### Решение 1: Использовать файл (рекомендуется)

1. Создайте файл `finik_private.pem` в корне проекта:
```bash
cd /var/www/finik
nano finik_private.pem
```

2. Вставьте полный ключ (все строки от BEGIN до END)

3. Установите права доступа:
```bash
chmod 600 finik_private.pem
```

4. Удалите `FINIK_PRIVATE_PEM` из `.env` (или оставьте, файл имеет приоритет)

5. Перезапустите сервер:
```bash
pm2 restart finik-api
```

### Решение 2: Исправить в .env

Если ключ должен быть в `.env`, убедитесь, что он полный:

1. Откройте `.env`:
```bash
nano .env
```

2. Найдите строку `FINIK_PRIVATE_PEM` и убедитесь, что она содержит:
   - Начало: `-----BEGIN PRIVATE KEY-----`
   - Много строк с закодированным ключом (около 30-40 строк)
   - Конец: `-----END PRIVATE KEY-----`

3. Если ключ в одной строке с `\n`, убедитесь, что все `\n` присутствуют

4. Сохраните и перезапустите:
```bash
pm2 restart finik-api
```

## Проверка после исправления

```bash
npm run check-key
```

Должно показать:
- ✅ Длина ключа: ~1700-1800 символов
- ✅ Начало ключа: ✅
- ✅ Конец ключа: ✅
- ✅ Ключ можно использовать для подписи

## Важно

- Ключ должен быть длиной около 1700-1800 символов
- Должно быть много строк между BEGIN и END
- Должна быть строка `-----END PRIVATE KEY-----` в конце

