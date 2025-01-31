# Realityzando API

API para obter informações dos participantes do BBB 25, incluindo status atuais e histórico de participação.

## Funcionalidades

- Lista de participantes do BBB 25
- Status atual de cada participante (líder, paredão, imune, etc.)
- Histórico de status de cada participante
- Informações básicas (nome, foto, profissão, idade, etc.)
- Informações sobre duplas

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Puppeteer
- PNPM
- Docker

## Requisitos

- Node.js 18+
- PNPM
- Docker e Docker Compose instalados

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

## Instalação e Execução Local

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

## Instalação em Produção com Docker

### 1. Instalação do Docker e Docker Compose

```bash
# Atualize os pacotes
sudo apt-get update

# Instale dependências necessárias
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

# Adicione a chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Adicione o repositório do Docker
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

# Atualize novamente e instale o Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Instale o Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 2. Configuração Inicial

```bash
# Configure o Docker para iniciar com o sistema
sudo systemctl enable docker
sudo systemctl start docker

# Clone o repositório
git clone https://github.com/misterioso013/realityzando-api
cd realityzando-api

# Crie a rede Docker (se ainda não existir)
docker network create realityzando-network
```

### 3. Iniciando a Aplicação

```bash
# Construa e inicie os containers
docker-compose up -d

# Verifique o status
docker-compose ps

# Veja os logs
docker-compose logs -f
```

### 4. Manutenção

#### Atualização da Aplicação

Use o script `update.sh` para atualizar a aplicação:
```bash
chmod +x update.sh
./update.sh
```

O script irá:
- Parar os containers
- Atualizar o código do git
- Reconstruir as imagens
- Reiniciar os containers
- Mostrar os logs em tempo real

#### Monitoramento

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver status dos containers
docker-compose ps

# Ver uso de recursos
docker stats

# Ver últimos 100 logs
docker-compose logs --tail=100
```

### 5. Segurança

1. Configure seu firewall:
```bash
sudo ufw allow 3000
```

2. Mantenha o sistema atualizado:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Monitore os logs regularmente:
```bash
docker-compose logs --tail=100
```

### 6. Solução de Problemas

```bash
# Reiniciar container
docker-compose restart

# Ver logs
docker-compose logs -f

# Reconstruir container
docker-compose up -d --build
```

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests.