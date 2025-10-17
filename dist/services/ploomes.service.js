"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToPloomes = sendToPloomes;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
// ============================================
// 🔹 Função principal — chamada pelo RD Station
// ============================================
async function sendToPloomes(data) {
    try {
        const token = process.env.PLOOMES_API_KEY?.trim();
        if (!token)
            throw new Error("❌ PLOOMES_API_KEY não definido no ambiente");
        const PLOOMES_API = process.env.PLOOMES_API_URL || "https://api2-s13-app.ploomes.com";
        const api = axios_1.default.create({
            baseURL: PLOOMES_API,
            headers: {
                "User-Key": token,
                "Content-Type": "application/json",
            },
        });
        console.log(`🌐 [Ploomes] Endpoint ativo: ${PLOOMES_API}`);
        // =====================================================
        // 🔸 Etapa 1 — validar se é uma conversão do RD Station
        // =====================================================
        const isConversion = data.conversion === true ||
            data.event?.toLowerCase() === "conversion" ||
            data.eventType?.toLowerCase() === "conversion";
        if (!isConversion) {
            console.log(`⚠️ Lead ${data.email} não é uma conversão. Negócio não será criado.`);
            return;
        }
        console.log(`✅ Lead ${data.email} é uma conversão. Prosseguindo para Ploomes.`);
        // =====================================================
        // 🔸 Etapa 2 — verificar se o contato já existe
        // =====================================================
        const { data: search } = await api.get(`/Contacts?$filter=Email eq '${data.email}'`);
        let contact = search.value?.[0];
        if (!contact) {
            console.log("👤 Contato não encontrado. Criando novo...");
            const body = {
                Name: data.name,
                Email: data.email,
                Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
            };
            const { data: created } = await api.post("/Contacts", body);
            contact = created.value?.[0] || created;
            console.log(`✅ Contato criado: ${contact.Id}`);
        }
        else {
            console.log(`👤 Contato existente: ${contact.Id}`);
        }
        // =====================================================
        // 🔸 Etapa 3 — verificar se já há negócio aberto
        // =====================================================
        const { data: deals } = await api.get(`/Deals?$filter=ContactId eq ${contact.Id} and StatusId eq 1`);
        if (deals.value && deals.value.length > 0) {
            console.log(`⚠️ Contato ${contact.Id} já possui negócio aberto. Ignorando duplicata.`);
            return;
        }
        // =====================================================
        // 🔸 Etapa 4 — montar payload do novo negócio
        // =====================================================
        const bodyDeal = {
            Title: `Negócio - ${data.name}`,
            ContactId: contact.Id,
            ContactName: contact.Name,
            PersonId: Number(process.env.PLOOMES_PERSON_ID),
            PersonName: process.env.PLOOMES_PERSON_NAME,
            PipelineId: Number(process.env.PLOOMES_PIPELINE_ID),
            StageId: Number(process.env.PLOOMES_STAGE_ID),
            StatusId: 1, // 1 = Aberto
            Amount: 20,
            OtherProperties: [
                { FieldKey: "origin", StringValue: "RD Station" },
            ],
        };
        console.log("🛰️ [Ploomes] Enviando payload de negócio:");
        console.log(JSON.stringify(bodyDeal, null, 2));
        // =====================================================
        // 🔸 Etapa 5 — enviar para o Ploomes
        // =====================================================
        try {
            const response = await api.post("/Deals", bodyDeal);
            console.log("✅ [Ploomes] Negócio criado com sucesso!");
            console.log("📦 Resposta completa:", JSON.stringify(response.data, null, 2));
        }
        catch (error) {
            console.error("❌ [Ploomes] Erro ao criar negócio:");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("URL:", error.config?.url);
                console.error("Request Body:", JSON.stringify(bodyDeal, null, 2));
                console.error("Response Body:", JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.error("Mensagem:", error.message);
            }
        }
        console.log("✅ Integração RD → Ploomes concluída com sucesso!");
    }
    catch (err) {
        console.error("❌ Erro geral na integração:", err.message);
    }
}
