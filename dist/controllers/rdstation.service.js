"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUpdateToRD = sendUpdateToRD;
const axios_1 = __importDefault(require("axios"));
const RD_API = "https://api.rd.services/platform/events";
const token = process.env.RD_ACCESS_TOKEN;
async function sendUpdateToRD(payload) {
    const event = {
        event_type: "UPDATE",
        event_family: "CDP",
        payload: {
            conversion_identifier: "Atualização de negócio Ploomes",
            email: payload.email,
            cf_tipo_servico: payload.tipoServico,
            cf_segmento: payload.segmento,
            cf_escopo: payload.escopo,
            cf_stage: payload.dealStage,
        },
    };
    await axios_1.default.post(RD_API, event, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Atualização enviada ao RD: ${payload.email}`);
}
