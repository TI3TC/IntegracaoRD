"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rdstation_controller_1 = require("./controllers/rdstation.controller");
const ploomes_controller_1 = require("./controllers/ploomes.controller"); // 👈 novo import
console.log("✅ Routes carregado com sucesso");
const router = (0, express_1.Router)();
// ==========================
// Webhooks
// ==========================
// RD Station → Integração → Ploomes
router.post("/webhook/rdstation", rdstation_controller_1.rdstationWebhook);
// Ploomes → Integração → RD Station
router.post("/webhook/ploomes", ploomes_controller_1.ploomesWebhook); // 👈 nova rota
// ==========================
// Healthcheck
// ==========================
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
// ==========================
// Test route
// ==========================
router.get("/test", (_req, res) => {
    res.json({ ok: true });
});
exports.default = router;
