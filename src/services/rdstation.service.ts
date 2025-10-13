import { sendToPloomes } from "./ploomes.service";

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  event?: string;
  projeto?: string;
  aplicacao?: string;
  fj?: string;
}

/**
 * Recebe o payload enviado pelo webhook do RD Station
 * e mapeia para o formato interno (LeadData) usado no Ploomes.
 */
export async function handleLeadFromRD(body: any): Promise<void> {
  try {
    // O RD Station envia o lead dentro de body.payload
    const payload = body?.payload || {};

    // Validação mínima: precisa ter e-mail
    if (!payload.email) {
      throw new Error("Webhook RD sem e-mail. Payload inválido.");
    }

    // Normalização e fallback dos campos
    const lead: LeadData = {
      name: payload?.name || "Sem nome",
      email: payload.email,
      phone: payload.personal_phone || payload.mobile_phone || payload.phone,
      event:
        body?.event_type ||
        payload?.conversion_identifier ||
        "conversion",
      projeto: payload?.cf_conte_mais_sobre_seu_projeto || payload?.cl_projeto,
      aplicacao: payload?.cf_aplicacao || payload?.cl_aplicacao,
      fj: payload?.cf_fj || payload?.cf_pessoa_fisica_juridica
    };

    console.log("🟦 Lead recebido do RD:", lead);

    await sendToPloomes(lead);

    console.log(`✅ Lead enviado para o Ploomes: ${lead.email}`);
  } catch (error: any) {
    console.error("❌ Erro ao processar lead do RD Station:", error.message);
    throw error;
  }
}
