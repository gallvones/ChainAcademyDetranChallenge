import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import Proposal from '@/models/Proposal';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar todas as propostas do usuário
    const proposals = await Proposal.find({ userId })
      .populate('carId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      proposals,
    });
  } catch (error: any) {
    console.error('Erro ao buscar propostas:', error);

    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}
