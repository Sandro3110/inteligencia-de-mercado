import { getDb } from './server/db.ts';
import { pesquisas, clientes } from './drizzle/schema.ts';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

async function criarPesquisaEImportarClientes() {
  console.log('================================================================================');
  console.log('🚀 CRIAR PESQUISA "BASE 2 TESTES" E IMPORTAR CLIENTES');
  console.log('================================================================================\n');

  try {
    const db = await getDb();

    // 1. Criar pesquisa
    console.log('📝 Criando pesquisa "Base 2 testes"...\n');

    const [novaPesquisa] = await db
      .insert(pesquisas)
      .values({
        nome: 'Base 2 testes',
        descricao:
          'Teste end-to-end com 50 clientes aleatórios para validação completa do sistema de enriquecimento',
        projectId: 1, // TechFilms
        status: 'active',
      })
      .returning();

    console.log(`✅ Pesquisa criada com sucesso!`);
    console.log(`   ID: ${novaPesquisa.id}`);
    console.log(`   Nome: ${novaPesquisa.nome}`);
    console.log(`   Projeto: TechFilms (ID 1)\n`);

    // 2. Ler CSV
    console.log('📂 Lendo arquivo CSV...\n');
    const csvPath = '/home/ubuntu/clientes_base2_testes.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter((l) => l.trim());

    console.log(`✅ ${lines.length - 1} clientes encontrados no CSV\n`);

    // 3. Parsear e inserir clientes
    console.log('💾 Importando clientes...\n');

    const header = lines[0].split(',');
    const clientesParaInserir = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Parse CSV (considerando aspas)
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue); // Último valor

      const nome = values[0] || '';
      const cnpj = values[1] || '';
      const cidade = values[2] || null;
      const uf = values[3] || null;
      const cnae = values[4] || null;

      if (!nome && !cnpj) continue;

      // Gerar hash único
      const hashInput = `${nome.toLowerCase()}_${cnpj}_${novaPesquisa.id}`;
      const clienteHash = createHash('sha256').update(hashInput).digest('hex');

      clientesParaInserir.push({
        clienteHash,
        nome,
        cnpj: cnpj || null,
        cidade,
        uf,
        cnae,
        projectId: 1,
        pesquisaId: novaPesquisa.id,
      });
    }

    console.log(`📊 Total de clientes para inserir: ${clientesParaInserir.length}\n`);

    // Inserir em batch
    if (clientesParaInserir.length > 0) {
      await db.insert(clientes).values(clientesParaInserir);
      console.log(`✅ ${clientesParaInserir.length} clientes importados com sucesso!\n`);
    }

    // 4. Estatísticas
    console.log('================================================================================');
    console.log('📊 RESUMO');
    console.log('================================================================================');
    console.log(`Pesquisa ID: ${novaPesquisa.id}`);
    console.log(`Nome: ${novaPesquisa.nome}`);
    console.log(`Clientes importados: ${clientesParaInserir.length}`);
    console.log(`Status: Pronto para enriquecimento`);
    console.log(
      '================================================================================\n'
    );

    console.log('✅ IMPORTAÇÃO CONCLUÍDA!');
    console.log('🎯 Próximo passo: Acessar interface web e iniciar enriquecimento\n');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

criarPesquisaEImportarClientes()
  .then(() => {
    console.log('✅ Finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
