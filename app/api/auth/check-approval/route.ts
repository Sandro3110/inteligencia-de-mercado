import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('[CHECK-APPROVAL] Iniciando verificação de aprovação');

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('[CHECK-APPROVAL] Usuário Supabase:', user?.email || 'não autenticado');

    if (!user) {
      console.log('[CHECK-APPROVAL] Usuário não autenticado');
      return NextResponse.json({ approved: false, error: 'Não autenticado' }, { status: 401 });
    }

    console.log('[CHECK-APPROVAL] Buscando dados do usuário no banco:', user.email);

    // Buscar dados do usuário no banco por email
    const [userData] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    console.log('[CHECK-APPROVAL] Dados do usuário encontrados:', userData ? 'SIM' : 'NÃO');

    if (userData) {
      console.log('[CHECK-APPROVAL] Detalhes do usuário:', {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        ativo: userData.ativo,
        ativoType: typeof userData.ativo,
      });
    }

    if (!userData) {
      console.log('[CHECK-APPROVAL] Usuário não encontrado no banco');
      return NextResponse.json(
        { approved: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário está ativo (aprovado)
    // Verificar tanto número quanto string, pois pode vir de formas diferentes
    const approved = userData.ativo === 1 || userData.ativo === '1' || userData.ativo === true;

    console.log('[CHECK-APPROVAL] Status de aprovação:', {
      ativo: userData.ativo,
      approved: approved,
    });

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
    console.error('[CHECK-APPROVAL] Erro ao verificar aprovação:', error);
    console.error('[CHECK-APPROVAL] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        approved: false,
        error: 'Erro ao verificar aprovação',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
