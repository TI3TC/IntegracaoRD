import { Router } from "express";
import { rdstationWebhook } from "./controllers/rdstation.controller";

export const router = Router();

// Webhook do RD Station
router.post("/webhook/rdstation", rdstationWebhook);

// Healthcheck
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));

