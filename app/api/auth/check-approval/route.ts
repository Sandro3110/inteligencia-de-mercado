import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import postgres from 'postgres';

export async function GET() {
  try {
    console.log('[CHECK-APPROVAL] Iniciando verificação de aprovação');
    
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('[CHECK-APPROVAL] Usuário Supabase:', user?.email || 'não autenticado');

    if (!user) {
      console.log('[CHECK-APPROVAL] Usuário não autenticado');
      return NextResponse.json(
        { approved: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('[CHECK-APPROVAL] Buscando dados do usuário no banco:', user.email);

    // Usar postgres client direto para evitar problemas com schema
    const sql = postgres(process.env.DATABASE_URL!, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    try {
      // Buscar apenas as colunas que realmente existem
      const result = await sql`
        SELECT id, email, nome, role, ativo 
        FROM users 
        WHERE email = ${user.email}
        LIMIT 1
      `;

      await sql.end();

      console.log('[CHECK-APPROVAL] Resultado da query:', result.length > 0 ? 'encontrado' : 'não encontrado');

      if (result.length === 0) {
        console.log('[CHECK-APPROVAL] Usuário não encontrado no banco');
        return NextResponse.json(
          { approved: false, error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      const userData = result[0];
      
      console.log('[CHECK-APPROVAL] Detalhes do usuário:', {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        ativo: userData.ativo,
        ativoType: typeof userData.ativo
      });

      // Verificar se usuário está ativo (aprovado)
      const approved = userData.ativo === 1 || userData.ativo === '1' || userData.ativo === true;
      
      console.log('[CHECK-APPROVAL] Status de aprovação:', {
        ativo: userData.ativo,
        approved: approved
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
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error('[CHECK-APPROVAL] Erro ao verificar aprovação:', error);
    console.error('[CHECK-APPROVAL] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { approved: false, error: 'Erro ao verificar aprovação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
