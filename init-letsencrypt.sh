#!/bin/bash

domains=(api-realityzando.all.dev.br)
rsa_key_size=4096
data_path="./certbot"
email="rosiel.silva@gmail.com"
staging=1 # Ativando o modo staging para testes

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo "### Stopping nginx ..."
docker-compose down

echo "### Requesting Let's Encrypt certificate for $domains ..."
#Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

# Usar a porta 8080 para o desafio
docker-compose run --rm -p 8080:80 --entrypoint "\
  certbot certonly --standalone \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal \
    --preferred-challenges http-01 \
    --http-01-port 80" certbot

echo "### Starting nginx ..."
docker-compose up -d