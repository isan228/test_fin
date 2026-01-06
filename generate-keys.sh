#!/bin/bash

# Генерация пары ключей для Финика
# Создает priv1.pem (приватный) и publ1.pem (публичный)

echo "═══════════════════════════════════════════════════════"
echo "🔑 Генерация пары ключей для Финика"
echo "═══════════════════════════════════════════════════════"
echo ""

# Генерируем приватный ключ
echo "1️⃣  Генерация приватного ключа (priv1.pem)..."
openssl genrsa -out priv1.pem 2048

if [ $? -eq 0 ]; then
    echo "✅ Приватный ключ создан: priv1.pem"
    chmod 600 priv1.pem
    echo "   Права доступа установлены: 600 (только владелец может читать)"
else
    echo "❌ Ошибка создания приватного ключа"
    exit 1
fi

echo ""

# Извлекаем публичный ключ
echo "2️⃣  Извлечение публичного ключа (publ1.pem)..."
openssl rsa -in priv1.pem -pubout > publ1.pem

if [ $? -eq 0 ]; then
    echo "✅ Публичный ключ создан: publ1.pem"
    chmod 644 publ1.pem
    echo "   Права доступа установлены: 644"
else
    echo "❌ Ошибка создания публичного ключа"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📋 Следующие шаги:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Отправьте публичный ключ (publ1.pem) в Финик:"
echo "   cat publ1.pem"
echo ""
echo "2. Добавьте в .env:"
echo "   FINIK_API_KEY=<ваш_новый_api_key>"
echo "   FINIK_ACCOUNT_ID=<ваш_account_id>"
echo "   FINIK_ENVIRONMENT=production"
echo ""
echo "3. Перезапустите сервер:"
echo "   pm2 restart finik-api"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

