import { Request, Response } from "express";
import { sendToPloomes } from "../services/ploomes.service";

export async function rdstationWebhook(req: Request, res: Response) {
  try {
    console.log("📥 Headers:", req.headers["content-type"]);
    console.log("📦 Tipo do body:", typeof req.body);
    console.log("📦 Body recebido:", JSON.stringify(req.body, null, 2));

    // --- detecta lead onde quer que esteja ---
    const body = req.body;
    const lead =
      Array.isArray(body.leads) && body.leads.length
        ? body.leads[0]
        : body.lead || body.payload || body.data || body;

    // --- procura o e-mail em TODO o objeto (profundidade total) ---
    const allValues = JSON.stringify(lead);
    const match = allValues.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const email = match ? match[0] : null;

    if (!email) {
      console.error("❌ Não achei e-mail! Dump completo do lead:");
      console.error(JSON.stringify(lead, null, 2));
      return res.status(400).json({ error: "missing_email" });
    }

    console.log("✅ E-mail detectado automaticamente:", email);

    // --- normaliza dados principais ---
    const data = {
      name: lead?.name || lead?.Nome || "Sem nome",
      email,
      phone:
        lead?.personal_phone ||
        lead?.mobile_phone ||
        lead?.Telefone ||
        null,
      aplicacao:
        lead?.cf_aplicacao ||
        lead?.custom_fields?.["Aplicação"] ||
        lead?.last_conversion?.content?.["Aplicação"] ||
        null,
      projeto:
        lead?.cf_conte_mais_sobre_seu_projeto ||
        lead?.custom_fields?.["Conte mais sobre seu projeto:"] ||
        lead?.last_conversion?.content?.["Conte mais sobre seu projeto:"] ||
        null,
      conversion: lead?.opportunity === "true",
    };

    console.log("📦 Lead normalizado:", JSON.stringify(data, null, 2));

    await sendToPloomes(data);
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("❌ Erro no webhook RD:", err.message);
    res.status(500).json({ error: err.message });
  }
}
