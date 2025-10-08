import axios from "axios";
import { upsertRDContact } from "./rdstation.service"; // chama o RD no final

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

  // Excluir oportunidades (estrelinha) e deixar apenas conversão
  if (data.eventType && data.eventType !== "conversion") {
    console.log("🔕 Ignorado no Ploomes: evento não é conversão.");
    return;
  }

  // Chave de verificação no Ploomes: Somente nome e e-mail
  const existing = await axios.get(PLOOMES_API, {
    headers: { "User-Key": token },
    params: {
      "$filter": `Emails/any(e:e/Email eq '${escapeOData(data.email)}') and Name eq '${escapeOData(
        data.name
      )}'`,
    },
  });

  // Campos customizados do Ploomes
  const otherProps = [
    ...(data.event ? [{ FieldKey: "Evento", StringValue: data.event }] : []),
    ...(data.aplicacao ? [{ FieldKey: "Aplicação", StringValue: data.aplicacao }] : []),
    ...(data.projeto
      ? [{ FieldKey: "Conte mais sobre seu projeto", StringValue: data.projeto }]
      : []),
    // ❌ NÃO enviar metragem
  ];

  if (existing.data?.value?.length > 0) {
    // Atualizar contato existente
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
    console.log(`🔄 Contato atualizado no Ploomes: ${data.email}`);
  } else {
    // Criar novo contato
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
    console.log(`✅ Novo contato criado no Ploomes: ${data.email}`);
  }

  // Ir para o RD: Cliente ativo/inativo + sincronizar Aplicação/Projeto
  if (data.aplicacao || data.projeto || typeof data.clienteAtivo === "boolean") {
    await upsertRDContact({
      email: data.email,
      name: data.name,
      aplicacao: data.aplicacao, // -> cf_aplicacao
      projeto: data.projeto,     // -> cf_conte_mais_sobre_seu_projeto
      clienteAtivo: data.clienteAtivo, // -> cf_cliente_status (se existir)
    });
  }
}

// Utilitário para filtrar OData com aspas
function escapeOData(v: string) {
  return String(v).replace(/'/g, "''").trim();
}

