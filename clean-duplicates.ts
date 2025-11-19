/**
 * Script para limpar clientes duplicados
 * Mantém o registro com maior qualidadeScore (desempate por ID mais recente)
 */

import { getDb } from './server/db';
import { clientes } from './drizzle/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

interface ClienteDuplicado {
  cnpj: string;
  ids: number[];
  scores: number[];
}

async function main() {
  console.log('🔍 Iniciando limpeza de duplicados...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Erro: Não foi possível conectar ao banco de dados');
    process.exit(1);
  }

  // 1. Buscar todos os clientes com CNPJ
  console.log('📊 Buscando clientes...');
  const todosClientes = await db
    .select()
    .from(clientes)
    .where(and(isNotNull(clientes.cnpj)));

  console.log(`✅ Encontrados ${todosClientes.length} clientes com CNPJ\n`);

  // 2. Agrupar por CNPJ e identificar duplicados
  console.log('🔎 Identificando duplicados...');
  const grupos = new Map<string, typeof todosClientes>();

  for (const cliente of todosClientes) {
    if (!cliente.cnpj) continue;
    
    const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
    if (!cnpjLimpo) continue;

    if (!grupos.has(cnpjLimpo)) {
      grupos.set(cnpjLimpo, []);
    }
    grupos.get(cnpjLimpo)!.push(cliente);
  }

  // 3. Filtrar apenas grupos com duplicados
  const duplicados: ClienteDuplicado[] = [];
  for (const [cnpj, grupo] of grupos.entries()) {
    if (grupo.length > 1) {
      duplicados.push({
        cnpj,
        ids: grupo.map(c => c.id),
        scores: grupo.map(c => c.qualidadeScore || 0),
      });
    }
  }

  console.log(`✅ Encontrados ${duplicados.length} CNPJs com duplicação`);
  console.log(`📊 Total de registros duplicados: ${duplicados.reduce((acc, d) => acc + d.ids.length - 1, 0)}\n`);

  if (duplicados.length === 0) {
    console.log('✅ Nenhum duplicado encontrado! Base de dados limpa.');
    process.exit(0);
  }

  // 4. Para cada grupo, identificar qual manter
  console.log('🎯 Processando duplicados...\n');
  let totalDeletados = 0;
  let erros = 0;

  for (let i = 0; i < duplicados.length; i++) {
    const dup = duplicados[i];
    const grupo = grupos.get(dup.cnpj)!;

    // Ordenar por qualidadeScore DESC, depois por ID DESC
    grupo.sort((a, b) => {
      const scoreA = a.qualidadeScore || 0;
      const scoreB = b.qualidadeScore || 0;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Maior score primeiro
      }
      return b.id - a.id; // Maior ID primeiro (mais recente)
    });

    const manter = grupo[0];
    const deletar = grupo.slice(1);

    console.log(`[${i + 1}/${duplicados.length}] CNPJ: ${dup.cnpj}`);
    console.log(`  ✅ Manter: ID ${manter.id} (Score: ${manter.qualidadeScore || 0})`);
    console.log(`  ❌ Deletar: ${deletar.length} registro(s)`);

    // Deletar registros duplicados
    for (const cliente of deletar) {
      try {
        await db.delete(clientes).where(eq(clientes.id, cliente.id));
        totalDeletados++;
        console.log(`     🗑️  Deletado ID ${cliente.id} (Score: ${cliente.qualidadeScore || 0})`);
      } catch (error) {
        erros++;
        console.error(`     ⚠️  Erro ao deletar ID ${cliente.id}:`, error);
      }
    }

    console.log('');
  }

  // 5. Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DA LIMPEZA');
  console.log('='.repeat(60));
  console.log(`✅ CNPJs com duplicação: ${duplicados.length}`);
  console.log(`🗑️  Registros deletados: ${totalDeletados}`);
  console.log(`⚠️  Erros: ${erros}`);
  console.log('='.repeat(60));

  // 6. Validação final
  console.log('\n🔍 Validando resultado...');
  const clientesFinais = await db
    .select()
    .from(clientes)
    .where(isNotNull(clientes.cnpj));

  const gruposFinais = new Map<string, number>();
  for (const cliente of clientesFinais) {
    if (!cliente.cnpj) continue;
    const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
    gruposFinais.set(cnpjLimpo, (gruposFinais.get(cnpjLimpo) || 0) + 1);
  }

  const duplicadosRestantes = Array.from(gruposFinais.values()).filter(count => count > 1).length;

  console.log(`\n📊 Total de clientes após limpeza: ${clientesFinais.length}`);
  console.log(`📊 CNPJs únicos: ${gruposFinais.size}`);
  console.log(`📊 Duplicados restantes: ${duplicadosRestantes}`);

  if (duplicadosRestantes === 0) {
    console.log('\n✅ SUCESSO! Base de dados limpa sem duplicados.');
  } else {
    console.log(`\n⚠️  ATENÇÃO! Ainda existem ${duplicadosRestantes} CNPJs com duplicação.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
