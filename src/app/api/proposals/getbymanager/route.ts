import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import mongoose from 'mongoose';
import { getUfsByRegion } from '@/utils/regionMapping';

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
    const usersCollection = db.collection('users');

    // Buscar o gerente para obter sua região
    const manager = await usersCollection.findOne({
      _id: new mongoose.Types.ObjectId(managerId),
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Gerente não encontrado' },
        { status: 404 }
      );
    }

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

    // Filtrar propostas por região (se o manager tiver região definida)
    let filteredProposals = proposalsWithCars;
    if (manager.region) {
      const allowedUfs = getUfsByRegion(manager.region);

      filteredProposals = proposalsWithCars.filter((proposal) => {
        const car = proposal.carId as any;
        // Se o carro tem UF definida, verificar se está na região permitida
        if (car && car.uf) {
          return allowedUfs.includes(car.uf.toUpperCase());
        }
        // Se não tem UF, permitir por padrão (para retrocompatibilidade)
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      proposals: filteredProposals,
    });
  } catch (error: any) {
    console.error('Erro ao buscar propostas por manager:', error);

    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}
