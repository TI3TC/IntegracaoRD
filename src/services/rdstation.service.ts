import axios from "axios";

const RD_BASE = "https://api.rd.services";
const RD_TOKEN = process.env.RD_ACCESS_TOKEN;

// Instância configurada
const rd = axios.create({
  baseURL: RD_BASE,
  headers: RD_TOKEN ? { Authorization: `Bearer ${RD_TOKEN}` } : undefined,
});

/**
 * Upsert de contato no RD Station
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

  try {
    await rd.post("/platform/contacts", {
      email: opts.email,
      name: opts.name,
      ...custom,
    });
    console.info(`📩 [RD] Contato criado/atualizado (POST): ${opts.email}`);
  } catch (err: any) {
    // Conflito ou já existente → faz PATCH
    if (err?.response?.status === 409 || err?.response?.status === 422) {
      await rd.patch(`/platform/contacts/email:${encodeURIComponent(opts.email)}`, {
        name: opts.name,
        ...custom,
      });
      console.info(`🩹 [RD] Contato atualizado (PATCH): ${opts.email}`);
    } else {
      console.error("❌ Erro no RD:", err?.response?.data || err.message);
    }
  }
}

/**
 * Marca venda como ganho no RD
 */
export async function markSaleInRD(email: string, reason?: string) {
  if (!RD_TOKEN) {
    console.warn("⚠️ RD_ACCESS_TOKEN não configurado; pulando markSaleInRD");
    return;
  }
  await rd.post("/platform/events", {
    event_type: "SALE",
    payload: { email, reason },
  });
  console.info(`💰 [RD] Venda registrada: ${email}`);
}

/**
 * Sincroniza cancelamento para o RD
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
  console.info(`⛔ [RD] Cancelamento registrado: ${email}`);
}

/**
 * Handler para webhook de negócios do Ploomes
 */
export async function handlePloomesDealWebhook(evt: {
  DealStatus: string;        // "Won" | "Lost" | "Canceled" | "4"
  StatusReason?: string;     // "Como ganho" | "Cancelado"
  ContactEmail?: string;
  ContactName?: string;
}) {
  if (!evt.ContactEmail) return;

  const isSale = (evt.DealStatus === "Won" || evt.DealStatus === "4") && evt.StatusReason === "Como ganho";
  if (isSale) {
    await markSaleInRD(evt.ContactEmail, evt.StatusReason);
  }

  const isCanceled = evt.DealStatus === "Canceled" || evt.StatusReason === "Cancelado";
  if (isCanceled) {
    await syncCancellationToRD(evt.ContactEmail);
  }
}

