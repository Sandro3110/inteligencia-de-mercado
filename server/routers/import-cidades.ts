import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Mapa de códigos UF para siglas
const ufMap: Record<number, string> = {
  11: 'RO',
  12: 'AC',
  13: 'AM',
  14: 'RR',
  15: 'PA',
  16: 'AP',
  17: 'TO',
  21: 'MA',
  22: 'PI',
  23: 'CE',
  24: 'RN',
  25: 'PB',
  26: 'PE',
  27: 'AL',
  28: 'SE',
  29: 'BA',
  31: 'MG',
  32: 'ES',
  33: 'RJ',
  35: 'SP',
  41: 'PR',
  42: 'SC',
  43: 'RS',
  50: 'MS',
  51: 'MT',
  52: 'GO',
  53: 'DF',
};

export const importCidadesRouter = router({
  importFromCSV: publicProcedure.mutation(async () => {
    const db = getDb();

    console.log('🚀 Iniciando importação de municípios brasileiros...');

    // Ler arquivo CSV
    const csvPath = path.join(process.cwd(), '..', 'municipios_brasileiros.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo não encontrado: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // Pular cabeçalho

    console.log(`📊 Total de linhas: ${lines.length}`);

    const batchSize = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);
      const records = batch
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split(',');
          const codigo_ibge = parseInt(parts[0]);
          const nome = parts[1].trim();
          const latitude = parseFloat(parts[2]);
          const longitude = parseFloat(parts[3]);
          const capital = parts[4] === '1';
          const codigo_uf = parseInt(parts[5]);
          const uf = ufMap[codigo_uf] || '';
          const siafi_id = parts[6];
          const ddd = parseInt(parts[7]) || null;
          const fuso_horario = parts[8]?.trim() || null;

          return {
            codigo_ibge,
            nome,
            latitude,
            longitude,
            capital,
            codigo_uf,
            uf,
            siafi_id,
            ddd,
            fuso_horario,
          };
        });

      try {
        // Inserir batch usando SQL raw
        const values = records
          .map(
            (r) =>
              `(${r.codigo_ibge}, '${r.nome.replace(/'/g, "''")}', ${r.latitude}, ${r.longitude}, ${r.capital}, ${r.codigo_uf}, '${r.uf}', '${r.siafi_id}', ${r.ddd || 'NULL'}, ${r.fuso_horario ? `'${r.fuso_horario}'` : 'NULL'})`
          )
          .join(',\n');

        await db.execute(
          sql.raw(`
            INSERT INTO cidades_brasil (codigo_ibge, nome, latitude, longitude, capital, codigo_uf, uf, siafi_id, ddd, fuso_horario)
            VALUES ${values}
            ON CONFLICT (codigo_ibge) DO NOTHING
          `)
        );

        imported += records.length;
        console.log(
          `✅ Batch ${i / batchSize + 1}: ${records.length} municípios importados (total: ${imported})`
        );
      } catch (err: any) {
        console.error(`❌ Erro ao processar batch ${i / batchSize + 1}:`, err.message);
        errors += records.length;
      }
    }

    console.log('\n📊 Resumo da Importação:');
    console.log(`✅ Importados: ${imported}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📍 Total: ${imported + errors}`);

    return {
      success: true,
      imported,
      errors,
      total: imported + errors,
    };
  }),

  checkStatus: publicProcedure.query(async () => {
    const db = getDb();

    const result = await db.execute(sql`
        SELECT COUNT(*) as total FROM cidades_brasil
      `);

    return {
      totalCidades: result.rows[0]?.total || 0,
    };
  }),
});
