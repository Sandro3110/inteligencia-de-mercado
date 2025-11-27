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
    const eAdmin = userData.role === 'admin';
    const estaAtivo = userData.ativo === 1;
    const podeAprovar = eAdmin && estaAtivo;

    // Detectar problemas
    const problemas: string[] = [];
    if (!eAdmin) {
      problemas.push('Usuário não é administrador (role != "admin")');
    }
    if (!estaAtivo) {
      problemas.push('Usuário não está ativo (ativo != 1)');
    }

    // Determinar status geral
    const statusGeral = problemas.length === 0 ? 'OK' : 'PROBLEMAS DETECTADOS';

    // Gerar solução
    let solucao = '';
    if (problemas.length === 0) {
      solucao = 'Tudo OK! Você tem permissão para aprovar usuários.';
    } else {
      if (!eAdmin && !estaAtivo) {
        solucao =
          'Você precisa: 1) Ter role "admin" no banco, 2) Estar ativo (ativo=1). Entre em contato com outro administrador.';
      } else if (!eAdmin) {
        solucao =
          'Seu role precisa ser alterado para "admin" no banco de dados. Entre em contato com outro administrador.';
      } else if (!estaAtivo) {
        solucao =
          'Sua conta precisa ser aprovada (ativo=1). Entre em contato com outro administrador.';
      }
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
