import axios from "axios";

const PLOOMES_API = "https://public-api2.ploomes.com/Contacts";

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  event?: string;
  projeto:string;
  aplicacao:string;
  fj:string;
}

export async function sendToPloomes(data: LeadData) {
  const token = process.env.PLOOMES_API_KEY;
  if (!token) throw new Error("PLOOMES_API_KEY não configurado");

  // Verifica se já existe contato com o e-mail
  const existing = await axios.get(PLOOMES_API, {
    headers: { "User-Key": token },
    params: { "$filter": `Emails/any(e:e/Email eq '${data.email}')` }
  });

  if (existing.data?.value?.length > 0) {
    // Atualizar contato existente
    const id = existing.data.value[0].Id;
    await axios.patch(
      `${PLOOMES_API}(${id})`,
      {
        Name: data.name,
        Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
        OtherProperties: [
          { FieldKey: "Evento", StringValue: data.event }
        ]
      },
      { headers: { "User-Key": token, "Content-Type": "application/json" } }
    );
    console.log(`🔄 Contato atualizado no Ploomes: ${data.email}`);
  } else {
    // Criar novo contato
    await axios.post(
      PLOOMES_API,
      {
        Name: data.name,
        Emails: [{ Email: data.email }],
        Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
        OtherProperties: [
          { FieldKey: "Evento", StringValue: data.event }
        ]
      },
      { headers: { "User-Key": token, "Content-Type": "application/json" } }
    );
    console.log(`✅ Novo contato criado no Ploomes: ${data.email}`);
  }
}
