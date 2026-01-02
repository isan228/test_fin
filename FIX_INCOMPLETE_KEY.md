# Исправление неполного ключа

## Проблема

Ваш ключ содержит только:
```
-----BEGIN PRIVATE KEY----
```

Но должен содержать:
```
-----BEGIN PRIVATE KEY-----
(много строк с закодированным ключом - около 30-40 строк)
-----END PRIVATE KEY-----
```

## Решение

### Шаг 1: Получите полный ключ

Если у вас есть файл `finik_private.pem`, откройте его и скопируйте ВСЁ содержимое:

**Windows:**
```powershell
# Откройте файл в блокноте или используйте:
Get-Content finik_private.pem
```

**Linux/Mac:**
```bash
cat finik_private.pem
```

### Шаг 2: Если файла нет - сгенерируйте новый ключ

```bash
openssl genrsa -out finik_private.pem 2048
```

Затем откройте файл и скопируйте всё содержимое.

### Шаг 3: Правильный формат в .env

В файле `.env` должно быть:

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bH0p5Zr5jpYF3bF1v1J2Z5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
-----END PRIVATE KEY-----"
```

**ВАЖНО:**
- Ключ должен быть длиной около 1700-1800 символов
- Должно быть много строк между BEGIN и END
- Должна быть строка `-----END PRIVATE KEY-----` в конце

### Шаг 4: Альтернатива - одна строка с \n

Если многострочный формат не работает, используйте одну строку:

```env
FINIK_PRIVATE_PEM="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bH0p5Zr5jpYF3bF1v1J2Z5K5K5K5K5K5K5K5K5K5K5K5K\n...\n-----END PRIVATE KEY-----"
```

## Как проверить

После исправления запустите:

```bash
npm run check-key
```

Должно показать:
- ✅ Длина ключа: ~1700-1800 символов
- ✅ Начало ключа: ✅
- ✅ Конец ключа: ✅
- ✅ Ключ успешно использован для подписи!

## Пример полного ключа

Полный приватный ключ выглядит примерно так (это пример, не используйте его!):

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bH0p5Zr5jpYF3bF1v1J2Z5K5K5K5K5K5K5K5K5K5K5K5K5K
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
... (еще около 30 строк) ...
5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K
-----END PRIVATE KEY-----
```

## Если ключа нет вообще

Сгенерируйте новый:

```bash
openssl genrsa -out finik_private.pem 2048
```

Затем откройте файл `finik_private.pem` и скопируйте ВСЁ содержимое в `.env`.



