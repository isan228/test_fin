# Проверка логов для диагностики 403 Forbidden

## Проблема

Получаете `403 Forbidden`, но в логах нет информации о пути.

## Проверка логов

### 1. Полные логи последнего запроса

```bash
pm2 logs finik-api --lines 200
```

Ищите:
- `📤 Создание платежа в Финике:`
- `Path:`
- `Base URL:`
- `Environment:`
- `Full URL:`

### 2. Проверка переменных окружения

```bash
cd /var/www/finik
cat .env | grep FINIK
```

Убедитесь:
- `FINIK_ENVIRONMENT=beta` (или `BETA`)
- `FINIK_API_PATH=/v1/payment` (если добавили)
- `FINIK_API_KEY` установлен
- `FINIK_ACCOUNT_ID` установлен

### 3. Проверка файла приватного ключа

```bash
ls -la privat1
cat privat1 | head -1
```

Убедитесь, что файл `privat1` существует и содержит ключ.

### 4. Проверка ошибок

```bash
pm2 logs finik-api --err --lines 100
```

Ищите ошибки загрузки ключа или другие проблемы.

## Возможные проблемы

### 1. Переменная FINIK_API_PATH не применилась

Проверьте:
```bash
cd /var/www/finik
cat .env | grep FINIK_API_PATH
```

Если пусто, добавьте:
```bash
echo "FINIK_API_PATH=/v1/payment" >> .env
pm2 restart finik-api
```

### 2. Сервер не перезапустился

Убедитесь, что сервер перезапустился:
```bash
pm2 restart finik-api
pm2 status
```

### 3. Логи не выводятся

Возможно, логирование отключено. Проверьте переменную:
```bash
cat .env | grep NODE_ENV
```

Для детальных логов должно быть `NODE_ENV=development` или не установлено.

## Диагностика

Выполните на сервере:

```bash
cd /var/www/finik

# 1. Проверьте .env
echo "=== .env файл ==="
cat .env | grep FINIK

# 2. Проверьте файл ключа
echo "=== Файл ключа ==="
ls -la privat1

# 3. Проверьте логи
echo "=== Последние логи ==="
pm2 logs finik-api --lines 100 --nostream

# 4. Проверьте статус PM2
echo "=== Статус PM2 ==="
pm2 status
```

## После проверки

Если `FINIK_API_PATH` не установлен, добавьте и перезапустите:

```bash
cd /var/www/finik
echo "FINIK_API_PATH=/v1/payment" >> .env
pm2 restart finik-api
```

Затем попробуйте создать платеж снова и проверьте логи.

