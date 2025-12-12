import { NextResponse } from 'next/server';
import { getCarById } from '../getCarById';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await getCarById(id);

    if (!car) {
      return NextResponse.json(
        { error: 'Carro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Erro ao buscar carro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar carro' },
      { status: 500 }
    );
  }
}
