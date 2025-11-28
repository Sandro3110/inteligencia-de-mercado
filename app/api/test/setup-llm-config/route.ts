import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let sql: any = null;

  try {
    const body = await request.json();
    const { projectId, openaiApiKey } = body;

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'projectId é obrigatório',
        },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_URL não configurada',
        },
        { status: 500 }
      );
    }

    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    });

    // Usar API key fornecida ou pegar da env
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key não fornecida e OPENAI_API_KEY não configurada',
        },
        { status: 400 }
      );
    }

    // Verificar se já existe configuração para este projeto
    const existing = await sql`
      SELECT id FROM llm_provider_configs
      WHERE "projectId" = ${projectId}
    `;

    if (existing.length > 0) {
      // Atualizar
      await sql`
        UPDATE llm_provider_configs
        SET "openaiApiKey" = ${apiKey},
            "openaiEnabled" = 1,
            "activeProvider" = 'openai',
            "updatedAt" = NOW()
        WHERE "projectId" = ${projectId}
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        action: 'updated',
        projectId,
        message: 'Configuração de LLM atualizada com sucesso',
      });
    } else {
      // Inserir
      const [config] = await sql`
        INSERT INTO llm_provider_configs (
          "projectId",
          "activeProvider",
          "openaiApiKey",
          "openaiModel",
          "openaiEnabled",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${projectId},
          'openai',
          ${apiKey},
          'gpt-4o',
          1,
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        action: 'created',
        projectId,
        configId: config.id,
        message: 'Configuração de LLM criada com sucesso',
      });
    }
  } catch (error: any) {
    if (sql) await sql.end();

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
