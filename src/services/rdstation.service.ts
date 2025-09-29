import { sendToPloomes } from "./ploomes.service";

export async function handleLeadFromRD(payload: any) {
  // Extrair dados importantes do lead (ajuste conforme o JSON real do RD)
  const lead = {
    name: payload?.name || payload?.nome || "Sem Nome",
    email: payload?.email || payload?.email_lead,
    phone: payload?.personal_phone || payload?.phone,
    event: payload?.event_type || "conversao",
  };

  if (!lead.email) {
    throw new Error("Webhook RD sem e-mail");
  }

  // Enviar para o Ploomes
  await sendToPloomes(lead);
}

