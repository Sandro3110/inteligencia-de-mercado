import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário logado
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    // Buscar todos os usuários
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        nome: users.nome,
        empresa: users.empresa,
        cargo: users.cargo,
        setor: users.setor,
        role: users.role,
        ativo: users.ativo,
        created_at: users.createdAt,
        liberado_por: users.liberadoPor,
        liberado_em: users.liberadoEm,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({
      users: allUsers,
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}
