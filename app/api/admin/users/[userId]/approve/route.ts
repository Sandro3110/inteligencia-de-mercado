import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendApprovalEmail } from '@/server/services/emailService';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    console.log('🔵 [API Approve] Iniciando aprovação:', { userId });

    // Verificar se usuário logado é admin
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      console.error('❌ [API Approve] Usuário não autenticado');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    console.log('✅ [API Approve] Usuário autenticado:', currentUser.email);

    // Buscar dados do usuário atual no banco
    const [currentUserData] = await db
      .select()
      .from(users)
      .where(eq(users.email, currentUser.email))
      .limit(1);

    console.log('🔵 [API Approve] Dados do usuário atual:', {
      email: currentUserData?.email,
      role: currentUserData?.role,
    });

    if (!currentUserData || currentUserData.role !== 'admin') {
      console.error('❌ [API Approve] Acesso negado. Role:', currentUserData?.role);
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem aprovar usuários.' },
        { status: 403 }
      );
    }

    // Buscar usuário a ser aprovado
    const [userToApprove] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    console.log('🔵 [API Approve] Usuário a aprovar:', {
      id: userToApprove?.id,
      email: userToApprove?.email,
      ativo: userToApprove?.ativo,
    });

    if (!userToApprove) {
      console.error('❌ [API Approve] Usuário não encontrado:', userId);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (userToApprove.ativo === 1) {
      return NextResponse.json({ error: 'Usuário já está aprovado' }, { status: 400 });
    }

    // Aprovar usuário
    console.log('🔵 [API Approve] Atualizando usuário:', {
      userId,
      liberadoPor: currentUserData.id,
    });

    const [approvedUser] = await db
      .update(users)
      .set({
        ativo: 1,
        liberadoPor: currentUserData.id,
        liberadoEm: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();

    console.log('✅ [API Approve] Usuário atualizado:', {
      id: approvedUser.id,
      ativo: approvedUser.ativo,
    });

    // Enviar email de aprovação
    try {
      await sendApprovalEmail(approvedUser.nome, approvedUser.email);
    } catch (emailError) {
      console.error('Erro ao enviar email de aprovação:', emailError);
      // Não bloquear a aprovação se o email falhar
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário aprovado com sucesso!',
      user: {
        id: approvedUser.id,
        email: approvedUser.email,
        nome: approvedUser.nome,
        ativo: approvedUser.ativo,
        liberadoPor: approvedUser.liberadoPor,
        liberadoEm: approvedUser.liberadoEm,
      },
    });
  } catch (error) {
    console.error('❌ [API Approve] ERRO COMPLETO:', error);
    console.error('❌ [API Approve] Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error(
      '❌ [API Approve] Message:',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: 'Erro ao processar aprovação',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
