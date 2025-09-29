# IntegraçãoRD

Integração entre **RD Station** e **Ploomes** para sincronizar leads convertidos.

## 🚀 Endpoints

- `POST /webhook/rdstation` → Recebe webhook de conversão do RD Station.
- `GET /healthz` → Healthcheck (usado pelo RD Station para validar URL).

## 🔑 Configuração

Criar arquivo `.env`:

```env
PORT=4000
PLOOMES_API_KEY=coloque_sua_user_key_aqui
