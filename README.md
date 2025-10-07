# IntegraçãoRD

Estrutura:

/root/IntegracaoRD/
├── src/
│   ├── index.ts   ← aqui
│   ├── routes.ts
│   ├── controllers/
│   │   └── rdstation.controller.ts
│   ├── services/
│   │   ├── rdstation.service.ts
│   │   └── ploomes.service.ts
│   └── utils/
├── dist/          ← aqui ficam os .js compilados (build)
├── package.json
├── tsconfig.json
├── .env

Pasta:
/root/IntegracaoRD/src/index.ts

Visualizar:
cat /root/IntegracaoRD/src/index.ts

Editar:
nano /root/IntegracaoRD/src/index.ts



Integração entre **RD Station** e **Ploomes** para sincronizar leads convertidos.

## 🚀 Endpoints

- `POST /webhook/rdstation` → Recebe webhook de conversão do RD Station.
- `GET /healthz` → Healthcheck (usado pelo RD Station para validar URL).

## 🔑 Configuração

arquivo `.env`:

```env
PORT=4100
PLOOMES_API_KEY=segredo
PLOOMES_STAGE_ID=

