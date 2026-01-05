# Решение проблем с платежами

## Проблема: status=failed в paymentUrl

Если при создании платежа в URL есть `status=failed`, это означает, что платеж создан, но Финик отклонил его.

### Возможные причины:

1. **Неправильный Account ID**
   - Проверьте `FINIK_ACCOUNT_ID` в `.env`
   - Убедитесь, что это правильный ID от Финика

2. **Неправильный API Key**
   - Проверьте `FINIK_API_KEY` в `.env`
   - Убедитесь, что ключ активен и правильный

3. **Неправильное окружение**
   - Если используете тестовые данные, установите `FINIK_ENVIRONMENT=beta`
   - Если используете продакшн данные, установите `FINIK_ENVIRONMENT=production`

4. **Аккаунт не активирован**
   - Свяжитесь с представителями Финика для активации аккаунта

5. **Неправильный публичный ключ**
   - Убедитесь, что вы отправили правильный публичный ключ Финику
   - Публичный ключ должен соответствовать приватному ключу

### Решение:

1. **Проверьте переменные окружения:**
   ```bash
   cat .env | grep FINIK
   ```

2. **Проверьте логи сервера:**
   ```bash
   pm2 logs finik-api --lines 50
   ```

3. **Свяжитесь с поддержкой Финика:**
   - Уточните правильные значения `FINIK_API_KEY` и `FINIK_ACCOUNT_ID`
   - Проверьте статус аккаунта
   - Убедитесь, что публичный ключ зарегистрирован

## Проблема: {"message":"Forbidden"}

Это может быть от webhook или другого endpoint.

### Проверьте:

1. **Откуда приходит Forbidden:**
   - Проверьте логи: `pm2 logs finik-api`
   - Посмотрите, какой endpoint возвращает эту ошибку

2. **Webhook проблемы:**
   - Убедитесь, что webhook URL доступен из интернета
   - Проверьте, что порт 3000 открыт в firewall

3. **Проверка подписи:**
   - Если Forbidden от webhook, возможно проблема с проверкой подписи
   - Проверьте логи для деталей

## Диагностика

### Проверка конфигурации:

```bash
# Проверьте ключ
npm run check-key

# Проверьте переменные окружения
node -e "require('dotenv').config(); console.log('API Key:', process.env.FINIK_API_KEY ? 'SET' : 'NOT SET'); console.log('Account ID:', process.env.FINIK_ACCOUNT_ID ? 'SET' : 'NOT SET'); console.log('Environment:', process.env.FINIK_ENVIRONMENT || 'production');"

# Проверьте файл ключа
ls -la finik_private.pem
cat finik_private.pem | head -n 1
```

### Тестовый запрос:

```bash
curl -X POST http://2.56.179.126:3000/api/finik/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "redirectUrl": "http://2.56.179.126:3000/success",
    "webhookUrl": "http://2.56.179.126:3000/webhooks/finik",
    "merchantCategoryCode": "0742",
    "name_en": "Test Payment"
  }' | jq .
```

## Контакты поддержки Финика

Если проблемы не решаются:
1. Свяжитесь с представителями Финика
2. Предоставьте:
   - PaymentId из ответа
   - Логи сервера
   - Используемые credentials (без приватного ключа)
   - Окружение (beta/production)




