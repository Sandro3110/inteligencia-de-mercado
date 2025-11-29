import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function verificarStatus() {
  const db = await getDb();

  // Verificar jobs ativos
  console.log('\n📊 JOBS ATIVOS:\n');
  const jobs = await db.execute(sql`
    SELECT id, "pesquisaId", status, "createdAt", "startedAt", "completedAt", error
    FROM enrichment_jobs
    WHERE "pesquisaId" = 11
    ORDER BY "createdAt" DESC
    LIMIT 5
  `);

  console.log('Total de jobs:', jobs.length);
  jobs.forEach((job: any) => {
    console.log(`\nJob ID ${job.id}:`);
    console.log(`  Status: ${job.status}`);
    console.log(`  Created: ${job.createdAt}`);
    console.log(`  Started: ${job.startedAt || 'N/A'}`);
    console.log(`  Completed: ${job.completedAt || 'N/A'}`);
    console.log(`  Error: ${job.error || 'N/A'}`);
  });

  // Verificar clientes enriquecidos
  console.log('\n\n📊 CLIENTES ENRIQUECIDOS:\n');
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as com_coordenadas,
      COUNT(CASE WHEN cnae IS NOT NULL THEN 1 END) as com_cnae
    FROM clientes
    WHERE "pesquisaId" = 11
  `);

  console.log('Total de clientes:', result[0].total);
  console.log('Com coordenadas:', result[0].com_coordenadas);
  console.log('Com CNAE:', result[0].com_cnae);

  // Verificar concorrentes e leads
  console.log('\n\n📊 CONCORRENTES E LEADS:\n');
  const dados = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM concorrentes WHERE "pesquisaId" = 11) as concorrentes,
      (SELECT COUNT(*) FROM leads WHERE "pesquisaId" = 11) as leads,
      (SELECT COUNT(*) FROM produtos WHERE "pesquisaId" = 11) as produtos,
      (SELECT COUNT(*) FROM mercados_unicos WHERE "pesquisaId" = 11) as mercados
  `);

  console.log('Concorrentes:', dados[0].concorrentes);
  console.log('Leads:', dados[0].leads);
  console.log('Produtos:', dados[0].produtos);
  console.log('Mercados:', dados[0].mercados);

  console.log('\n✅ Verificação concluída!\n');
}

verificarStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
