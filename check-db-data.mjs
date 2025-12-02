import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dimProjeto, dimPesquisa } from './drizzle/schema.ts';
import { count } from 'drizzle-orm';

// Conectar ao banco
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

async function checkData() {
  try {
    console.log('🔍 Consultando banco de dados...\n');

    // Contar projetos
    const projetos = await db.select({ count: count() }).from(dimProjeto);
    console.log(`📊 Projetos: ${projetos[0].count}`);

    // Contar pesquisas
    const pesquisas = await db.select({ count: count() }).from(dimPesquisa);
    console.log(`🔍 Pesquisas: ${pesquisas[0].count}`);

    // Listar alguns projetos
    if (projetos[0].count > 0) {
      console.log('\n📋 Primeiros 5 projetos:');
      const projetosList = await db.select().from(dimProjeto).limit(5);
      projetosList.forEach(p => {
        console.log(`  - ${p.nome} (${p.status})`);
      });
    }

    // Listar algumas pesquisas
    if (pesquisas[0].count > 0) {
      console.log('\n🔍 Primeiras 5 pesquisas:');
      const pesquisasList = await db.select().from(dimPesquisa).limit(5);
      pesquisasList.forEach(p => {
        console.log(`  - ${p.nome} (${p.status})`);
      });
    }

    if (projetos[0].count === 0 && pesquisas[0].count === 0) {
      console.log('\n⚠️  BANCO VAZIO - Não há dados ainda!');
      console.log('💡 Precisamos popular o banco com dados iniciais.');
    }

  } catch (error) {
    console.error('❌ Erro ao consultar banco:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
