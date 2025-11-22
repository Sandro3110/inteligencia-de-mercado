/**
 * Teste simples da Google Maps Geocoding API
 * 
 * IMPORTANTE: Service Account não funciona diretamente com Geocoding API
 * É necessário usar uma API Key do tipo "API key" (não service account)
 * 
 * Passos para obter API Key:
 * 1. Acesse: https://console.cloud.google.com/apis/credentials
 * 2. Clique em "Create Credentials" > "API key"
 * 3. Copie a chave gerada
 * 4. Habilite a API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
 */

async function testGeocodingWithApiKey() {
  console.log('🔍 Testando Google Maps Geocoding API...\n');

  // IMPORTANTE: Você precisa criar uma API Key no Google Cloud Console
  // Este é apenas um teste de estrutura
  const API_KEY = 'SUA_API_KEY_AQUI'; // Substitua pela sua API Key
  
  if (API_KEY === 'SUA_API_KEY_AQUI') {
    console.log('⚠️  ATENÇÃO: API Key não configurada!\n');
    console.log('📋 Passos para obter sua API Key:\n');
    console.log('1. Acesse: https://console.cloud.google.com/apis/credentials?project=metal-incline-451301-r0');
    console.log('2. Clique em "Create Credentials" > "API key"');
    console.log('3. Copie a chave gerada');
    console.log('4. Habilite a Geocoding API em: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com?project=metal-incline-451301-r0');
    console.log('5. Cole a chave no arquivo .env como GOOGLE_MAPS_API_KEY\n');
    
    console.log('📝 Exemplo de uso:');
    console.log('   GOOGLE_MAPS_API_KEY=AIzaSy... (sua chave aqui)\n');
    
    return false;
  }

  try {
    const testAddress = 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${API_KEY}`;

    console.log(`📍 Testando endereço: ${testAddress}\n`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('✅ Geocoding API funcionando perfeitamente!\n');
      console.log('📊 Resultado:');
      console.log(`   - Latitude: ${location.lat}`);
      console.log(`   - Longitude: ${location.lng}`);
      console.log(`   - Endereço formatado: ${data.results[0].formatted_address}\n`);
      console.log('✅ Credenciais validadas com sucesso!');
      return true;
    } else {
      console.log(`❌ Erro na API: ${data.status}`);
      console.log(`   - Mensagem: ${data.error_message || 'Nenhum resultado'}\n`);
      
      if (data.status === 'REQUEST_DENIED') {
        console.log('💡 Dica: Verifique se a Geocoding API está habilitada no projeto');
        console.log('   Link: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com?project=metal-incline-451301-r0\n');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    return false;
  }
}

// Executar teste
testGeocodingWithApiKey()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
