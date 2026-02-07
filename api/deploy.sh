#!/bin/bash
set -e

DOMAIN="api.birthdayai.net"
EMAIL=$1

echo "=== BirthdayAI Deploy ==="
echo "Домен: $DOMAIN"

# Создать .env если нет
if [ ! -f .env ]; then
    echo ""
    echo "Файл .env не найден. Создаю из .env.example..."
    cp .env.example .env
    echo "⚠  Открой .env и вставь свой OPENROUTER_API_KEY:"
    echo "   nano .env"
    echo ""
    exit 1
fi

# Проверить что ключ задан
if grep -q "your-openrouter-api-key" .env 2>/dev/null; then
    echo "⚠  В .env стоит дефолтный ключ. Замени на свой:"
    echo "   nano .env"
    exit 1
fi

# Создать директории для certbot
mkdir -p nginx/certbot/conf nginx/certbot/www

# Открыть порты
echo "Открываю порты 80 и 443..."
sudo ufw allow 80
sudo ufw allow 443

# ======= Шаг 1: Запуск без SSL (нужен для certbot challenge) =======
echo ""
echo "Шаг 1: Запускаю nginx для получения сертификата..."

# Временный nginx конфиг только для HTTP (certbot challenge)
cat > nginx/nginx-temp.conf << 'NGINX'
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name api.birthdayai.net;
        location /.well-known/acme-challenge/ { root /var/www/certbot; }
        location / { return 200 'OK'; add_header Content-Type text/plain; }
    }
}
NGINX

# Запуск nginx с временным конфигом
docker compose up -d api
docker run -d --name birthdayai-nginx-temp \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro" \
    -v "$(pwd)/nginx/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

sleep 3

# ======= Шаг 2: Получить SSL сертификат =======
if [ -z "$EMAIL" ]; then
    echo "Для SSL нужен email: bash deploy.sh your@email.com"
    docker stop birthdayai-nginx-temp && docker rm birthdayai-nginx-temp
    exit 1
fi

echo ""
echo "Шаг 2: Получаю SSL сертификат..."

docker run --rm \
    -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Убираем временный nginx
docker stop birthdayai-nginx-temp && docker rm birthdayai-nginx-temp
rm nginx/nginx-temp.conf

# ======= Шаг 3: Запуск полного стека с SSL =======
echo ""
echo "Шаг 3: Запускаю полный стек с SSL..."

docker compose up -d --build

echo ""
echo "========================================="
echo "✅ API запущен на https://$DOMAIN"
echo "   Проверка: curl https://$DOMAIN/api/health"
echo "========================================="
