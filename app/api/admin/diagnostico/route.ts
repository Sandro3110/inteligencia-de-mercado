import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          statusGeral: 'ERRO',
          problemas: ['Usuário não autenticado'],
          solucao: 'Faça login novamente',
        },
        { status: 401 }
      );
    }

    // Buscar dados do usuário no banco
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.email, currentUser.email!))
      .limit(1);

    if (!userData) {
      return NextResponse.json({
        statusGeral: 'ERRO',
        usuario: {
          email: currentUser.email,
          nome: 'NÃO ENCONTRADO',
          role: 'N/A',
          ativo: -1,
        },
        permissoes: {
          podeAprovar: false,
          eAdmin: false,
          estaAtivo: false,
        },
        problemas: [
          'Usuário autenticado no Supabase mas não existe no banco de dados',
          'Isso pode acontecer se o cadastro não foi completado',
        ],
        solucao: 'Entre em contato com o administrador ou tente fazer um novo cadastro',
      });
    }

    // Verificar permissões
    const estaAtivo = userData.ativo === 1;
    const eAdmin = true; // Todos são admin agora
    const podeAprovar = estaAtivo;

    // Detectar problemas
    const problemas: string[] = [];
    if (!estaAtivo) {
      problemas.push('Usuário não está ativo (ativo != 1)');
    }

    // Determinar status geral
    const statusGeral = problemas.length === 0 ? 'OK' : 'PROBLEMAS DETECTADOS';

    // Gerar solução
    let solucao = '';
    if (problemas.length === 0) {
      solucao = 'Tudo OK! Você tem permissão para usar o sistema.';
    } else {
      solucao = 'Sua conta precisa ser aprovada (ativo=1). Entre em contato com outro usuário.';
    }

    return NextResponse.json({
      statusGeral,
      usuario: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        ativo: userData.ativo,
        empresa: userData.empresa,
        cargo: userData.cargo,
      },
      permissoes: {
        podeAprovar,
        eAdmin,
        estaAtivo,
      },
      problemas,
      solucao,
      debug: {
        supabaseUserId: currentUser.id,
        databaseUserId: userData.id,
        idsMatch: currentUser.id === userData.id,
      },
    });
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    return NextResponse.json(
      {
        statusGeral: 'ERRO',
        problemas: ['Erro ao executar diagnóstico'],
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
