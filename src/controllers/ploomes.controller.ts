import axios from "axios";

// atualiza dados do cliente no ploomes 
export async function updatePloomesClient(payload: any) {
  try {
    const cliente = payload.cliente;
    if (!cliente?.id) {
      console.warn("Nenhum cliente informado no payload.");
      return;
    }

    const ploomesPayload = {
      Id: cliente.id,
      Segmento: cliente.segmento,
      Estado: cliente.estado
    };

    console.log("Atualizando cliente no Ploomes:", ploomesPayload);

    await axios.patch("https://api2.ploomes.com/Contacts", [ploomesPayload], {
      headers: {
        "User-Key": process.env.PLOOMES_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(`Cliente ${cliente.id} atualizado com sucesso!`);
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error.response?.data || error.message);
  }
}

// atualiza dados do PROCESSO (negócio/proposta) no Ploomes

export async function updatePloomesDeal(payload: any) {
  try {
    const processo = payload.processo;
    if (!processo?.id) {
      console.warn("Nenhum processo informado no payload.");
      return;
    }

    const ploomesPayload = {
      Id: processo.id,
      Segmento: processo.segmento,
      Subsegmento: processo.subsegmento,
      Origem: processo.origem,
      MotivoCancelamento: processo.motivo_cancelamento
    };

    console.log("Atualizando processo no Ploomes:", ploomesPayload);

    await axios.patch("https://api2.ploomes.com/Deals", [ploomesPayload], {
      headers: {
        "User-Key": process.env.PLOOMES_API_KEY,
        "Content-Type": "application/json",
      },
    });

    // identifica erros no caminho 
    console.log(` Processo ${processo.id} atualizado com sucesso!`);
  } catch (error: any) {
    console.error("Erro ao atualizar processo:", error.response?.data || error.message);
  }
}
