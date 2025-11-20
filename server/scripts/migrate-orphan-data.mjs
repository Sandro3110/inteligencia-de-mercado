/**
 * Script de Migração de Dados Órfãos
 * 
 * Este script:
 * 1. Identifica todos os dados sem pesquisaId
 * 2. Cria pesquisas retroativas para cada projeto
 * 3. Associa os dados órfãos às pesquisas criadas
 * 4. Alinha nomenclatura (nome da pesquisa = nome do projeto)
 */

import mysql from 'mysql2/promise';

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🔍 Iniciando migração de dados órfãos...\n');

// Passo 1: Identificar projetos com dados órfãos
console.log('📊 Passo 1: Identificando projetos com dados órfãos...');

const [projectsWithOrphans] = await connection.query(
  'SELECT DISTINCT projectId FROM mercados_unicos WHERE pesquisaId IS NULL'
);

const [projectsWithOrphanClientes] = await connection.query(
  'SELECT DISTINCT projectId FROM clientes WHERE pesquisaId IS NULL'
);

const [projectsWithOrphanConcorrentes] = await connection.query(
  'SELECT DISTINCT projectId FROM concorrentes WHERE pesquisaId IS NULL'
);

// Unir todos os projectIds únicos
const allProjectIds = new Set([
  ...projectsWithOrphans.map(p => p.projectId),
  ...projectsWithOrphanClientes.map(p => p.projectId),
  ...projectsWithOrphanConcorrentes.map(p => p.projectId),
]);

console.log(`✅ Encontrados ${allProjectIds.size} projetos com dados órfãos\n`);

// Passo 2: Para cada projeto, criar pesquisa retroativa
console.log('🏗️  Passo 2: Criando pesquisas retroativas...');

const migrationResults = [];

for (const projectId of allProjectIds) {
  try {
    // Buscar informações do projeto
    const [projectRows] = await connection.query(
      'SELECT * FROM projects WHERE id = ? LIMIT 1',
      [projectId]
    );
    const project = projectRows[0];

    if (!project) {
      console.log(`⚠️  Projeto ${projectId} não encontrado, pulando...`);
      continue;
    }

    console.log(`\n📦 Processando projeto: ${project.nome} (ID: ${projectId})`);

    // Verificar se já existe uma pesquisa para este projeto
    const [existingPesquisas] = await connection.query(
      'SELECT * FROM pesquisas WHERE projectId = ?',
      [projectId]
    );

    let pesquisaId;

    if (existingPesquisas.length === 0) {
      // Criar nova pesquisa com o mesmo nome do projeto
      console.log(`   ➕ Criando nova pesquisa: "${project.nome}"`);
      
      const [result] = await connection.query(
        `INSERT INTO pesquisas (projectId, nome, descricao, totalClientes, status, ativo) 
         VALUES (?, ?, ?, 0, 'concluido', 1)`,
        [project.id, project.nome, 'Pesquisa criada automaticamente para migração de dados órfãos']
      );

      pesquisaId = Number(result.insertId);
      console.log(`   ✅ Pesquisa criada (ID: ${pesquisaId})`);
    } else {
      // Usar a primeira pesquisa existente
      pesquisaId = existingPesquisas[0].id;
      console.log(`   ℹ️  Usando pesquisa existente (ID: ${pesquisaId})`);
      
      // Alinhar nome da pesquisa com nome do projeto
      if (existingPesquisas[0].nome !== project.nome) {
        await connection.query(
          'UPDATE pesquisas SET nome = ? WHERE id = ?',
          [project.nome, pesquisaId]
        );
        console.log(`   ✏️  Nome da pesquisa atualizado para: "${project.nome}"`);
      }
    }

    // Passo 3: Migrar dados órfãos
    console.log(`   🔄 Migrando dados órfãos...`);

    // Migrar mercados
    const [mercadosResult] = await connection.query(
      'UPDATE mercados_unicos SET pesquisaId = ? WHERE projectId = ? AND pesquisaId IS NULL',
      [pesquisaId, projectId]
    );
    const mercadosMigrados = mercadosResult.affectedRows || 0;

    // Migrar clientes
    const [clientesResult] = await connection.query(
      'UPDATE clientes SET pesquisaId = ? WHERE projectId = ? AND pesquisaId IS NULL',
      [pesquisaId, projectId]
    );
    const clientesMigrados = clientesResult.affectedRows || 0;

    // Migrar concorrentes
    const [concorrentesResult] = await connection.query(
      'UPDATE concorrentes SET pesquisaId = ? WHERE projectId = ? AND pesquisaId IS NULL',
      [pesquisaId, projectId]
    );
    const concorrentesMigrados = concorrentesResult.affectedRows || 0;

    // Migrar leads
    const [leadsResult] = await connection.query(
      'UPDATE leads SET pesquisaId = ? WHERE projectId = ? AND pesquisaId IS NULL',
      [pesquisaId, projectId]
    );
    const leadsMigrados = leadsResult.affectedRows || 0;

    console.log(`   ✅ Migração concluída:`);
    console.log(`      - Mercados: ${mercadosMigrados}`);
    console.log(`      - Clientes: ${clientesMigrados}`);
    console.log(`      - Concorrentes: ${concorrentesMigrados}`);
    console.log(`      - Leads: ${leadsMigrados}`);

    migrationResults.push({
      projectId,
      projectName: project.nome,
      pesquisaId,
      migrated: {
        mercados: mercadosMigrados,
        clientes: clientesMigrados,
        concorrentes: concorrentesMigrados,
        leads: leadsMigrados,
      },
    });
  } catch (error) {
    console.error(`❌ Erro ao processar projeto ${projectId}:`, error);
  }
}

// Passo 4: Resumo final
console.log('\n\n📈 RESUMO DA MIGRAÇÃO:');
console.log('═'.repeat(60));

let totalMercados = 0;
let totalClientes = 0;
let totalConcorrentes = 0;
let totalLeads = 0;

for (const result of migrationResults) {
  console.log(`\n📦 ${result.projectName} (Projeto #${result.projectId})`);
  console.log(`   Pesquisa ID: ${result.pesquisaId}`);
  console.log(`   Dados migrados:`);
  console.log(`   - Mercados: ${result.migrated.mercados}`);
  console.log(`   - Clientes: ${result.migrated.clientes}`);
  console.log(`   - Concorrentes: ${result.migrated.concorrentes}`);
  console.log(`   - Leads: ${result.migrated.leads}`);

  totalMercados += result.migrated.mercados;
  totalClientes += result.migrated.clientes;
  totalConcorrentes += result.migrated.concorrentes;
  totalLeads += result.migrated.leads;
}

console.log('\n' + '═'.repeat(60));
console.log('📊 TOTAIS:');
console.log(`   - Mercados migrados: ${totalMercados}`);
console.log(`   - Clientes migrados: ${totalClientes}`);
console.log(`   - Concorrentes migrados: ${totalConcorrentes}`);
console.log(`   - Leads migrados: ${totalLeads}`);
console.log(`   - Total de registros: ${totalMercados + totalClientes + totalConcorrentes + totalLeads}`);
console.log('═'.repeat(60));

console.log('\n✅ Migração concluída com sucesso!\n');

await connection.end();
process.exit(0);
