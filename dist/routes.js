"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rdstation_controller_1 = require("./controllers/rdstation.controller");
console.log("✅ Routes carregado com sucesso");
const router = (0, express_1.Router)();
// Webhook do RD Station
router.post("/webhook/rdstation", rdstation_controller_1.rdstationWebhook);
// Healthcheck
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
// Rota de teste simples
router.get("/test", (_req, res) => {
    res.json({ ok: true });
});
exports.default = router;
