#!/bin/bash

echo "Iniciando atualização..."

# Pare os containers
echo "Parando containers..."
docker-compose down

# Puxe as alterações do git
echo "Atualizando código..."
git pull

# Reconstrua a imagem
echo "Reconstruindo imagem..."
docker-compose build

# Inicie os containers
echo "Iniciando containers..."
docker-compose up -d

# Limpe imagens não utilizadas
echo "Limpando imagens antigas..."
docker image prune -f

echo "Atualização concluída!"

# Mostrar status dos containers
echo "Status dos containers:"
docker-compose ps

# Mostrar últimos logs
echo "Últimos logs:"
docker-compose logs --tail=20