import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Next.js 15: params é uma Promise que precisa ser await
    const { userId } = await params;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário atual
    const [currentUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    // Rejeitar usuário (ativo = -1)
    await db
      .update(users)
      .set({
        ativo: -1,
        liberadoPor: currentUser.id,
        liberadoEm: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'Usuário rejeitado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error);
    return NextResponse.json({ error: 'Erro ao rejeitar usuário' }, { status: 500 });
  }
}
