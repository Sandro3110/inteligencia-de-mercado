import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST(request: Request) {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API Key não fornecida'
      }, { status: 400 });
    }

    // Verificar se já existe
    const existing = await sql`
      SELECT * FROM system_settings 
      WHERE "settingKey" = 'OPENAI_API_KEY'
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Atualizar
      const result = await sql`
        UPDATE system_settings 
        SET "settingValue" = ${apiKey},
            "updatedAt" = NOW()
        WHERE "settingKey" = 'OPENAI_API_KEY'
        RETURNING *
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        action: 'updated',
        setting: {
          id: result[0].id,
          settingKey: result[0].settingKey,
          description: result[0].description
        }
      });
    } else {
      // Inserir
      const result = await sql`
        INSERT INTO system_settings ("settingKey", "settingValue", description, "createdAt", "updatedAt")
        VALUES ('OPENAI_API_KEY', ${apiKey}, 'OpenAI API Key para enriquecimento', NOW(), NOW())
        RETURNING *
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        action: 'inserted',
        setting: {
          id: result[0].id,
          settingKey: result[0].settingKey,
          description: result[0].description
        }
      });
    }
  } catch (error) {
    await sql.end();
    console.error('[INSERT-OPENAI-KEY] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
