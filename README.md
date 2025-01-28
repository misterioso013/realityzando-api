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

## Requisitos

- Node.js 18+
- PNPM
- Chrome/Chromium instalado (para o Puppeteer)
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

## Instalação em Produção

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

# Crie as pastas necessárias
mkdir -p nginx/conf certbot/conf certbot/www

# Configure o firewall
sudo ufw allow 80
sudo ufw allow 443
```

### 3. Configuração SSL

1. Ajuste o domínio no arquivo `nginx/conf/app.conf`:
```nginx
server_name seu-dominio.com.br;
```

2. Ajuste o e-mail no arquivo `init-letsencrypt.sh`:
```bash
email="seu-email@example.com"
```

3. Execute a configuração SSL:
```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

### 4. Iniciando a Aplicação

```bash
# Construa e inicie os containers
docker-compose up -d

# Verifique o status
docker-compose ps

# Veja os logs
docker-compose logs -f
```

### 5. Manutenção

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
- Limpar imagens antigas
- Mostrar o status e logs

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

#### Backup dos Certificados SSL

```bash
# Backup manual
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz certbot/conf/
```

### 6. Segurança

1. Limite o acesso SSH:
```bash
sudo ufw allow from seu-ip to any port 22
```

2. Mantenha o sistema atualizado:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Monitore os logs regularmente:
```bash
docker-compose logs --tail=100
```

### 7. Solução de Problemas

```bash
# Reiniciar containers
docker-compose restart

# Ver logs específicos
docker-compose logs api
docker-compose logs nginx
docker-compose logs certbot

# Verificar configuração do Nginx
docker-compose exec nginx nginx -t

# Recarregar configuração do Nginx
docker-compose exec nginx nginx -s reload
```

O certificado SSL será renovado automaticamente a cada 12 horas e o Nginx será recarregado para usar o novo certificado.