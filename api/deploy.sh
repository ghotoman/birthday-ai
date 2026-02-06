#!/bin/bash
set -e

# Использование:
#   Без домена (только IP):  bash deploy.sh
#   С доменом + SSL:         bash deploy.sh api.example.com email@example.com

DOMAIN=$1
EMAIL=$2

echo "=== BirthdayAI Deploy ==="

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

if [ -z "$DOMAIN" ]; then
    # ======= Режим без домена (по IP) =======
    echo "Запуск по IP (без SSL)..."
    echo ""
    
    docker compose up -d --build
    
    echo ""
    echo "✓ API запущен на порте 3000"
    echo "  Проверка: curl http://$(hostname -I | awk '{print $1}'):3000/api/health"
    echo ""
    echo "Не забудь открыть порт 3000 в файрволе:"
    echo "  sudo ufw allow 3000"
else
    # ======= Режим с доменом + SSL =======
    if [ -z "$EMAIL" ]; then
        echo "Для SSL нужен email: bash deploy.sh $DOMAIN email@example.com"
        exit 1
    fi

    echo "Настройка для домена: $DOMAIN"

    # Подставить домен в nginx конфиг
    sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/nginx.conf

    # Включить nginx и certbot в docker-compose (раскомментировать)
    # ... пользователь может сделать это вручную

    # Создать директории для certbot
    mkdir -p nginx/certbot/conf nginx/certbot/www

    # Запустить всё
    docker compose up -d --build

    # Получить SSL сертификат
    docker compose run --rm certbot certonly \
        --webroot -w /var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    # Перезагрузить nginx с сертификатами
    docker compose restart nginx

    echo ""
    echo "✓ API запущен на https://$DOMAIN"
fi
