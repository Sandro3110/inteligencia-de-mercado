import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendApprovalEmail } from '@/server/services/emailService';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    // Verificar se usuário logado é admin
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do usuário atual no banco
    const [currentUserData] = await db
      .select()
      .from(users)
      .where(eq(users.email, currentUser.email))
      .limit(1);

    if (!currentUserData || currentUserData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem aprovar usuários.' },
        { status: 403 }
      );
    }

    // Buscar usuário a ser aprovado
    const [userToApprove] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!userToApprove) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (userToApprove.ativo === 1) {
      return NextResponse.json({ error: 'Usuário já está aprovado' }, { status: 400 });
    }

    // Aprovar usuário
    const [approvedUser] = await db
      .update(users)
      .set({
        ativo: 1,
        liberadoPor: currentUserData.id,
        liberadoEm: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();

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
    console.error('Erro ao aprovar usuário:', error);
    return NextResponse.json({ error: 'Erro ao processar aprovação' }, { status: 500 });
  }
}
