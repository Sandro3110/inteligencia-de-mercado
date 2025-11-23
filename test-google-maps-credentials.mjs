import { google } from "googleapis";
import fs from "fs";

async function testGoogleMapsCredentials() {
  console.log("🔍 Testando credenciais do Google Maps API...\n");

  try {
    // 1. Ler credenciais
    const credentials = JSON.parse(
      fs.readFileSync(
        "/home/ubuntu/upload/metal-incline-451301-r0-32570682783d.json",
        "utf8"
      )
    );

    console.log("✅ Credenciais carregadas:");
    console.log(`   - Project ID: ${credentials.project_id}`);
    console.log(`   - Client Email: ${credentials.client_email}`);
    console.log("");

    // 2. Criar cliente de autenticação
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/geocoding",
      ],
    });

    const authClient = await auth.getClient();
    console.log("✅ Cliente de autenticação criado com sucesso\n");

    // 3. Testar Geocoding API
    console.log("📍 Testando Geocoding API...");

    const geocodingUrl = "https://maps.googleapis.com/maps/api/geocode/json";
    const testAddress = "Av. Paulista, 1578 - Bela Vista, São Paulo - SP";

    // Obter token de acesso
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Falha ao obter token de acesso");
    }

    // Fazer requisição de geocodificação
    const response = await fetch(
      `${geocodingUrl}?address=${encodeURIComponent(testAddress)}&key=${accessToken.token}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log("✅ Geocoding API funcionando!");
      console.log(`   - Endereço testado: ${testAddress}`);
      console.log(`   - Latitude: ${location.lat}`);
      console.log(`   - Longitude: ${location.lng}`);
      console.log(
        `   - Endereço formatado: ${data.results[0].formatted_address}`
      );
    } else {
      console.log(`⚠️  Status da API: ${data.status}`);
      console.log(
        `   - Mensagem: ${data.error_message || "Nenhum resultado encontrado"}`
      );
    }

    console.log("\n✅ VALIDAÇÃO COMPLETA - Credenciais OK para uso!");
    return true;
  } catch (error) {
    console.error("❌ ERRO ao validar credenciais:");
    console.error(`   - ${error.message}`);

    if (error.response) {
      console.error(`   - Status HTTP: ${error.response.status}`);
      console.error(
        `   - Dados: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }

    return false;
  }
}

// Executar teste
testGoogleMapsCredentials()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
