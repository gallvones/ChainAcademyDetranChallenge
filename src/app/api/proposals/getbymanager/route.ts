import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json(
        { error: 'managerId é obrigatório' },
        { status: 400 }
      );
    }

    // Usar driver MongoDB direto
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 500 }
      );
    }

    const proposalsCollection = db.collection('proposals');
    const carsCollection = db.collection('cars');

    // Buscar todas as propostas onde o usuário é o manager
    const proposals = await proposalsCollection
      .find({ manager: new mongoose.Types.ObjectId(managerId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Popular os dados do carro para cada proposta
    const proposalsWithCars = await Promise.all(
      proposals.map(async (proposal) => {
        const car = await carsCollection.findOne({ _id: proposal.carId });
        return {
          ...proposal,
          carId: car || { _id: proposal.carId, name: 'Carro não encontrado' },
        };
      })
    );

    return NextResponse.json({
      success: true,
      proposals: proposalsWithCars,
    });
  } catch (error: any) {
    console.error('Erro ao buscar propostas por manager:', error);

    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}
