import { NextResponse } from 'next/server';
import { getUserByEmail } from '../../users/getuserbyemail';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais incorretas' },
        { status: 404 }
      );
    }

    // Validar senha
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Credenciais incorretas' },
        { status: 401 }
      );
    }

    // Retornar apenas os dados necessários
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    );
  }
}
