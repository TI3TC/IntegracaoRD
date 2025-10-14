import axios from "axios";
import type { LeadData } from "./rdstation.service";

const PLOOMES_API = "https://api2.ploomes.com/Contacts";

/**
 * Envia (ou atualiza) um contato no Ploomes baseado nos dados recebidos do RD Station
 */
export async function sendToPloomes(data: LeadData): Promise<void> {
  const token = process.env.PLOOMES_API_KEY?.trim();
  if (!token) throw new Error("PLOOMES_API_KEY não configurado no ambiente (.env)");

  try {
    // 1️⃣ Verifica se o contato já existe pelo e-mail
    const existing = await axios.get(PLOOMES_API, {
      headers: { "User-Key": token },
      params: {
        "$filter": `Emails/any(e:e/Email eq '${data.email}')`
      }
    });

    const alreadyExists = existing.data?.value?.length > 0;
    const contactId = alreadyExists ? existing.data.value[0].Id : null;

    // 2️⃣ Monta as propriedades customizadas
    const otherProperties = [
      { FieldKey: "deal_A58AE4B4-EB69-4066-8808-391385969E57", StringValue: data.event || "" },//Conversão (Evento)
      { FieldKey: "deal_FB4DEBC2-6EA1-4A1A-950D-E094B69FFAA1", BigStringValue: data.projeto || "" },//Conte mais sobre seu projeto
      { FieldKey: "deal_5227A40F-4DA6-41D6-A7A9-4828E23F5076", StringValue: data.aplicacao || "" },//Aplicaçao 3TC
      { FieldKey: "deal_6C491316-B171-4CF8-AF21-DE99D01EA75F", StringValue: data.fj || "" }//Fisica/Juridica
    ];

    // 3️⃣ Define payload base
    const payload = {
      Name: data.name,
      Emails: [{ Email: data.email }],
      Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
      OtherProperties: otherProperties
    };

    // 4️⃣ Decide entre criar ou atualizar
    if (alreadyExists && contactId) {
      await axios.patch(`${PLOOMES_API}(${contactId})`, payload, {
        headers: {
          "User-Key": token,
          "Content-Type": "application/json"
        }
      });
      console.log(`🔄 Contato atualizado no Ploomes: ${data.email}`);
    } else {
      await axios.post(PLOOMES_API, payload, {
        headers: {
          "User-Key": token,
          "Content-Type": "application/json"
        }
      });
      console.log(`✅ Novo contato criado no Ploomes: ${data.email}`);
    }
  } catch (error: any) {
    console.error("❌ Erro ao enviar contato para o Ploomes:", error.response?.data || error.message);
    throw error;
  }
}

