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

