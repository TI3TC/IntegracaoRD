import { Request, Response } from "express";
import axios from "axios";

export async function ploomesWebhook(req: Request, res: Response) {
  try {
    const { Event, Entity, Id, Previous, Current } = req.body;
    console.log("Webhook recebido do Ploomes:", req.body);

    // traduz evento do Ploomes para actionId/entityId do padrão interno
    const actionId = 2; // sempre update
    const entityId = Entity === "Contacts" ? 1 : Entity === "Deals" ? 2 : 0;

    const payload: any = {
      actionId,
      entityId,
    };

    if (entityId === 1) {
      payload.cliente = {
        id: Id,
        nome: Current?.Name || Previous?.Name,
        segmento: Current?.Segmento || Previous?.Segmento,
        estado: Current?.Estado || Previous?.Estado,
        email: Current?.Email || Previous?.Email,
      };
    } else if (entityId === 2) {
      payload.processo = {
        id: Id,
        titulo: Current?.Title || Previous?.Title,
        segmento: Current?.Segmento || Previous?.Segmento,
        subsegmento: Current?.Subsegmento || Previous?.Subsegmento,
        origem: Current?.Origem || Previous?.Origem,
        motivo_cancelamento:
          Current?.MotivoCancelamento || Previous?.MotivoCancelamento,
      };
    } else {
      console.log(`Entidade ${Entity} não tratada.`);
      return res.status(200).json({ ignored: true });
    }

    // envia para o endpoint do RD Station
    const response = await axios.post(
      "https://integracao.3tc.com.br/webhook/rdstation",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
// identifica erros no caminho
    console.log("✅ Atualização enviada ao RD Station:", response.status);
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook do Ploomes:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
