# Realityzando API

API para obter informações dos participantes do BBB 25, incluindo status atuais e histórico de participação.

## Funcionalidades

- Lista de participantes do BBB 25
- Status atual de cada participante (líder, paredão, imune, etc.)
- Histórico de status de cada participante
- Informações básicas (nome, foto, profissão, idade, etc.)
- Informações sobre duplas

## Endpoints

### GET /participants

Retorna a lista de participantes com todos os seus dados.

Exemplo de resposta:
```json
{
  "bbb25": {
    "participants": [
      {
        "name": "Nome do Participante",
        "image": "URL da imagem",
        "link": "URL do perfil",
        "wasEliminated": false,
        "profession": "Profissão",
        "age": "Idade",
        "location": "Cidade/Estado",
        "partner": {
          "name": "Nome da Dupla",
          "image": "URL da imagem da dupla",
          "link": "URL do perfil da dupla"
        },
        "season": 25,
        "currentStatus": ["vip", "imune"],
        "statusHistory": {
          "lider": 0,
          "paredao": 0,
          "imune": 1,
          "anjo": 0,
          "na-mira": 0,
          "monstro": 0,
          "vip": 1,
          "xepa": 0
        }
      }
    ],
    "lastUpdate": "2025-01-28T12:00:00.000Z"
  }
}
```

### POST /participants/update

Força uma atualização dos dados dos participantes.

Exemplo de resposta:
```json
{
  "participants": [...],
  "lastUpdate": "2025-01-28T12:00:00.000Z"
}
```

## Status Possíveis

- `lider`: Líder da semana
- `paredao`: Está no paredão
- `imune`: Está imune
- `anjo`: É o anjo da semana
- `na-mira`: Está na mira do líder
- `monstro`: Está no castigo do monstro
- `vip`: Está no VIP
- `xepa`: Está na Xepa

## Instalação e Execução

1. Clone o repositório
2. Instale as dependências:
```bash
pnpm install
```

3. Execute o servidor:
```bash
pnpm start
```

O servidor iniciará na porta 3000 por padrão. Você pode alterar a porta através da variável de ambiente `PORT`.

## Atualização dos Dados

- Os dados são atualizados automaticamente a cada 30 minutos
- Você pode forçar uma atualização usando o endpoint `/participants/update`
- Os dados são armazenados em um arquivo JSON local

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Puppeteer
- PNPM

## Requisitos

- Node.js 18+
- PNPM
- Chrome/Chromium instalado (para o Puppeteer)

## Licença

MIT

## Configuração em Produção

Para executar em ambiente de produção, recomendamos usar Docker:

### Usando Docker

1. Construa a imagem:
```bash
docker build -t realityzando-api .
```

2. Execute o container:
```bash
docker run -p 3000:3000 --restart always -d realityzando-api
```

3. Visualize os logs:
```bash
# Listar containers em execução
docker ps

# Ver logs em tempo real
docker logs -f [container-id]

# Ver últimos 100 logs
docker logs --tail 100 [container-id]
```

4. Atualizar a aplicação:
```bash
# Parar o container atual
docker stop [container-id]

# Remover o container antigo
docker rm [container-id]

# Construir nova imagem
docker build -t realityzando-api .

# Rodar novo container
docker run -p 3000:3000 --restart always -d realityzando-api
```

### Dependências (apenas para execução sem Docker)

Em sistemas Linux, se você optar por não usar Docker, precisará instalar algumas dependências para o Puppeteer:

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y \
    chromium-browser \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libgbm1
```

E configurar a variável de ambiente:
```bash
export CHROME_BIN=/usr/bin/google-chrome-stable
```

### Configuração SSL com Docker

Para configurar SSL usando Nginx e Let's Encrypt:

1. Primeiro, ajuste o domínio no arquivo `nginx/conf/app.conf`:
```nginx
server_name seu-dominio.com.br;
```

2. Ajuste o e-mail no arquivo `init-letsencrypt.sh`:
```bash
email="seu-email@example.com"
```

3. Crie as pastas necessárias:
```bash
mkdir -p nginx/conf certbot/conf certbot/www
```

4. Dê permissão de execução ao script:
```bash
chmod +x init-letsencrypt.sh
```

5. Execute o script de inicialização:
```bash
./init-letsencrypt.sh
```

6. Inicie os containers:
```bash
docker-compose up -d
```

O certificado SSL será renovado automaticamente a cada 12 horas.

Para verificar os logs:
```bash
# Logs do Nginx
docker-compose logs nginx

# Logs da API
docker-compose logs api

# Logs do Certbot
docker-compose logs certbot
```