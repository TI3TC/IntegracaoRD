import { sendToPloomes } from "./ploomes.service";

export async function handleLeadFromRD(body: any) {
  const payload = body?.payload || {};

  const lead = {
    name: payload?.name || "Sem Nome",
    email: payload?.email,
    phone: payload?.personal_phone || payload?.mobile_phone,
    event: body?.event_type || payload?.conversion_identifier || "conversion",
    projeto: payload?.cf_conte_mais_sobre_seu_projeto,
    aplicacao: payload?.cf_aplicacao,
    fj:payload?.cf_pessoa_fisica_juridica
  };

  if (!lead.email) {
    throw new Error("Webhook RD sem e-mail");
  }

  await sendToPloomes(lead);
}
