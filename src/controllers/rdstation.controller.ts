import { Request, Response } from "express";
import { updatePloomesClient, updatePloomesDeal } from "../services/ploomes.service";

// define e exporta uma função 
export async function rdstationWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    const { actionId, entityId } = payload;

    console.log("Webhook recebido:", JSON.stringify(payload, null, 2));

   
    // registra erros no caminho 
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook do RD:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
