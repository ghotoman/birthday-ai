# BirthdayAI — Деплой

---

## Часть 1: Бэкенд на сервере (по IP, без домена)

### Что нужно
- VPS/сервер (Ubuntu 22.04+, минимум 1GB RAM)
- SSH доступ

### Шаг 1: Установить Docker

```bash
ssh user@YOUR_SERVER_IP

curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Перелогинься:
exit
ssh user@YOUR_SERVER_IP

# Проверка:
docker --version
```

### Шаг 2: Загрузить код на сервер

С твоего Mac:
```bash
scp -r "/Users/garri/Desktop/mobile app/api" user@YOUR_SERVER_IP:~/birthdayai-api
```

### Шаг 3: Настроить .env

```bash
cd ~/birthdayai-api
cp .env.example .env
nano .env
```

Вписать свой ключ:
```
OPENROUTER_API_KEY=sk-or-v1-ТВОЙ_КЛЮЧ
PORT=3000
CORS_ORIGINS=*
RATE_LIMIT_PER_MINUTE=30
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 4: Запустить

```bash
docker compose up -d --build
```

### Шаг 5: Проверить

```bash
# Health check
curl http://localhost:3000/api/health

# Тест генерации
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"Скажи привет"}],"max_tokens":50}'
```

Если видишь JSON ответ — всё работает.

### Шаг 6: Открыть порт

Убедись что порт 3000 открыт в файрволе:
```bash
sudo ufw allow 3000
```

Или в панели хостинга: Security Groups / Firewall → открыть TCP 3000.

Проверка с Mac:
```bash
curl http://YOUR_SERVER_IP:3000/api/health
```

---

## Часть 2: Подключить приложение

Открой файл `birthday-ai/constants/Api.ts` и замени IP:

```typescript
export const API_BASE_URL = 'http://123.45.67.89:3000';  // твой IP
```

Всё. Приложение будет ходить на твой сервер.

---

## Часть 3: Сборка мобильных билдов

### Android APK (быстрый путь)

```bash
# 1. Установи EAS CLI
npm install -g eas-cli

# 2. Залогинься в Expo
eas login

# 3. Собери APK
cd "/Users/garri/Desktop/mobile app/birthday-ai"
eas build --platform android --profile preview
```

Через ~10-15 мин получишь ссылку на .apk → скачай → отправь на телефон → установи.

### iOS (нужен Apple Developer $99/год)

```bash
eas build --platform ios --profile preview
```

---

## Управление сервером

```bash
# Логи
docker compose logs -f api

# Перезапуск
docker compose restart api

# Остановить
docker compose down

# Обновить код
scp -r "/Users/garri/Desktop/mobile app/api" user@IP:~/birthdayai-api
ssh user@IP "cd ~/birthdayai-api && docker compose up -d --build"
```

---

## Потом (когда купишь домен)

1. Купи домен, создай A-запись на IP сервера
2. Раскомментируй nginx и certbot в `docker-compose.yml`
3. Замени `YOUR_DOMAIN` в `nginx/nginx.conf`
4. Запусти `bash deploy.sh api.домен.com email@mail.com`
5. В `constants/Api.ts` замени на `https://api.домен.com`
6. Пересобери билд
