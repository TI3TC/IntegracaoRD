#!/bin/bash

# ==========================
# 🚀 DEPLOY INTEGRAÇÃORD
# ==========================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Iniciando deploy da Integração RD...${NC}"

cd ~/IntegracaoRD || { echo -e "${RED}❌ Erro: pasta ~/IntegracaoRD não encontrada.${NC}"; exit 1; }

# 1️⃣ Atualizar repositório
echo -e "${YELLOW}==> Atualizando código do GitHub...${NC}"
git fetch --all && git reset --hard origin/main || { echo -e "${RED}❌ Falha ao atualizar do GitHub.${NC}"; exit 1; }

# 2️⃣ Instalar dependências
echo -e "${YELLOW}==> Instalando dependências NPM...${NC}"
npm install --silent || { echo -e "${RED}❌ Falha ao instalar dependências.${NC}"; exit 1; }

# 3️⃣ Compilar TypeScript
echo -e "${YELLOW}==> Compilando TypeScript...${NC}"
npx tsc || { echo -e "${RED}❌ Erro na compilação TypeScript.${NC}"; exit 1; }

# 4️⃣ Reiniciar PM2
echo -e "${YELLOW}==> Reiniciando processo PM2 (integracaord)...${NC}"
pm2 delete integracaord --silent
pm2 start dist/index.js --name integracaord --update-env || { echo -e "${RED}❌ Falha ao iniciar o processo PM2.${NC}"; exit 1; }

# 5️⃣ Salvar estado
pm2 save --silent

# 6️⃣ Exibir status final
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
pm2 list | grep integracaord

echo -e "${YELLOW}==> Últimas linhas do log:${NC}"
pm2 logs integracaord --lines 10
