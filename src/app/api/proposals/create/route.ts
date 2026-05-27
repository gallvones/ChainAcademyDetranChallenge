import { NextResponse } from "next/server";
import { serviceNow, type TableResponse } from "@/lib";

interface CreatedProposal {
  sys_id: string;
  number: string;
}

export async function POST(request: Request) {
  try {
    const { car_name, car_chassi, purchase_offer } = await request.json();

    if (!car_name || !car_chassi || purchase_offer == null) {
      return NextResponse.json(
        { error: "car_name, car_chassi e purchase_offer são obrigatórios" },
        { status: 400 }
      );
    }

    const amount = Number(purchase_offer);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valor da proposta inválido" }, { status: 400 });
    }

    const buyer = process.env.JORGE_SYS_ID;
    if (!buyer) {
      return NextResponse.json({ error: "JORGE_SYS_ID não configurado" }, { status: 500 });
    }

    const data = await serviceNow.post<TableResponse<CreatedProposal>>(
      "/api/now/table/x_1880990_chain_proposal",
      {
        car_name,
        car_chassi,
        purchase_offer: String(amount),
        buyer,
      }
    );

    return NextResponse.json({
      success: true,
      sys_id: data.result.sys_id,
      number: data.result.number,
    });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json({ error: "Erro ao criar proposta" }, { status: 500 });
  }
}
