import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import { getDb, saveEnrichmentConfig, getEnrichmentConfig, encryptApiKey, decryptApiKey } from '../db';

describe('Enrichment Config', () => {
  const testProjectId = 999999; // ID de teste que não existe

  beforeAll(async () => {
    // Garantir que o banco está conectado
    const db = await getDb();
    expect(db).toBeTruthy();
  });

  describe('Criptografia', () => {
    it('deve criptografar e descriptografar API key corretamente', () => {
      const originalKey = 'sk-test-1234567890abcdef';
      const encrypted = encryptApiKey(originalKey);
      const decrypted = decryptApiKey(encrypted);

      expect(encrypted).not.toBe(originalKey);
      expect(encrypted).toContain(':'); // IV:encrypted format
      expect(decrypted).toBe(originalKey);
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(encryptApiKey('')).toBe('');
      expect(decryptApiKey('')).toBe('');
    });
  });

  describe('Database Operations', () => {
    it('deve salvar e recuperar configuração', async () => {
      const config = {
        projectId: testProjectId,
        openaiApiKey: 'sk-test-openai-key',
        serpapiKey: 'test-serpapi-key',
        produtosPorMercado: 5,
        concorrentesPorMercado: 10,
        leadsPorMercado: 8,
        batchSize: 100,
        checkpointInterval: 200,
        enableDeduplication: 1,
        enableQualityScore: 1,
        enableAutoRetry: 1,
        maxRetries: 3,
      };

      // Salvar
      const saved = await saveEnrichmentConfig(config);
      expect(saved).toBeTruthy();
      expect(saved?.projectId).toBe(testProjectId);

      // Recuperar
      const retrieved = await getEnrichmentConfig(testProjectId);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.openaiApiKey).toBe('sk-test-openai-key'); // Descriptografado
      expect(retrieved?.produtosPorMercado).toBe(5);
      expect(retrieved?.batchSize).toBe(100);
    });

    it('deve atualizar configuração existente', async () => {
      // Primeira inserção
      await saveEnrichmentConfig({
        projectId: testProjectId,
        openaiApiKey: 'sk-old-key',
        produtosPorMercado: 3,
      });

      // Atualização
      await saveEnrichmentConfig({
        projectId: testProjectId,
        openaiApiKey: 'sk-new-key',
        produtosPorMercado: 7,
      });

      // Verificar atualização
      const config = await getEnrichmentConfig(testProjectId);
      expect(config?.openaiApiKey).toBe('sk-new-key');
      expect(config?.produtosPorMercado).toBe(7);
    });

    it('deve retornar null para projeto inexistente', async () => {
      const config = await getEnrichmentConfig(888888);
      expect(config).toBeNull();
    });
  });

  describe('tRPC Router', () => {
    it('deve ter endpoint get', () => {
      expect(appRouter.enrichmentConfig.get).toBeDefined();
    });

    it('deve ter endpoint save', () => {
      expect(appRouter.enrichmentConfig.save).toBeDefined();
    });

    it('deve ter endpoint testKeys', () => {
      expect(appRouter.enrichmentConfig.testKeys).toBeDefined();
    });
  });
});
