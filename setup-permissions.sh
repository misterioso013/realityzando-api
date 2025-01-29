#!/bin/bash

echo "Configurando permissões..."

# Criar diretórios necessários
mkdir -p nginx/conf certbot/conf certbot/www data

# Configurar permissões dos diretórios
sudo chown -R $USER:$USER .
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;

# Dar permissão de execução aos scripts
chmod +x init-letsencrypt.sh update.sh

# Configurar permissões especiais para certbot
sudo chown -R $USER:$USER certbot
chmod -R 755 certbot

# Configurar permissões para o diretório de dados
sudo chown -R $USER:$USER data
chmod -R 755 data

echo "Permissões configuradas com sucesso!"

# Mostrar status das permissões
echo -e "\nStatus das permissões:"
ls -la
ls -la certbot/
ls -la nginx/