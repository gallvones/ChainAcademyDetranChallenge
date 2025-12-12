import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import Proposal from '@/models/Proposal';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { userId, carId, email, phone, amount, description } = await request.json();

    // Validar campos obrigatórios
    if (!userId || !carId || !email || !phone || !amount || !description) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar phone (deve ser número)
    if (typeof phone !== 'number' || phone <= 0) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Validar amount (deve ser número >= 0)
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Valor da proposta inválido' },
        { status: 400 }
      );
    }

    // Criar proposta
    const proposal = await Proposal.create({
      userId,
      carId,
      email,
      phone,
      amount,
      description,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      proposalId: proposal._id.toString(),
      message: 'Proposta criada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao criar proposta:', error);

    // Se for erro de validação do MongoDB
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar proposta' },
      { status: 500 }
    );
  }
}
