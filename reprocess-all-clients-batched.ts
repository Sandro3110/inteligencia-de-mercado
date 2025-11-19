/**
 * Script otimizado para reprocessar todos os 800 clientes em lotes
 * Evita timeout e permite monitoramento de progresso
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { clientes } from './drizzle/schema';
import { executeEnrichmentFlow } from './server/enrichmentFlow';

const db = drizzle(process.env.DATABASE_URL!);

const BATCH_SIZE = 100; // Processar 100 clientes por vez

interface ClienteInput {
  nome: string;
  cnpj?: string;
  site?: string;
  produto?: string;
}

async function reprocessInBatches() {
  console.log('🔄 REPROCESSAMENTO EM LOTES - 800 CLIENTES COM NOVOS FILTROS\n');
  console.log('═'.repeat(80));
  
  // 1. Buscar todos os clientes
  console.log('\n[1/3] Buscando clientes da base de dados...');
  const allClientes = await db.select().from(clientes);
  console.log(`✅ ${allClientes.length} clientes encontrados\n`);
  
  // 2. Preparar dados
  console.log('[2/3] Preparando dados...');
  const clientesInput: ClienteInput[] = allClientes.map(cliente => ({
    nome: cliente.nome,
    cnpj: cliente.cnpj || undefined,
    site: cliente.siteOficial || cliente.site || undefined,
    produto: cliente.produtoPrincipal || cliente.produto || undefined,
  }));
  
  // Remover duplicatas
  const clientesUnicos = new Map<string, ClienteInput>();
  clientesInput.forEach(cliente => {
    const key = cliente.cnpj || cliente.nome;
    if (!clientesUnicos.has(key)) {
      clientesUnicos.set(key, cliente);
    }
  });
  
  const todosClientes = Array.from(clientesUnicos.values());
  console.log(`✅ ${todosClientes.length} clientes únicos preparados\n`);
  
  // 3. Processar APENAS o primeiro lote para criar o projeto
  console.log(`[3/3] Processando primeiro lote (${BATCH_SIZE} clientes)...`);
  console.log('⚠️  Este é um teste com lote reduzido\n');
  
  const primeiroLote = todosClientes.slice(0, BATCH_SIZE);
  
  const startTime = Date.now();
  let finalResult: any = null;
  
  try {
    await executeEnrichmentFlow(
      {
        projectName: 'Embalagens 2',
        clientes: primeiroLote,
      },
      (progress) => {
        console.log(`[${progress.currentStep}/${progress.totalSteps}] ${progress.message}`);
        
        if (progress.status === 'completed' && progress.data) {
          finalResult = progress.data;
        }
      }
    );
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n═'.repeat(80));
    console.log('\n✅ PRIMEIRO LOTE PROCESSADO COM SUCESSO!\n');
    console.log(`⏱️  Tempo: ${duration}s\n`);
    
    if (finalResult) {
      console.log('📊 ESTATÍSTICAS DO PRIMEIRO LOTE:\n');
      console.log(`  Projeto ID: ${finalResult.projectId}`);
      console.log(`  Projeto Nome: ${finalResult.projectName}`);
      console.log(`  Clientes: ${finalResult.clientes?.length || 0}`);
      console.log(`  Mercados: ${finalResult.mercados?.length || 0}`);
      console.log(`  Concorrentes: ${finalResult.concorrentes?.length || 0}`);
      console.log(`  Leads: ${finalResult.leads?.length || 0}`);
      console.log(`  Score médio: ${finalResult.stats?.avgQualityScore?.toFixed(1) || 'N/A'}/100\n`);
      
      console.log('═'.repeat(80));
      console.log('\n✅ Projeto "Embalagens 2" criado com sucesso!\n');
      console.log(`📁 Projeto ID: ${finalResult.projectId}`);
      console.log(`📊 Acesse a aplicação e filtre por "Embalagens 2" para ver os resultados\n`);
      
      console.log('💡 PRÓXIMOS PASSOS:\n');
      console.log(`  - Total de clientes na base: ${todosClientes.length}`);
      console.log(`  - Processados neste lote: ${BATCH_SIZE}`);
      console.log(`  - Restantes: ${todosClientes.length - BATCH_SIZE}\n`);
      console.log('  Para processar todos, execute o script completo (pode levar 30-60 min)\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro durante o processamento:');
    console.error(error);
    process.exit(1);
  }
}

// Executar
reprocessInBatches().catch(console.error);
