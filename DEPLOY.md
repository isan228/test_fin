# Инструкция по деплою на сервер 2.56.179.126

## Быстрый старт

### 1. Подготовка на сервере

```bash
# Установите Node.js и PostgreSQL (если еще не установлены)
# Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib

# Создайте базу данных
sudo -u postgres psql
CREATE DATABASE finik_db;
CREATE USER finik_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE finik_db TO finik_user;
\q
```

### 2. Загрузка кода на сервер

```bash
# Через Git (рекомендуется)
git clone <your-repo-url> /var/www/finik
cd /var/www/finik

# Или через SCP
scp -r . user@2.56.179.126:/var/www/finik
```

### 3. Настройка

```bash
cd /var/www/finik

# Установите зависимости
npm install

# Создайте .env файл
cp env.example .env
nano .env  # Отредактируйте с вашими данными
```

Настройте `.env`:
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finik_db
DB_USER=finik_user
DB_PASSWORD=your_secure_password
SERVER_IP=2.56.179.126
SERVER_URL=http://2.56.179.126:3000
```

### 4. Запуск миграций

```bash
npm run migrate
```

### 5. Запуск сервера

#### Вариант 1: PM2 (рекомендуется для продакшена)

```bash
npm install -g pm2
pm2 start server.js --name finik-api
pm2 save
pm2 startup  # Настройка автозапуска
```

#### Вариант 2: systemd

Создайте файл `/etc/systemd/system/finik.service`:
```ini
[Unit]
Description=Finik API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/finik
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запустите:
```bash
sudo systemctl enable finik
sudo systemctl start finik
sudo systemctl status finik
```

### 6. Настройка Firewall

```bash
# Откройте порт 3000
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 7. Настройка Nginx (опционально, для проксирования)

Создайте `/etc/nginx/sites-available/finik`:
```nginx
server {
    listen 80;
    server_name 2.56.179.126;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/finik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Проверка работы

1. Откройте в браузере: http://2.56.179.126:3000
2. Проверьте API: http://2.56.179.126:3000/api/keys
3. Проверьте логи: `pm2 logs finik-api` или `journalctl -u finik -f`

## Обновление

```bash
cd /var/www/finik
git pull
npm install
npm run migrate  # Если есть новые миграции
pm2 restart finik-api
```

## Troubleshooting

- **Ошибка подключения к БД**: Проверьте настройки в `.env` и доступность PostgreSQL
- **Порт занят**: Измените PORT в `.env` или освободите порт
- **Права доступа**: Убедитесь, что у пользователя есть права на директорию проекта

