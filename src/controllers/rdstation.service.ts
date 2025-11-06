import axios from "axios";

const RD_API = "https://api.rd.services/platform/events";
const token = process.env.RD_ACCESS_TOKEN!;

export async function sendUpdateToRD(payload: {
  email: string;
  dealStage?: string;
  tipoServico?: string;
  segmento?: string;
  escopo?: string;
}) {
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

  await axios.post(RD_API, event, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`✅ Atualização enviada ao RD: ${payload.email}`);
}
