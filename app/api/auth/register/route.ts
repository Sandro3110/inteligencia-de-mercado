import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendAdminNotification } from '@/server/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nome, empresa, cargo, setor } = body;

    // Validações
    if (!email || !password || !nome || !empresa || !cargo || !setor) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          empresa,
          cargo,
          setor,
        },
      },
    });

    if (authError) {
      console.error('Erro ao criar usuário no Supabase:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Criar usuário no banco com status pendente (ativo = 0)
    const [newUser] = await db
      .insert(users)
      .values({
        id: authData.user.id,
        email,
        nome,
        empresa,
        cargo,
        setor,
        senhaHash,
        role: 'visualizador',
        ativo: 0, // Pendente de aprovação
      })
      .returning();

    // Enviar email de boas-vindas para o usuário
    try {
      await sendWelcomeEmail(nome, email);
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
      // Não bloquear o cadastro se o email falhar
    }

    // Enviar notificação para administradores
    try {
      await sendAdminNotification(
        nome,
        email,
        empresa,
        cargo,
        setor,
        newUser.id
      );
    } catch (emailError) {
      console.error('Erro ao enviar notificação para admin:', emailError);
      // Não bloquear o cadastro se o email falhar
    }

    // Fazer logout imediato (usuário não pode acessar sem aprovação)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
      user: {
        id: newUser.id,
        email: newUser.email,
        nome: newUser.nome,
        ativo: newUser.ativo,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}
