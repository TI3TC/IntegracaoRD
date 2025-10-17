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
Data    Alteração       Responsável
2025-10-17      Correção de parser RD + detecção automática de e-mail   GPT-5 + 3TC
2025-10-16      Adicionado suporte a x-www-form-urlencoded      GPT-5
2025-10-14      Criação do módulo Ploomes com controle de duplicatas    GPT-5
2025-10-10      Estrutura inicial TypeScript + PM2 + Express    3TC Infra
📡 Endpoint ativo
Ambiente        URL     Status
Produção        https://integracao.3tc.com.br/webhook/rdstation
        ✅ Ativo
Healthcheck     https://integracao.3tc.com.br/healthz
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

👨💻 Autores
