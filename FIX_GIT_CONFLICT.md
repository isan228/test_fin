# Решение конфликта при git pull на сервере

## Проблема
```
error: Your local changes to the following files would be overwritten by merge:
        package.json
```

## Решение 1: Отбросить локальные изменения (рекомендуется)

Если локальные изменения в `package.json` не важны (что обычно так и есть на сервере):

```bash
cd /var/www/finik
git checkout -- package.json
git pull origin main
```

## Решение 2: Сохранить локальные изменения

Если нужно сохранить локальные изменения:

```bash
cd /var/www/finik
git stash
git pull origin main
git stash pop
```

Если возникнут конфликты после `git stash pop`, разрешите их вручную или используйте версию из GitHub:

```bash
git checkout --theirs package.json
```

## Решение 3: Закоммитить локальные изменения

Если локальные изменения важны и нужно их сохранить:

```bash
cd /var/www/finik
git add package.json
git commit -m "Локальные изменения package.json"
git pull origin main
```

Если возникнут конфликты, разрешите их вручную в файле `package.json`, затем:

```bash
git add package.json
git commit -m "Разрешены конфликты в package.json"
```

## После успешного pull

```bash
# Установите зависимости (если они изменились)
npm install

# Перезапустите сервер
pm2 restart finik-api
```

