import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib';
import Proposal from '@/models/Proposal';
import Car from '@/models/Car';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Ignora ownerId e managerId do body - serão obtidos do banco por segurança
    const { userId, carId, email, phone, amount, description } = await request.json();

    // Validar campos obrigatórios
    if (!userId || !carId || !email || !phone || !amount || !description) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar o carro para obter owner e manager
    const car = await Car.findById(carId).lean();
    if (!car) {
      return NextResponse.json(
        { error: 'Carro não encontrado' },
        { status: 404 }
      );
    }

    if (!car.owner) {
      return NextResponse.json(
        { error: 'Carro sem proprietário definido' },
        { status: 400 }
      );
    }

    if (!car.manager) {
      return NextResponse.json(
        { error: 'Carro sem gerente definido' },
        { status: 400 }
      );
    }

    // Converter owner e manager para ObjectId (independente do formato)
    const ownerId = new mongoose.Types.ObjectId(car.owner._id || car.owner);
    const managerId = new mongoose.Types.ObjectId(car.manager._id || car.manager);

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

    // Criar proposta usando driver MongoDB direto (bypass validação do Mongoose)
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 500 }
      );
    }

    const proposalsCollection = db.collection('proposals');

    const result = await proposalsCollection.insertOne({
      userId: new mongoose.Types.ObjectId(userId),
      carId: new mongoose.Types.ObjectId(carId),
      owner: ownerId,
      manager: managerId,
      email,
      phone,
      amount,
      description,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      proposalId: result.insertedId.toString(),
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

    // Se for erro de validação do schema do MongoDB (código 121)
    if (error.code === 121) {
      console.error('Erro de validação do schema MongoDB:', error.errInfo);
      return NextResponse.json(
        {
          error: 'Validação do MongoDB falhou',
          details: 'Verifique se todos os campos estão corretos',
          mongoError: error.errInfo
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar proposta' },
      { status: 500 }
    );
  }
}
