# Обновление .env для beta окружения

## Добавление FINIK_API_PATH в .env

На сервере выполните:

```bash
cd /var/www/finik

# Добавьте переменную в .env (если её еще нет)
if ! grep -q "FINIK_API_PATH" .env; then
    echo "FINIK_API_PATH=/v1/payment" >> .env
else
    # Если уже есть, замените значение
    sed -i 's|FINIK_API_PATH=.*|FINIK_API_PATH=/v1/payment|' .env
fi

# Проверьте, что добавилось
cat .env | grep FINIK_API_PATH

# Перезапустите сервер
pm2 restart finik-api
```

## Или вручную

Отредактируйте `.env` файл:

```bash
nano .env
```

Добавьте или измените строку:
```
FINIK_API_PATH=/v1/payment
```

Сохраните (Ctrl+O, Enter, Ctrl+X) и перезапустите:
```bash
pm2 restart finik-api
```

## Проверка

После перезапуска проверьте логи:
```bash
pm2 logs finik-api --lines 50
```

В логах должно быть:
```
Path: /v1/payment
Full URL: https://beta.api.acquiring.averspay.kg/v1/payment
```

