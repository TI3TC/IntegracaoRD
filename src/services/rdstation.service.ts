import { Request, Response } from "express";
import { sendToPloomes, updatePloomesClient, updatePloomesDeal } from "../services/ploomes.service";

/**
 * Controller que recebe webhooks do RD Station
 * Decide qual ação tomar de acordo com o tipo (novo lead ou atualização)
 */
export async function rdstationWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log("Webhook recebido do RD Station:", JSON.stringify(payload, null, 2));

    const { actionId, entityId } = payload;

    // webhook de atualização (Action ID = 2)
    if (actionId === 2) {
      if (entityId === 1) {
        console.log("🧍 Atualização de cliente detectada");
        await updatePloomesClient(payload);
      } else if (entityId === 2) {
        console.log("📄 Atualização de processo detectada");
        await updatePloomesDeal(payload);
      } else {
        console.log("⚠️ EntityID desconhecido, evento ignorado.");
      }
    }
    // lead novo vindo do RD (sem Action/Entity ID)
    else if (payload.email || payload.name) {
      console.log("✨ Novo lead detectado. Enviando para o Ploomes...");
      await sendToPloomes({
        name: payload.name || "Lead sem nome",
        email: payload.email,
        phone: payload.phone,
        aplicacao: payload.aplicacao,
        projeto: payload.projeto,
        fj: payload.fj,
        clienteAtivo: payload.clienteAtivo,
      });
    }

    else {
      console.log("Webhook recebido em formato desconhecido, sem actionId ou dados de lead.");
    }

    // identifica um erro 
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook do RD Station:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
