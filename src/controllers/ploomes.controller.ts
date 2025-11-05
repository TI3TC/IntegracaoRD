import { Request, Response } from "express";
import { handleLeadFromPloomes } from "../services/ploomes.service";

export async function ploomesWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log("📩 Dados recebidos do Ploomes:", payload);

    // Chama o serviço que processa e envia dados para o RD
    await handleLeadFromPloomes(payload);
    
    // identifica erros no caminho 
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook do Ploomes:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

