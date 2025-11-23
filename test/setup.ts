import { beforeAll, afterAll, vi } from "vitest";

// Configurar variáveis de ambiente para testes
beforeAll(() => {
  // OpenAI - usar chave real do sistema
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY não configurada. Alguns testes podem falhar.");
  }

  // Google Maps - mock (chave de teste)
  process.env.GOOGLE_MAPS_API_KEY = "AIzaSyTest_MockKey_ForTesting";

  // SerpAPI - mock (chave de teste)
  process.env.SERPAPI_KEY = "test_serpapi_key_mock";

  // ReceitaWS - mock (não precisa de chave, mas configurar URL)
  process.env.RECEITAWS_API_URL = "https://receitaws.com.br/v1";
});

// Limpar mocks após todos os testes
afterAll(() => {
  vi.clearAllMocks();
});

// Mock para Google Maps Geocoding API
vi.mock("../server/services/geocoding", () => ({
  geocodeAddress: vi.fn().mockResolvedValue({
    lat: -23.5505,
    lng: -46.6333,
    formatted_address: "São Paulo, SP, Brasil",
  }),
  reverseGeocode: vi.fn().mockResolvedValue({
    address: "São Paulo, SP, Brasil",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
  }),
}));

// Mock para SerpAPI
vi.mock("../server/serpapi", () => ({
  searchCompany: vi.fn().mockResolvedValue({
    organic_results: [
      {
        title: "Empresa Teste",
        link: "https://exemplo.com",
        snippet: "Descrição da empresa teste",
      },
    ],
  }),
}));

// Mock para ReceitaWS
vi.mock("../server/receitaws", () => ({
  consultarCNPJ: vi.fn().mockResolvedValue({
    status: "OK",
    nome: "EMPRESA TESTE LTDA",
    fantasia: "Empresa Teste",
    cnpj: "12.345.678/0001-90",
    abertura: "01/01/2020",
    situacao: "ATIVA",
    uf: "SP",
    municipio: "SAO PAULO",
    bairro: "CENTRO",
    logradouro: "RUA TESTE",
    numero: "123",
    cep: "01234-567",
    email: "contato@empresateste.com.br",
    telefone: "(11) 1234-5678",
    atividade_principal: [
      {
        code: "62.01-5-01",
        text: "Desenvolvimento de programas de computador sob encomenda",
      },
    ],
  }),
}));

console.log("✅ Test setup configured:");
console.log("  - OpenAI: Using real API key");
console.log("  - Google Maps: Mocked");
console.log("  - SerpAPI: Mocked");
console.log("  - ReceitaWS: Mocked");
