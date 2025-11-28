import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    // Buscar todas as configurações
    const settings = await sql`
      SELECT * FROM system_settings
      ORDER BY "settingKey"
    `;

    await sql.end();

    return NextResponse.json({
      success: true,
      count: settings.length,
      settings: settings.map(s => ({
        id: s.id,
        settingKey: s.settingKey,
        settingValue: s.settingValue ? `${s.settingValue.substring(0, 10)}...` : null,
        description: s.description,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    await sql.end();
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
