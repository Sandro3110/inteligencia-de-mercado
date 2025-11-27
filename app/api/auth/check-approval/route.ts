import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { approved: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar dados do usuário no banco por email
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!userData) {
      return NextResponse.json(
        { approved: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário está ativo (aprovado)
    const approved = userData.ativo === 1;

    return NextResponse.json({
      approved,
      user: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        ativo: userData.ativo,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar aprovação:', error);
    return NextResponse.json(
      { approved: false, error: 'Erro ao verificar aprovação' },
      { status: 500 }
    );
  }
}
