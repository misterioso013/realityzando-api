# Use uma imagem base do Node.js
FROM node:18-slim

# Instalar dependências do Chrome
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Instalar PNPM
RUN npm install -g pnpm

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN pnpm build

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV CHROME_BIN=/usr/bin/google-chrome-stable

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["pnpm", "start"]