#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Atualizando código do repositório...${NC}"
git pull

echo -e "${YELLOW}Reconstruindo e reiniciando containers...${NC}"
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo -e "${GREEN}Processo de atualização concluído!${NC}"

# Mostrar logs do container
echo -e "${YELLOW}Mostrando logs do container:${NC}"
docker-compose logs -f