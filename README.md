<<<<<<< HEAD


┌───────────────────────────────────────────────────────────┐
│                        RD STATION                         │
│                                                           │
│  - Dispara Webhook → evento de conversão (CONVERSION)      │
│  - Envia payload JSON: nome, email, telefone, campos etc.  │
└───────────────────────────────────────────────────────────┘


                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                VPS (Hostinger / Ubuntu 22.04)             │
│───────────────────────────────────────────────────────────│
│  📁 /root/IntegracaoRD                                    │
│  ├── src/                                                 │
│  │   └── services/ploomes.service.ts                      │
│  ├── dist/                                                │
│  ├── .env  ← credenciais e configs                        │
│  ├── package.json                                         │
│  └── tsconfig.json                                        │
│                                                           │
│  🔹 Express API rodando na porta 4100                     │
│  🔹 Endpoint: POST /webhook/rdstation                     │
│  🔹 Gerenciado pelo PM2 → processo “integracaord”         │
│  🔹 Logs: /root/.pm2/logs/integracaord-{out,error}.log    │
│                                                           │
│  🔹 Fluxo interno:                                        │
│     1️⃣ Recebe payload RD                                 │
│     2️⃣ Valida event_type == "CONVERSION"                 │
│     3️⃣ Busca/Cria contato no Ploomes                     │
│     4️⃣ Verifica negócios abertos                         │
│     5️⃣ Cria novo negócio (Deal)                          │
│                                                           │
└───────────────────────────────────────────────────────────┘


                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                          PLOOMES                          │
│                                                           │
│  - Endpoint: https://api2-s13-app.ploomes.com             │
│  - Autenticação via User-Key (PLOOMES_API_KEY)            │
│  - Entidades:                                             │
│     🔹 Contacts                                            │
│     🔹 Deals (Pipeline: 40030343 | Stage: 40303847)       │
│                                                           │
│  ✅ Recebe dados via API REST e cria negócio automático.   │
└───────────────────────────────────────────────────────────┘

Fluxo resumido

RD Station envia um webhook (POST /webhook/rdstation).

O backend recebe, valida e extrai os dados.

Se o event_type for CONVERSION:

Busca o contato no Ploomes;

Cria se não existir;

Cria um novo negócio (Deal) no pipeline configurado.

Log completo salvo no PM2 (com payload, status e resposta da API).

# Integração RD → Ploomes (3TC)

Sistema Node.js/TypeScript que conecta o RD Station ao Ploomes via API REST,
automatizando a criação de contatos e negócios a partir de conversões.

---

## 🚀 Arquitetura

- Backend: Node.js + Express + TypeScript
- Infra: Ubuntu 22.04 VPS (Hostinger)
- Process Manager: PM2
- Logs: PM2 out/error
- Dependências: axios, dotenv, express

---

## 🔗 Fluxo de dados

1. RD Station dispara webhook → `/webhook/rdstation`
2. API valida evento `CONVERSION`
3. Busca ou cria contato no Ploomes
4. Cria novo negócio (Deal) vinculado ao pipeline

---

## ⚙️ Configuração `.env`

