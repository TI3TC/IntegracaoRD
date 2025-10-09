import axios from "axios";

const RD_BASE = "https://api.rd.services";
const RD_TOKEN = process.env.RD_ACCESS_TOKEN;

// Instância Axios para RD
const rd = axios.create({
  baseURL: RD_BASE,
  headers: RD_TOKEN ? { Authorization: `Bearer ${RD_TOKEN}` } : undefined,
});

/**
 * Upsert de contato no RD com os campos do seu mapeamento
 * - cf_aplicacao
 * - cf_conte_mais_sobre_seu_projeto
 * - (opcional) cf_cliente_status  => "ativo" | "inativo"
 */
export async function upsertRDContact(opts: {
  email: string;
  name?: string;
  aplicacao?: string;
  projeto?: string;
  clienteAtivo?: boolean;
}) {
  if (!RD_TOKEN) {
    console.warn("⚠️ RD_ACCESS_TOKEN não configurado; pulando upsertRDContact");
    return;
  }

  const custom: Record<string, string> = {};
  if (opts.aplicacao) custom["cf_aplicacao"] = opts.aplicacao;
  if (opts.projeto) custom["cf_conte_mais_sobre_seu_projeto"] = opts.projeto;
  if (typeof opts.clienteAtivo === "boolean") {
    custom["cf_cliente_status"] = opts.clienteAtivo ? "ativo" : "inativo";
  }

  // Tenta POST (upsert). Se já existir, faz PATCH por e-mail.
  try {
    await rd.post("/platform/contacts", {
      email: opts.email,
      name: opts.name,
      ...custom,
    });
    console.log(`📩 RD: contato criado/atualizado (POST): ${opts.email}`);
  } catch (err: any) {
    if (err?.response?.status === 409 || err?.response?.status === 422) {
      await rd.patch(`/platform/contacts/email:${encodeURIComponent(opts.email)}`, {
        name: opts.name,
        ...custom,
      });
      console.log(`🩹 RD: contato atualizado (PATCH): ${opts.email}`);
    } else {
      throw err;
    }
  }
}

/**
 * Alterar a ação considerada como venda: "Como ganho"
 */
export async function markSaleInRD(email: string, reason?: string) {
  if (!RD_TOKEN) {
    console.warn("⚠️ RD_ACCESS_TOKEN não configurado; pulando markSaleInRD");
    return;
  }
  await rd.post("/platform/events", {
    event_type: "SALE",
    payload: { email, reason }, // reason esperado: "Como ganho"
  });
  console.log(`💰 RD: venda registrada para ${email}`);
}

/**
 * Quando o Ploomes retornar informação para o RD: Sincronizar o cancelamento
 */
export async function syncCancellationToRD(email: string) {
  if (!RD_TOKEN) {
    console.warn("⚠️ RD_ACCESS_TOKEN não configurado; pulando syncCancellationToRD");
    return;
  }
  await rd.post("/platform/events", {
    event_type: "CANCELLATION",
    payload: { email },
  });
  console.log(`⛔ RD: cancelamento registrado para ${email}`);
}

/**
 * (Opcional) Handler pronto para o webhook de negócios do Ploomes
 * - Chame esta função na sua rota que recebe o webhook do Ploomes
 */
export async function handlePloomesDealWebhook(evt: {
  DealStatus: string;        // "Won" | "Lost" | "Canceled" | ...
  StatusReason?: string;     // "Como ganho" | "Cancelado" | ...
  ContactEmail?: string;
  ContactName?: string;
}) {
  if (!evt.ContactEmail) return;

  const isSale = evt.DealStatus === "4"&& evt.StatusReason === "Como ganho"; //status id 4 = negocio ganho
  if (isSale) {
    await markSaleInRD(evt.ContactEmail, evt.StatusReason);
  }

  const isCanceled = evt.DealStatus === "Canceled" || evt.StatusReason === "Cancelado";
  if (isCanceled) {
    await syncCancellationToRD(evt.ContactEmail);
  }
}
