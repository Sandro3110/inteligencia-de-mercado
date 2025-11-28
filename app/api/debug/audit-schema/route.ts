import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  let sql: any = null;

  try {
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

    // Buscar todas as colunas e identificar naming convention
    const columns = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        CASE 
          WHEN column_name ~ '^[a-z]+(_[a-z]+)+$' THEN 'snake_case'
          WHEN column_name ~ '^[a-z]+([A-Z][a-z0-9]*)+$' THEN 'camelCase'
          WHEN column_name ~ '^[A-Z]' THEN 'PascalCase'
          ELSE 'other'
        END as naming_convention
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
        AND table_name NOT LIKE '_prisma%'
        AND table_name NOT LIKE 'drizzle%'
      ORDER BY table_name, column_name
    `;

    await sql.end();

    // Agrupar por tabela
    const tablesByConvention: Record<string, any> = {};
    const mixedTables: string[] = [];

    columns.forEach((col: any) => {
      if (!tablesByConvention[col.table_name]) {
        tablesByConvention[col.table_name] = {
          snake_case: 0,
          camelCase: 0,
          PascalCase: 0,
          other: 0,
          columns: [],
        };
      }

      tablesByConvention[col.table_name][col.naming_convention]++;
      tablesByConvention[col.table_name].columns.push({
        name: col.column_name,
        type: col.data_type,
        convention: col.naming_convention,
      });
    });

    // Identificar tabelas com convenções mistas
    Object.keys(tablesByConvention).forEach((tableName) => {
      const stats = tablesByConvention[tableName];
      const conventions = [stats.snake_case, stats.camelCase, stats.PascalCase, stats.other];
      const nonZero = conventions.filter((c) => c > 0).length;

      if (nonZero > 1) {
        mixedTables.push(tableName);
      }
    });

    // Estatísticas gerais
    const totalColumns = columns.length;
    const snakeCase = columns.filter((c: any) => c.naming_convention === 'snake_case').length;
    const camelCase = columns.filter((c: any) => c.naming_convention === 'camelCase').length;
    const pascalCase = columns.filter((c: any) => c.naming_convention === 'PascalCase').length;
    const other = columns.filter((c: any) => c.naming_convention === 'other').length;

    return NextResponse.json({
      success: true,
      summary: {
        totalTables: Object.keys(tablesByConvention).length,
        totalColumns,
        byConvention: {
          snake_case: snakeCase,
          camelCase,
          PascalCase: pascalCase,
          other,
        },
        percentages: {
          snake_case: ((snakeCase / totalColumns) * 100).toFixed(2) + '%',
          camelCase: ((camelCase / totalColumns) * 100).toFixed(2) + '%',
          PascalCase: ((pascalCase / totalColumns) * 100).toFixed(2) + '%',
          other: ((other / totalColumns) * 100).toFixed(2) + '%',
        },
        mixedTablesCount: mixedTables.length,
      },
      mixedTables: mixedTables.map((tableName) => ({
        table: tableName,
        stats: {
          snake_case: tablesByConvention[tableName].snake_case,
          camelCase: tablesByConvention[tableName].camelCase,
          PascalCase: tablesByConvention[tableName].PascalCase,
          other: tablesByConvention[tableName].other,
        },
        columns: tablesByConvention[tableName].columns,
      })),
      allTables: tablesByConvention,
    });
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
