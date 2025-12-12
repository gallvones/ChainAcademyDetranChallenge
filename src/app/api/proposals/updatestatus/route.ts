import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import Proposal from '@/models/Proposal';

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();

    const { proposalId, status } = await request.json();

    // Validar campos obrigatórios
    if (!proposalId || !status) {
      return NextResponse.json(
        { error: 'proposalId e status são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar status permitidos
    const validStatuses = ['pending', 'approved', 'rejected', 'matched'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar usando o modelo Mongoose (que tem a validação atualizada)
    const result = await Proposal.updateOne(
      { _id: proposalId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status da proposta atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status da proposta:', error);

    return NextResponse.json(
      { error: 'Erro ao atualizar status da proposta' },
      { status: 500 }
    );
  }
}
