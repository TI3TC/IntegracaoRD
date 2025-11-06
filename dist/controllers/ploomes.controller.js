"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ploomesWebhook = ploomesWebhook;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const rdstation_service_1 = require("../services/rdstation.service");
/**
 * Webhook do Ploomes
 * Recebe eventos de atualização de negócio (ActionId = 1, EntityId = 2)
 * e envia atualizações para o RD Station.
 */
async function ploomesWebhook(req, res) {
    try {
        const body = req.body;
        // 🔎 Log básico
        console.log("📩 Webhook Ploomes recebido:", JSON.stringify(body, null, 2));
        // ⚙️ Verifica se o evento é de atualização de negócio
        if (body?.ActionId !== 1 || body?.EntityId !== 2) {
            return res.status(200).json({ ignored: true });
        }
        const dealId = body?.Entity?.Id || body?.DealId;
        if (!dealId) {
            console.warn("⚠️ Evento sem DealId válido, ignorando.");
            return res.status(400).json({ error: "missing_dealid" });
        }
        const token = process.env.PLOOMES_API_KEY?.trim();
        if (!token)
            throw new Error("PLOOMES_API_KEY não definido");
        const api = axios_1.default.create({
            baseURL: "https://api2.ploomes.com",
            headers: { "User-Key": token, "Content-Type": "application/json" },
        });
        // 🔹 Buscar detalhes do negócio atualizado
        const { data: dealResponse } = await api.get(`/Deals(${dealId})?$expand=Contact,OtherProperties`);
        const deal = dealResponse?.value?.[0] || dealResponse;
        if (!deal)
            throw new Error(`Negócio ${dealId} não encontrado`);
        const contactEmail = deal?.Contact?.Email;
        if (!contactEmail) {
            console.warn("⚠️ Negócio sem e-mail de contato, ignorando.");
            return res.status(200).json({ skipped: "no_email" });
        }
        // Extrair campos personalizados relevantes
        const getField = (key) => deal?.OtherProperties?.find((p) => p.FieldKey === key)?.StringValue || "";
        const tipoServico = getField("tipo_servico");
        const segmento = getField("segmento");
        const escopo = getField("escopo");
        const stageName = deal?.Stage?.Name || "";
        // 🔁 Enviar atualização ao RD Station
        await (0, rdstation_service_1.sendUpdateToRD)({
            email: contactEmail,
            tipoServico,
            segmento,
            escopo,
            dealStage: stageName,
        });
        console.log(`✅ Atualização enviada ao RD Station para ${contactEmail}`);
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error("❌ Erro no webhook do Ploomes:", err.response?.data || err.message);
        return res.status(500).json({ error: err.message });
    }
}
