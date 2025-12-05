import { enriquecerEntidade } from './server/lib/enriquecer-entidade';

async function testar() {
  console.log('🧪 Testando enriquecimento...\n');
  
  // Testar com entidade ID 1 (Magazine Luiza)
  const resultado = await enriquecerEntidade(1, 1);
  
  console.log('Resultado:');
  console.log(JSON.stringify(resultado, null, 2));
  
  if (resultado.sucesso) {
    console.log('\n✅ SUCESSO!');
    console.log(`Tokens usados: ${resultado.tokens}`);
    console.log(`Custo: $${resultado.custo?.toFixed(6)}`);
  } else {
    console.log('\n❌ ERRO:', resultado.erro);
  }
}

testar().catch(console.error);
