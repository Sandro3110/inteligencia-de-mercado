import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { exportHistory, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

describe('Export History - Tabela e Funcionalidades', () => {
  let testUserId: string;
  let testExportId: string;

  beforeAll(async () => {
    testUserId = 'test-user-' + Date.now();
    testExportId = crypto.randomBytes(16).toString('hex');
    
    // Criar usuário de teste
    const db = await getDb();
    if (db) {
      await db.insert(users).values({
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    const db = await getDb();
    if (db) {
      await db.delete(exportHistory).where(eq(exportHistory.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('deve criar registro no histórico de exportação', async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    if (!db) return;

    const exportData = {
      id: testExportId,
      userId: testUserId,
      projectId: 1,
      pesquisaId: 1,
      context: 'Teste de Exportação',
      filters: { test: true },
      format: 'csv' as const,
      outputType: 'list' as const,
      recordCount: 100,
      fileUrl: 'https://example.com/export.csv',
      fileSize: 1024,
      generationTime: 5,
    };

    await db.insert(exportHistory).values(exportData);

    const [result] = await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.id, testExportId))
      .limit(1);

    expect(result).toBeDefined();
    expect(result.userId).toBe(testUserId);
    expect(result.context).toBe('Teste de Exportação');
    expect(result.format).toBe('csv');
    expect(result.recordCount).toBe(100);
  });

  it('deve listar histórico por usuário', async () => {
    const db = await getDb();
    if (!db) return;

    // Criar mais registros de teste
    const export2Id = crypto.randomBytes(16).toString('hex');
    await db.insert(exportHistory).values({
      id: export2Id,
      userId: testUserId,
      context: 'Segunda Exportação',
      filters: {},
      format: 'excel' as const,
      outputType: 'report' as const,
      recordCount: 50,
      fileSize: 2048,
      generationTime: 3,
    });

    const results = await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.userId, testUserId));

    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('deve deletar registro do histórico', async () => {
    const db = await getDb();
    if (!db) return;

    await db.delete(exportHistory).where(eq(exportHistory.id, testExportId));

    const [result] = await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.id, testExportId))
      .limit(1);

    expect(result).toBeUndefined();
  });

  it('deve aceitar diferentes formatos de exportação', async () => {
    const db = await getDb();
    if (!db) return;

    const formats = ['csv', 'excel', 'pdf'] as const;

    for (const format of formats) {
      const id = crypto.randomBytes(16).toString('hex');
      await db.insert(exportHistory).values({
        id,
        userId: testUserId,
        context: `Teste ${format}`,
        filters: {},
        format,
        outputType: 'list' as const,
        recordCount: 10,
        fileSize: 100,
        generationTime: 1,
      });

      const [result] = await db
        .select()
        .from(exportHistory)
        .where(eq(exportHistory.id, id))
        .limit(1);

      expect(result.format).toBe(format);
    }
  });

  it('deve aceitar diferentes tipos de saída', async () => {
    const db = await getDb();
    if (!db) return;

    const types = ['list', 'report'] as const;

    for (const outputType of types) {
      const id = crypto.randomBytes(16).toString('hex');
      await db.insert(exportHistory).values({
        id,
        userId: testUserId,
        context: `Teste ${outputType}`,
        filters: {},
        format: 'csv' as const,
        outputType,
        recordCount: 10,
        fileSize: 100,
        generationTime: 1,
      });

      const [result] = await db
        .select()
        .from(exportHistory)
        .where(eq(exportHistory.id, id))
        .limit(1);

      expect(result.outputType).toBe(outputType);
    }
  });

  it('deve armazenar metadados corretamente', async () => {
    const db = await getDb();
    if (!db) return;

    const id = crypto.randomBytes(16).toString('hex');
    const metadata = {
      id,
      userId: testUserId,
      context: 'Exportação com Metadados',
      filters: { uf: 'SP', porte: 'Grande' },
      format: 'excel' as const,
      outputType: 'report' as const,
      recordCount: 250,
      fileUrl: 'https://storage.example.com/exports/test.xlsx',
      fileSize: 5120,
      generationTime: 12,
    };

    await db.insert(exportHistory).values(metadata);

    const [result] = await db
      .select()
      .from(exportHistory)
      .where(eq(exportHistory.id, id))
      .limit(1);

    expect(result.recordCount).toBe(250);
    expect(result.fileSize).toBe(5120);
    expect(result.generationTime).toBe(12);
    expect(result.fileUrl).toContain('test.xlsx');
  });
});
