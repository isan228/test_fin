# Финальное решение ошибки 403 Forbidden

## ✅ Диагностика завершена

Каноническая строка правильная:
- ✅ Порядок заголовков: `host:` первый
- ✅ Формат подписи: правильный
- ✅ Структура запроса: правильная

**Проблема НЕ в коде или подписи!**

## 🔍 Проблема в credentials или активации аккаунта

### Текущие данные из логов:
- **Окружение:** beta
- **AccountId:** `9c247f61-d1da-422b-93e5-9a1e9d9a47f3`
- **API Key:** `WUwZ0ydP6a6AfoFhiOAzB6uxqEF7GolW4XISLVMF`
- **URL:** `https://beta.api.acquiring.averspay.kg/payment`

## 📋 Что нужно проверить

### 1. Проверьте credentials в .env на сервере

```bash
cd /var/www/finik
cat .env | grep FINIK
```

Убедитесь, что:
- `FINIK_API_KEY=WUwZ0ydP6a6AfoFhiOAzB6uxqEF7GolW4XISLVMF` (полный ключ)
- `FINIK_ACCOUNT_ID=9c247f61-d1da-422b-93e5-9a1e9d9a47f3`
- `FINIK_ENVIRONMENT=beta` (или `BETA`)

### 2. Проверьте, что credentials правильные для beta

**Важно:** API Key и AccountId для **beta** окружения могут отличаться от **production**!

Убедитесь, что:
- API Key выдан для **beta** окружения
- AccountId выдан для **beta** окружения
- Вы используете правильные credentials для beta

### 3. Проверьте активацию аккаунта

Аккаунт должен быть **активирован** в **beta** окружении Финика.

### 4. Проверьте регистрацию публичного ключа

Публичный ключ должен быть **зарегистрирован** в системе Финика для **beta** окружения.

## 📞 Свяжитесь с поддержкой Финика

Отправьте им следующую информацию:

### Информация для поддержки:

```
Окружение: beta
AccountId: 9c247f61-d1da-422b-93e5-9a1e9d9a47f3
API Key: WUwZ0ydP6a6AfoFhiOAzB6uxqEF7GolW4XISLVMF
URL: https://beta.api.acquiring.averspay.kg/payment
Path: /payment

Каноническая строка (правильная):
post
/payment
host:beta.api.acquiring.averspay.kg&x-api-key:WUwZ0ydP6a6AfoFhiOAzB6uxqEF7GolW4XISLVMF&x-api-timestamp:1767550144022

{"Amount":1,"CardType":"FINIK_QR","Data":{"accountId":"9c247f61-d1da-422b-93e5-9a1e9d9a47f3","merchantCategoryCode":"0742","name_en":"Test Payment","webhookUrl":"http://2.56.179.126:3000/webhooks/finik"},"PaymentId":"a9747840-907b-4557-b18c-94225353fb17","RedirectUrl":"http://2.56.179.126:3000/success?paymentId=a9747840-907b-4557-b18c-94225353fb17"}

Ошибка: 403 Forbidden
```

### Вопросы для поддержки:

1. ✅ Аккаунт `9c247f61-d1da-422b-93e5-9a1e9d9a47f3` активирован в **beta** окружении?
2. ✅ API Key `WUwZ0ydP6a6AfoFhiOAzB6uxqEF7GolW4XISLVMF` правильный для **beta** окружения?
3. ✅ Публичный ключ зарегистрирован для этого аккаунта в **beta** окружении?
4. ✅ Формат канонической строки соответствует требованиям?

## 🔧 Альтернативные решения

### Решение 1: Попробуйте production окружение

Если у вас есть credentials для production:

```bash
# В .env на сервере
FINIK_ENVIRONMENT=production
FINIK_API_KEY=<production_api_key>
FINIK_ACCOUNT_ID=<production_account_id>
```

Затем:
```bash
pm2 restart finik-api
```

### Решение 2: Проверьте публичный ключ

Убедитесь, что публичный ключ, который вы отправили в Финик, соответствует приватному ключу на сервере:

```bash
cd /var/www/finik
npm run check-key
```

Затем отправьте публичный ключ в Финик для beta окружения, если еще не отправляли.

## 📝 Чеклист перед обращением в поддержку

- [ ] Проверил, что `FINIK_API_KEY` правильный для beta
- [ ] Проверил, что `FINIK_ACCOUNT_ID` правильный для beta
- [ ] Проверил, что `FINIK_ENVIRONMENT=beta`
- [ ] Проверил, что публичный ключ зарегистрирован в beta
- [ ] Проверил, что аккаунт активирован в beta
- [ ] Подготовил информацию для поддержки (см. выше)

## ✅ После решения проблемы

Когда поддержка Финика исправит проблему:
1. Перезапустите сервер: `pm2 restart finik-api`
2. Выполните тестовый запрос
3. Проверьте, что платеж создается успешно

