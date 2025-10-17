"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ploomes_service_1 = require("./services/ploomes.service");
(async () => {
    await (0, ploomes_service_1.sendToPloomes)({
        name: "Teste Integração RD",
        email: "teste.integracao@3tc.com.br",
        phone: "11999999999",
        aplicacao: "Residencial",
        projeto: "Teste de integração automática",
    });
})();
