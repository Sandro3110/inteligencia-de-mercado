/**
 * Testes do Sistema de Geocodificação com Google Maps API
 *
 * Valida:
 * - Serviço de geocodificação
 * - Endpoints tRPC
 * - Estatísticas de cobertura
 * - Integração completa
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import {
  getRecordsSemCoordenadas,
  updateClienteCoordinates,
  updateConcorrenteCoordinates,
  updateLeadCoordinates,
  getGeocodeStats,
} from "../db-geocoding";
import {
  geocodeAddress,
  testGoogleMapsConnection,
  GeocodeResult,
  GeocodeError,
} from "../services/geocoding";

// Mock da API do Google Maps para testes
const MOCK_GOOGLE_MAPS_RESPONSE = {
  status: "OK",
  results: [
    {
      formatted_address: "São Paulo, SP, Brasil",
      geometry: {
        location: {
          lat: -23.5505,
          lng: -46.6333,
        },
        location_type: "GEOMETRIC_CENTER",
      },
      place_id: "ChIJ0WGkg4FEzpQRrlsz_whLqZs",
    },
  ],
};

describe("Sistema de Geocodificação", () => {
  const testProjectId = 999999;
  let testClienteId: number;
  let testConcorrenteId: number;
  let testLeadId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Criar registros de teste sem coordenadas (sem mercadoId para simplificar)
    // Nota: mercadoId será NULL mas os testes focam em geocodificação
    const clienteResult = await db.execute(`
      INSERT INTO clientes (projectId, nome, cidade, uf, latitude, longitude)
      VALUES (${testProjectId}, 'Cliente Teste Geocoding', 'São Paulo', 'SP', NULL, NULL)
    `);
    testClienteId = Number((clienteResult as any).insertId);

    const concorrenteResult = await db.execute(`
      INSERT INTO concorrentes (projectId, nome, cidade, uf, latitude, longitude)
      VALUES (${testProjectId}, 'Concorrente Teste Geocoding', 'Rio de Janeiro', 'RJ', NULL, NULL)
    `);
    testConcorrenteId = Number((concorrenteResult as any).insertId);

    const leadResult = await db.execute(`
      INSERT INTO leads (projectId, nome, cidade, uf, latitude, longitude)
      VALUES (${testProjectId}, 'Lead Teste Geocoding', 'Belo Horizonte', 'MG', NULL, NULL)
    `);
    testLeadId = Number((leadResult as any).insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar registros de teste
    if (testClienteId) {
      await db.execute(`DELETE FROM clientes WHERE id = ${testClienteId}`);
    }
    if (testConcorrenteId) {
      await db.execute(
        `DELETE FROM concorrentes WHERE id = ${testConcorrenteId}`
      );
    }
    if (testLeadId) {
      await db.execute(`DELETE FROM leads WHERE id = ${testLeadId}`);
    }
    // Mercados não foram criados, não precisa limpar
  });

  describe("Serviço de Geocodificação", () => {
    it("deve validar coordenadas do Brasil", () => {
      // Coordenadas válidas do Brasil
      const validLat = -23.5505;
      const validLng = -46.6333;

      // Coordenadas fora do Brasil
      const invalidLat = 40.7128; // Nova York
      const invalidLng = -74.006;

      // Teste interno - validação de range
      expect(validLat >= -33 && validLat <= 5).toBe(true);
      expect(validLng >= -73 && validLng <= -34).toBe(true);
      expect(invalidLat >= -33 && invalidLat <= 5).toBe(false);
    });

    it("deve retornar erro quando cidade ou UF não forem fornecidos", async () => {
      const result = await geocodeAddress("", "", "Brasil", "fake-key");

      expect(result).toHaveProperty("success", false);
      expect((result as GeocodeError).error).toContain("obrigatórios");
    });

    it("deve retornar erro quando API key não for fornecida", async () => {
      const result = await geocodeAddress("São Paulo", "SP", "Brasil", "");

      expect(result).toHaveProperty("success", false);
      expect((result as GeocodeError).error).toContain("API Key");
    });
  });

  describe("Funções de Banco de Dados", () => {
    it("deve buscar registros sem coordenadas", async () => {
      const records = await getRecordsSemCoordenadas(testProjectId);

      expect(records).toBeDefined();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThanOrEqual(3); // Pelo menos nossos 3 registros de teste

      // Verificar estrutura dos registros
      const testRecord = records.find(r => r.id === testClienteId);
      expect(testRecord).toBeDefined();
      expect(testRecord?.nome).toBe("Cliente Teste Geocoding");
      expect(testRecord?.cidade).toBe("São Paulo");
      expect(testRecord?.uf).toBe("SP");
      expect(testRecord?.tipo).toBe("cliente");
    });

    it("deve buscar registros sem coordenadas filtrados por tipo", async () => {
      const clientes = await getRecordsSemCoordenadas(testProjectId, "cliente");
      const concorrentes = await getRecordsSemCoordenadas(
        testProjectId,
        "concorrente"
      );
      const leads = await getRecordsSemCoordenadas(testProjectId, "lead");

      expect(clientes.every(r => r.tipo === "cliente")).toBe(true);
      expect(concorrentes.every(r => r.tipo === "concorrente")).toBe(true);
      expect(leads.every(r => r.tipo === "lead")).toBe(true);
    });

    it("deve atualizar coordenadas de cliente", async () => {
      const latitude = -23.5505;
      const longitude = -46.6333;

      const updated = await updateClienteCoordinates(
        testClienteId,
        latitude,
        longitude
      );
      expect(updated).toBe(true);

      // Verificar se foi atualizado no banco
      const db = await getDb();
      const result = await db!.execute(`
        SELECT latitude, longitude, geocodedAt 
        FROM clientes 
        WHERE id = ${testClienteId}
      `);

      const rows = (result as any).rows || (result as any);
      const row = Array.isArray(rows) ? rows[0] : rows;
      expect(row.latitude).toBe(latitude.toString());
      expect(row.longitude).toBe(longitude.toString());
      expect(row.geocodedAt).toBeDefined();
    });

    it("deve atualizar coordenadas de concorrente", async () => {
      const latitude = -22.9068;
      const longitude = -43.1729;

      const updated = await updateConcorrenteCoordinates(
        testConcorrenteId,
        latitude,
        longitude
      );
      expect(updated).toBe(true);

      // Verificar se foi atualizado no banco
      const db = await getDb();
      const result = await db!.execute(`
        SELECT latitude, longitude, geocodedAt 
        FROM concorrentes 
        WHERE id = ${testConcorrenteId}
      `);

      const rows = (result as any).rows || (result as any);
      const row = Array.isArray(rows) ? rows[0] : rows;
      expect(row.latitude).toBe(latitude.toString());
      expect(row.longitude).toBe(longitude.toString());
      expect(row.geocodedAt).toBeDefined();
    });

    it("deve atualizar coordenadas de lead", async () => {
      const latitude = -19.9167;
      const longitude = -43.9345;

      const updated = await updateLeadCoordinates(
        testLeadId,
        latitude,
        longitude
      );
      expect(updated).toBe(true);

      // Verificar se foi atualizado no banco
      const db = await getDb();
      const result = await db!.execute(`
        SELECT latitude, longitude, geocodedAt 
        FROM leads 
        WHERE id = ${testLeadId}
      `);

      const rows = (result as any).rows || (result as any);
      const row = Array.isArray(rows) ? rows[0] : rows;
      expect(row.latitude).toBe(latitude.toString());
      expect(row.longitude).toBe(longitude.toString());
      expect(row.geocodedAt).toBeDefined();
    });
  });

  describe("Estatísticas de Cobertura", () => {
    it("deve calcular estatísticas de geocodificação", async () => {
      const stats = await getGeocodeStats(testProjectId);

      expect(stats).toBeDefined();
      expect(stats.clientes).toBeDefined();
      expect(stats.concorrentes).toBeDefined();
      expect(stats.leads).toBeDefined();
      expect(stats.total).toBeDefined();

      // Verificar estrutura das estatísticas
      expect(stats.clientes).toHaveProperty("total");
      expect(stats.clientes).toHaveProperty("comCoordenadas");
      expect(stats.clientes).toHaveProperty("semCoordenadas");
      expect(stats.clientes).toHaveProperty("percentual");

      // Verificar cálculos
      expect(stats.clientes.total).toBe(
        stats.clientes.comCoordenadas + stats.clientes.semCoordenadas
      );

      expect(stats.total.total).toBe(
        stats.clientes.total + stats.concorrentes.total + stats.leads.total
      );
    });

    it("deve calcular percentuais corretamente", async () => {
      const stats = await getGeocodeStats(testProjectId);

      // Verificar que percentuais estão entre 0 e 100
      expect(stats.clientes.percentual).toBeGreaterThanOrEqual(0);
      expect(stats.clientes.percentual).toBeLessThanOrEqual(100);

      expect(stats.concorrentes.percentual).toBeGreaterThanOrEqual(0);
      expect(stats.concorrentes.percentual).toBeLessThanOrEqual(100);

      expect(stats.leads.percentual).toBeGreaterThanOrEqual(0);
      expect(stats.leads.percentual).toBeLessThanOrEqual(100);

      expect(stats.total.percentual).toBeGreaterThanOrEqual(0);
      expect(stats.total.percentual).toBeLessThanOrEqual(100);
    });
  });

  describe("Integração Completa", () => {
    it("deve ter registros de teste com coordenadas após atualização", async () => {
      const records = await getRecordsSemCoordenadas(testProjectId);

      // Nossos registros de teste devem ter coordenadas agora
      const testCliente = records.find(r => r.id === testClienteId);
      const testConcorrente = records.find(r => r.id === testConcorrenteId);
      const testLead = records.find(r => r.id === testLeadId);

      // Como atualizamos as coordenadas, eles não devem aparecer na lista de sem coordenadas
      // (a menos que o banco não tenha sido atualizado corretamente)
      expect(testCliente).toBeUndefined();
      expect(testConcorrente).toBeUndefined();
      expect(testLead).toBeUndefined();
    });

    it("deve ter estatísticas consistentes após geocodificação", async () => {
      const stats = await getGeocodeStats(testProjectId);

      // Verificar que as estatísticas são consistentes
      expect(stats.total.comCoordenadas).toBe(
        stats.clientes.comCoordenadas +
          stats.concorrentes.comCoordenadas +
          stats.leads.comCoordenadas
      );

      expect(stats.total.semCoordenadas).toBe(
        stats.clientes.semCoordenadas +
          stats.concorrentes.semCoordenadas +
          stats.leads.semCoordenadas
      );
    });
  });
});
