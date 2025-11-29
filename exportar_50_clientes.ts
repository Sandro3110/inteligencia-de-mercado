/**
 * Exportar 50 clientes aleatórios da Base Inicial para CSV
 */

import { getDb } from './server/db';
import { sql } from 'drizzle-orm';
import { writeFileSync } from 'fs';

async function exportarClientes() {
  const db = await getDb();

  if (!db) {
    console.error('❌ Erro: Não foi possível conectar ao banco!');
    return;
  }

  console.log('================================================================================');
  console.log('📤 EXPORTAR 50 CLIENTES ALEATÓRIOS - BASE INICIAL');
  console.log('================================================================================\n');

  try {
    // Selecionar 50 clientes aleatórios da pesquisa Base Inicial (ID 1)
    console.log('🔍 Selecionando 50 clientes aleatórios...\n');

    const clientes = await db.execute(sql`
      SELECT 
        nome,
        cnpj,
        cidade,
        uf,
        cnae
      FROM clientes
      WHERE "pesquisaId" = 1
      ORDER BY RANDOM()
      LIMIT 50
    `);

    console.log(`✅ ${clientes.length} clientes selecionados\n`);

    // Criar CSV
    console.log('📝 Criando arquivo CSV...\n');

    // Header
    const header = 'nome,cnpj,cidade,uf,cnae';

    // Linhas
    const linhas = clientes.map((c: any) => {
      const nome = (c.nome || '').replace(/"/g, '""'); // Escapar aspas
      const cnpj = c.cnpj || '';
      const cidade = (c.cidade || '').replace(/"/g, '""');
      const uf = c.uf || '';
      const cnae = c.cnae || '';

      return `"${nome}","${cnpj}","${cidade}","${uf}","${cnae}"`;
    });

    const csv = [header, ...linhas].join('\n');

    // Salvar arquivo
    const outputPath = '/home/ubuntu/clientes_base2_testes.csv';
    writeFileSync(outputPath, csv, 'utf-8');

    console.log(`✅ Arquivo CSV criado: ${outputPath}\n`);

    // Estatísticas
    console.log('================================================================================');
    console.log('📊 ESTATÍSTICAS');
    console.log(
      '================================================================================\n'
    );

    const comCNPJ = clientes.filter((c: any) => c.cnpj).length;
    const comCidade = clientes.filter((c: any) => c.cidade).length;
    const comUF = clientes.filter((c: any) => c.uf).length;
    const comCNAE_campo = clientes.filter((c: any) => c.cnae).length;

    console.log(`Total de clientes: ${clientes.length}`);
    console.log(`Com CNPJ: ${comCNPJ} (${Math.round((comCNPJ / clientes.length) * 100)}%)`);
    console.log(`Com Cidade: ${comCidade} (${Math.round((comCidade / clientes.length) * 100)}%)`);
    console.log(`Com UF: ${comUF} (${Math.round((comUF / clientes.length) * 100)}%)`);
    console.log(
      `Com CNAE: ${comCNAE_campo} (${Math.round((comCNAE_campo / clientes.length) * 100)}%)`
    );

    console.log('================================================================================');
    console.log('✅ EXPORTAÇÃO CONCLUÍDA!');
    console.log(
      '================================================================================\n'
    );

    console.log(`📁 Arquivo pronto para upload: ${outputPath}\n`);
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

exportarClientes()
  .then(() => {
    console.log('✅ Finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
