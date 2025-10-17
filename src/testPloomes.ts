import { sendToPloomes } from "./services/ploomes.service";

(async () => {
  await sendToPloomes({
    name: "Teste Integração RD",
    email: "teste.integracao@3tc.com.br",
    phone: "11999999999",
    aplicacao: "Residencial",
    projeto: "Teste de integração automática",
  });
})();
