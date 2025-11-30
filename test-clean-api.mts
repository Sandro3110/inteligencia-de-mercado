/**
 * Teste da API cleanEnrichment via tRPC
 */

import { appRouter } from './server/routers/_app';

console.log('🧪 Testando cleanEnrichment via tRPC...\n');

try {
  const caller = appRouter.createCaller({});
  
  console.log('📝 Chamando cleanEnrichment com pesquisaId: 1');
  const result = await caller.pesquisas.cleanEnrichment({ pesquisaId: 1 });
  
  console.log('\n✅ Sucesso!');
  console.log('Stats:', result.stats);
  console.log('Message:', result.message);
} catch (error: any) {
  console.error('\n❌ Erro:', error.message);
  if (error.cause) {
    console.error('Causa:', error.cause);
  }
}
