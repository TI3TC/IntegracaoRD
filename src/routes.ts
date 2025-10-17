import { Router } from "express";
import { rdstationWebhook } from "./controllers/rdstation.controller";
console.log("✅ Routes carregado com sucesso");

const router = Router();

// Webhook do RD Station
router.post("/webhook/rdstation", rdstationWebhook);

// Healthcheck
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// Rota de teste simples
router.get("/test", (_req, res) => {
  res.json({ ok: true });
});

export default router;
