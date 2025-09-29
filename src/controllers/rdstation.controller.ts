import { Request, Response } from "express";
import { handleLeadFromRD } from "../services/rdstation.service";

export async function rdstationWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;

    // Chama serviço para processar lead
    await handleLeadFromRD(payload);

    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

