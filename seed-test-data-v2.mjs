import { createProject, createPesquisa } from './server/db.ts';
import { getDb } from './server/db.ts';

async function seedTestData() {
  console.log('🌱 INICIANDO SEED DE DADOS DE TESTE (Versão 2)\n');
  console.log('='.repeat(80));
  
  try {
    const db = await getDb();
    
    if (!db) {
      console.error('❌ Erro: Banco de dados não conectado');
      process.exit(1);
    }
    
    // 1. Criar projeto de teste usando função do db.ts
    console.log('\n📁 Criando projeto de teste...');
    const project = await createProject({
      nome: 'Projeto Teste PAV',
      descricao: 'Projeto de teste para validação completa do sistema',
      cor: '#3b82f6'
    });
    
    console.log(`✅ Projeto criado com ID: ${project.id}`);
    
    // 2. Criar pesquisa de teste
    console.log('\n🔍 Criando pesquisa de teste...');
    const pesquisa = await createPesquisa({
      projectId: project.id,
      nome: 'Pesquisa Teste 2025',
      descricao: 'Pesquisa de teste para validação do sistema',
      status: 'ativa'
    });
    
    console.log(`✅ Pesquisa criada com ID: ${pesquisa.id}`);
    
    // 3. Verificar estrutura das tabelas antes de inserir
    console.log('\n🔍 Verificando estrutura das tabelas...');
    
    const mercadosColumns = await db.execute('DESCRIBE mercados_unicos');
    console.log('Colunas de mercados_unicos:', mercadosColumns.map(c => c.Field || c.field || c[0]).join(', '));
    
    const clientesColumns = await db.execute('DESCRIBE clientes');
    console.log('Colunas de clientes:', clientesColumns.map(c => c.Field || c.field || c[0]).join(', '));
    
    const concorrentesColumns = await db.execute('DESCRIBE concorrentes');
    console.log('Colunas de concorrentes:', concorrentesColumns.map(c => c.Field || c.field || c[0]).join(', '));
    
    const leadsColumns = await db.execute('DESCRIBE leads');
    console.log('Colunas de leads:', leadsColumns.map(c => c.Field || c.field || c[0]).join(', '));
    
    console.log('\n✅ Estruturas verificadas!');
    console.log('\n📊 RESUMO DO SEED');
    console.log('='.repeat(80));
    console.log(`✅ 1 Projeto criado (ID: ${project.id})`);
    console.log(`✅ 1 Pesquisa criada (ID: ${pesquisa.id})`);
    console.log('='.repeat(80));
    console.log('\n🎉 SEED PARCIAL CONCLUÍDO! Agora você pode criar mercados, clientes, etc via UI.\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR SEED:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTestData();
