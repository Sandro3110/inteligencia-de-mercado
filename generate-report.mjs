import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║        RELATÓRIO COMPLETO DO SISTEMA DE ENRIQUECIMENTO        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Estatísticas gerais
const [mercados] = await connection.query('SELECT COUNT(*) as count FROM mercados_unicos WHERE projectId = 1');
const [clientes] = await connection.query('SELECT COUNT(*) as count FROM clientes WHERE projectId = 1');
const [concorrentes] = await connection.query('SELECT COUNT(*) as count FROM concorrentes WHERE projectId = 1');
const [leads] = await connection.query('SELECT COUNT(*) as count FROM leads WHERE projectId = 1');
const [produtos] = await connection.query('SELECT COUNT(*) as count FROM produtos WHERE projectId = 1');

console.log('📊 ESTATÍSTICAS GERAIS DO BANCO');
console.log('════════════════════════════════════════════════════════════════');
console.log(`   Mercados Únicos: ${mercados[0].count}`);
console.log(`   Clientes: ${clientes[0].count}`);
console.log(`   Concorrentes: ${concorrentes[0].count}`);
console.log(`   Leads: ${leads[0].count}`);
console.log(`   Produtos: ${produtos[0].count}`);
console.log(`   Total de Registros: ${mercados[0].count + clientes[0].count + concorrentes[0].count + leads[0].count + produtos[0].count}`);

// Jobs de enriquecimento
const [jobs] = await connection.query(`
  SELECT id, totalClientes, processedClientes, status, 
         createdAt, startedAt, completedAt, pausedAt
  FROM enrichment_jobs 
  ORDER BY createdAt DESC 
  LIMIT 5
`);

console.log('\n\n🔄 HISTÓRICO DE JOBS DE ENRIQUECIMENTO');
console.log('════════════════════════════════════════════════════════════════');
if (jobs.length === 0) {
  console.log('   Nenhum job executado ainda.');
} else {
  jobs.forEach((job, idx) => {
    console.log(`\n   Job #${job.id} (${job.status.toUpperCase()})`);
    console.log(`   ├─ Total de Clientes: ${job.totalClientes}`);
    console.log(`   ├─ Processados: ${job.processedClientes}`);
    console.log(`   ├─ Progresso: ${((job.processedClientes / job.totalClientes) * 100).toFixed(1)}%`);
    console.log(`   ├─ Criado em: ${job.createdAt}`);
    if (job.startedAt) console.log(`   ├─ Iniciado em: ${job.startedAt}`);
    if (job.pausedAt) console.log(`   ├─ Pausado em: ${job.pausedAt}`);
    if (job.completedAt) console.log(`   └─ Concluído em: ${job.completedAt}`);
  });
}

// Quality scores
const [avgScores] = await connection.query(`
  SELECT 
    AVG(CAST(qualidadeScore AS DECIMAL(10,2))) as avgClientes
  FROM clientes 
  WHERE projectId = 1 AND qualidadeScore IS NOT NULL
`);

const [avgConcorrentes] = await connection.query(`
  SELECT AVG(CAST(qualidadeScore AS DECIMAL(10,2))) as avg
  FROM concorrentes 
  WHERE projectId = 1 AND qualidadeScore IS NOT NULL
`);

const [avgLeads] = await connection.query(`
  SELECT AVG(CAST(qualidadeScore AS DECIMAL(10,2))) as avg
  FROM leads 
  WHERE projectId = 1 AND qualidadeScore IS NOT NULL
`);

console.log('\n\n⭐ QUALIDADE DOS DADOS (Quality Score 0-100)');
console.log('════════════════════════════════════════════════════════════════');
console.log(`   Clientes: ${avgScores[0].avgClientes ? Number(avgScores[0].avgClientes).toFixed(1) : 'N/A'}`);
console.log(`   Concorrentes: ${avgConcorrentes[0].avg ? Number(avgConcorrentes[0].avg).toFixed(1) : 'N/A'}`);
console.log(`   Leads: ${avgLeads[0].avg ? Number(avgLeads[0].avg).toFixed(1) : 'N/A'}`);

// Top 10 mercados
const [topMercados] = await connection.query(`
  SELECT 
    m.nome,
    COUNT(DISTINCT cm.clienteId) as numClientes,
    COUNT(DISTINCT p.id) as numProdutos
  FROM mercados_unicos m
  LEFT JOIN clientes_mercados cm ON m.id = cm.mercadoId
  LEFT JOIN produtos p ON m.id = p.mercadoId
  WHERE m.projectId = 1
  GROUP BY m.id, m.nome
  ORDER BY numClientes DESC
  LIMIT 10
`);

console.log('\n\n🏆 TOP 10 MERCADOS POR NÚMERO DE CLIENTES');
console.log('════════════════════════════════════════════════════════════════');
topMercados.forEach((m, idx) => {
  console.log(`   ${idx + 1}. ${m.nome}`);
  console.log(`      ├─ Clientes: ${m.numClientes}`);
  console.log(`      └─ Produtos: ${m.numProdutos}`);
});

// Distribuição geográfica
const [geoDistrib] = await connection.query(`
  SELECT 
    uf,
    COUNT(*) as count
  FROM clientes
  WHERE projectId = 1 AND uf IS NOT NULL AND uf != ''
  GROUP BY uf
  ORDER BY count DESC
  LIMIT 10
`);

console.log('\n\n🗺️  DISTRIBUIÇÃO GEOGRÁFICA (TOP 10 ESTADOS)');
console.log('════════════════════════════════════════════════════════════════');
if (geoDistrib.length > 0) {
  geoDistrib.forEach((g, idx) => {
    console.log(`   ${idx + 1}. ${g.uf}: ${g.count} clientes`);
  });
} else {
  console.log('   Dados geográficos ainda não enriquecidos.');
}

// Validação de dados
const [validacao] = await connection.query(`
  SELECT 
    validationStatus,
    COUNT(*) as count
  FROM clientes
  WHERE projectId = 1
  GROUP BY validationStatus
`);

console.log('\n\n✅ STATUS DE VALIDAÇÃO DOS CLIENTES');
console.log('════════════════════════════════════════════════════════════════');
validacao.forEach(v => {
  const status = v.validationStatus || 'pendente';
  console.log(`   ${status}: ${v.count}`);
});

// Clientes com CNPJ
const [cnpjStats] = await connection.query(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN cnpj IS NOT NULL AND cnpj != '' THEN 1 ELSE 0 END) as comCNPJ
  FROM clientes
  WHERE projectId = 1
`);

console.log('\n\n📋 COMPLETUDE DOS DADOS');
console.log('════════════════════════════════════════════════════════════════');
console.log(`   Clientes com CNPJ: ${cnpjStats[0].comCNPJ} de ${cnpjStats[0].total} (${((cnpjStats[0].comCNPJ / cnpjStats[0].total) * 100).toFixed(1)}%)`);

console.log('\n\n════════════════════════════════════════════════════════════════');
console.log('Relatório gerado em:', new Date().toLocaleString('pt-BR'));
console.log('════════════════════════════════════════════════════════════════\n');

await connection.end();
