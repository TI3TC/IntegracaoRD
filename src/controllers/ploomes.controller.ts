import { Request, Response } from "express";
import axios from "axios";

export async function ploomesWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log("Webhook recebido do Ploomes:", JSON.stringify(payload, null, 2));

    // ex: quando um negócio é ganho no Ploomes
    if (payload.Event === "DealWon") {
      const rdPayload = {
        event_type: "CONVERSION",
        event_family: "CDP",
        payload: {
          email: payload.Contact.Email,
          name: payload.Contact.Name,
          deal_stage: "Ganho",
        },
      };

      await axios.post("https://api.rd.services/platform/conversions", rdPayload, {
        headers: {
          Authorization: `Bearer ${process.env.RD_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      console.log(" Dados enviados ao RD Station com sucesso!");
    }

    // identifica erros no caminho 

    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Erro no webhook do Ploomes → RD:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
