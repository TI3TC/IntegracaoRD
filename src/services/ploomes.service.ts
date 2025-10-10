import axios from "axios";
import { upsertRDContact } from "./rdstation.service";

const PLOOMES_API = "https://public-api2.ploomes.com/Contacts";

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  event?: string;
  aplicacao?: string;   // -> Ploomes: "Aplicação" | RD: cf_aplicacao
  projeto?: string;     // -> Ploomes: "Conte mais sobre seu projeto" | RD: cf_conte_mais_sobre_seu_projeto
  fj?: string;

  // Para filtrar somente conversão (critério 1)
  eventType?: "conversion" | "opportunity" | "visit";

  // Cliente ativo/inativo 
  clienteAtivo?: boolean;
}

export async function sendToPloomes(data: LeadData) {
  const token = process.env.PLOOMES_API_KEY;
  if (!token) throw new Error("PLOOMES_API_KEY não configurado");

  // Validação obrigatória
  if (!data.email || !data.name) {
    console.warn("❌ Nome e e-mail são obrigatórios para envio ao Ploomes.");
    return;
  }

  // Excluir oportunidades e visitas (mantém apenas conversões)
  if (data.eventType && data.eventType !== "conversion") {
    console.log("🔕 Ignorado no Ploomes: evento não é conversão.");
    return;
  }

  // Verifica se já existe contato (match por nome e e-mail)
  const existing = await axios.get(PLOOMES_API, {
    headers: { "User-Key": token },
    params: {
      "$filter": `Emails/any(e:e/Email eq '${escapeOData(data.email)}') and Name eq '${escapeOData(
        data.name
      )}'`,
    },
  });

  // Campos customizados
  const otherProps = [
    ...(data.event ? [{ FieldKey: "deal_A58AE4B4-EB69-4066-8808-391385969E57", StringValue: data.event }] : []),
    ...(data.aplicacao ? [{ FieldKey: "contact_F5967A1F-9EDB-429F-A341-E1278F4BB0DA", StringValue: data.aplicacao }] : []),
    ...(data.projeto ? [{ FieldKey: "contact_FB4DEBC2-6EA1-4A1A-950D-E094B69FFAA1", StringValue: data.projeto }] : []),
  ];

  try {
    if (existing.data?.value?.length > 0) {
      // Atualiza contato existente
      const id = existing.data.value[0].Id;
      await axios.patch(
        `${PLOOMES_API}(${id})`,
        {
          Name: data.name,
          Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
          OtherProperties: otherProps,
        },
        { headers: { "User-Key": token, "Content-Type": "application/json" } }
      );
      console.info(`🔄 [Ploomes] Contato atualizado: ${data.email}`);
    } else {
      // Cria novo contato
      await axios.post(
        PLOOMES_API,
        {
          Name: data.name,
          Emails: [{ Email: data.email }],
          Phones: data.phone ? [{ PhoneNumber: data.phone }] : [],
          OtherProperties: otherProps,
        },
        { headers: { "User-Key": token, "Content-Type": "application/json" } }
      );
      console.info(`✅ [Ploomes] Novo contato criado: ${data.email}`);
    }
  } catch (err: any) {
    console.error("❌ Erro ao enviar para o Ploomes:", err?.response?.data || err.message);
    return;
  }

  // Sincronizar com RD Station se houver dados relevantes
  if (data.aplicacao || data.projeto || typeof data.clienteAtivo === "boolean") {
    await upsertRDContact({
      email: data.email,
      name: data.name,
      aplicacao: data.aplicacao,
      projeto: data.projeto,
      clienteAtivo: data.clienteAtivo,
    });
  }
}

// Utilitário para escapar OData
function escapeOData(v: string) {
  return String(v).replace(/'/g, "''").trim();
}

