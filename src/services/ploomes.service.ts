// src/services/ploomes.service.ts
import axios from "axios";

const PLOOMES_API = "https://api2.ploomes.com";
const token = process.env.PLOOMES_API_KEY?.trim();

if (!token) throw new Error("PLOOMES_API_KEY não definido no ambiente");

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  event?: string;
  aplicacao?: string;
  projeto?: string;
  fj?: string;
  clienteAtivo?: boolean;
}

// Axios instance com header padrão
const api = axios.create({
  baseURL: PLOOMES_API,
  headers: {
    "User-Key": token,
    "Content-Type": "application/json",
  },
});

// 🔹 Busca contato existente por email
async function findContactByEmail(email: string) {
  const { data } = await api.get(`/Contacts?$filter=Email eq '${email}'`);
  return data.value?.[0] || null;
}

// 🔹 Cria novo contato
async function createContact(data: LeadData) {
  const body = {
    Name: data.name,
    Email: data.email,
    Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
    OtherProperties: [
      data.aplicacao && { FieldKey: "deal_5227A40F-4DA6-41D6-A7A9-4828E23F5076", StringValue: data.aplicacao },
      data.projeto && { FieldKey: "deal_FB4DEBC2-6EA1-4A1A-950D-E094B69FFAA1", BigStringValue: data.projeto },
    ].filter(Boolean),
  };

  const { data: rsp } = await api.post("/Contacts", body);
  return rsp.value?.[0] || rsp;
}

// 🔹 Cria negócio vinculado ao contato
async function createDeal(contactId: number, title = "Novo Negócio", amount = 0) {
  // Antes de criar, checar se já há negócio aberto para o contato
  const { data: existing } = await api.get(`/Deals?$filter=ContactId eq ${contactId} and Status eq 'Open'`);
  if (existing.value?.length > 0) {
    console.log(`Negócio já existente para contato ${contactId}, ignorando duplicata.`);
    return existing.value[0];
  }

  const body = {
    Title: title,
    ContactId: contactId,
    Amount: amount,
    StageId: 40303847, // ajuste conforme pipeline desejado
    OtherProperties: [
      {
        FieldKey: "deal_origin",
        StringValue: "RD Station",
      },
    ],
  };

  const { data } = await api.post("/Deals", body);
  console.log(`Negócio criado para contato ${contactId}`);
  return data.value?.[0] || data;
}

// 🔹 Função principal
export async function sendToPloomes(data: LeadData) {
  try {
    let contact = await findContactByEmail(data.email);

    if (!contact) {
      console.log("Contato não encontrado. Criando novo...");
      contact = await createContact(data);
    } else {
      console.log(`Contato existente: ${contact.Name}`);
    }

    await createDeal(contact.Id, `Negócio - ${data.name}`, 20);

    console.log("Integração Ploomes concluída com sucesso!");
  } catch (err: any) {
    console.error("Erro ao integrar com Ploomes:", err.response?.data || err.message);
  }
}