```bash
PLOOMES_API_URL=https://api2-s13-app.ploomes.com
PLOOMES_API_KEY=SEU_TOKEN_AQUI
PLOOMES_PIPELINE_ID=40030343
PLOOMES_STAGE_ID=40303847
PLOOMES_PERSON_ID=120001
PLOOMES_PERSON_NAME=Seu Nome Aqui
PORT=4100

Teste Manual:

curl -X POST http://localhost:4100/webhook/rdstation \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "CONVERSION",
    "payload": {
      "name": "João Teste API",
      "email": "teste.api@3tc.com.br",
      "personal_phone": "11999999999",
      "cf_aplicacao": "Residencial",
      "cf_conte_mais_sobre_seu_projeto": "Teste integração RD-Ploomes"
    }
  }'
=======
🧭 Documentação Técnica — Integração RD Station → Ploomes (3TC)
📌 Visão geral

Essa integração escuta o webhook de conversões do RD Station e cria automaticamente um contato e negócio (deal) no Ploomes.

Fluxo:

RD Station envia um webhook para https://integracao.3tc.com.br/webhook/rdstation

O servidor Node.js recebe o payload

O sistema extrai as informações relevantes do lead

Envia via API para o Ploomes:

Cria o contato (se não existir)

Cria o negócio (deal) vinculado ao contato

⚙️ Estrutura do projeto
/root/IntegracaoRD
├── src/
│   ├── index.ts                 # entrypoint da aplicação
│   ├── routes.ts                # define rotas e expõe /webhook/rdstation
│   ├── controllers/
│   │   └── rdstation.controller.ts  # processa payloads do RD Station
│   ├── services/
│   │   ├── rdstation.service.ts     # integração e utilidades (futuro)
│   │   └── ploomes.service.ts       # comunicação com a API do Ploomes
│   ├── utils/
│   │   └── logger.ts           # logs e debug (opcional)
│   └── testPloomes.ts          # testes manuais de envio
├── dist/                       # build compilado TypeScript
├── .env                        # variáveis de ambiente
├── package.json
├── tsconfig.json
├── deploy.sh                   # script de deploy automatizado
└── README.md                   # documentação (gerar com esse conteúdo)

🔑 Variáveis de ambiente (.env)
PORT=4100

# Ploomes API
PLOOMES_API_KEY=<chave API>
PLOOMES_PERSON_ID=<id da pessoa>
PLOOMES_PERSON_NAME=<nome>
PLOOMES_PIPELINE_ID=<id do pipeline>
PLOOMES_STAGE_ID=<id do estágio>

🚀 Inicialização
Desenvolvimento
npm install
npx tsc --watch
npm run start

Produção (PM2)
pm2 start dist/index.js --name integracaord
pm2 save
pm2 startup

🧱 Fluxo das rotas
POST /webhook/rdstation

Recebe o webhook do RD Station

Detecta automaticamente o e-mail (em qualquer nível do payload)

Normaliza o lead

Envia para o Ploomes via sendToPloomes()

GET /healthz

Healthcheck simples ({ status: "ok" })

🧠 Lógica principal (rdstation.controller.ts)

Faz o log de headers e tipo de body

Detecta automaticamente o e-mail via regex

Normaliza dados (nome, e-mail, telefone, aplicação, projeto)

Chama sendToPloomes()

📨 Envio ao Ploomes (ploomes.service.ts)

Busca contato por e-mail:

GET /Contacts?$filter=Email eq '${email}'


Se não existir, cria o contato:

POST /Contacts


Cria o negócio:

POST /Deals


com campos:

Title

ContactId

PersonId

PipelineId

StageId

Amount

StatusId = 1

🧰 Deploy simplificado (deploy.sh)
#!/bin/bash
cd ~/IntegracaoRD
echo "🚀 Atualizando repositório..."
git pull origin main
echo "📦 Instalando dependências..."
npm install
echo "🧱 Compilando código..."
npx tsc
echo "🔁 Reiniciando PM2..."
pm2 restart integracaord
echo "✅ Deploy concluído!"


Torne executável:

chmod +x deploy.sh

✅ Testes de integridade

Verifica se o servidor está ouvindo:

curl http://localhost:4100/healthz


Simula um webhook RD:

curl -X POST http://localhost:4100/webhook/rdstation \
  -H "Content-Type: application/json" \
  -d '{"leads":[{"email":"teste@teste.com","name":"Teste","opportunity":"true"}]}'

🧩 Logs e monitoramento
pm2 logs integracaord --lines 50
pm2 monit


Logs principais:

✅ Webhook RD recebido: <email>

📦 Lead normalizado: {...}

✅ [Ploomes] Negócio criado com sucesso!

🧾 Histórico técnico
Data	Alteração	Responsável
2025-10-17	Correção de parser RD + detecção automática de e-mail	GPT-5 + 3TC
2025-10-16	Adicionado suporte a x-www-form-urlencoded	GPT-5
2025-10-14	Criação do módulo Ploomes com controle de duplicatas	GPT-5
2025-10-10	Estrutura inicial TypeScript + PM2 + Express	3TC Infra
📡 Endpoint ativo
Ambiente	URL	Status
Produção	https://integracao.3tc.com.br/webhook/rdstation
	✅ Ativo
Healthcheck	https://integracao.3tc.com.br/healthz
	✅ OK
🔒 Segurança

Todas as chamadas Ploomes usam User-Key via .env

Nenhum dado sensível é logado

Cookie ou sessão não utilizados (API stateless)

📘 Versionamento

Repositório: https://github.com/TI3TC/IntegracaoRD

Branch principal: main

Deploy manual via deploy.sh

Versão atual: v1.0.0-prod

📈 Próximas melhorias

Retry automático se o Ploomes retornar erro 5xx

Fila de reprocessamento local (failed.json)

Logging persistente em /var/log/integracaord.log

Deploy automatizado via GitHub Actions

👨‍💻 Autores

Equipe TI 3TC
Arquitetura e automação: GPT-5
Implantação e validação: você 😎
>>>>>>> 16ef4a8 (✨ Versão estável - integração RD Station → Ploomes (documentada e testada))
