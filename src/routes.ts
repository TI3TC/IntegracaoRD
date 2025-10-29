import express from "express";
import { rdstationWebhook } from "./controllers/rdstation.controller";
import { ploomesWebhook } from "./controllers/ploomes.controller";

const router = express.Router();

// Webhooks
router.post("/rdstation/webhook", rdstationWebhook);
router.post("/ploomes/webhook", ploomesWebhook); // novo

export default router;
