

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
