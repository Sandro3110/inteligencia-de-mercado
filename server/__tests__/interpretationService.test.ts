import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { InterpretationService } from '../services/interpretationService';
import { sql } from 'drizzle-orm';

describe('InterpretationService - Correção Bug SQL', () => {
  let testProjectId: number;
  let testLeadId: number;
  const service = new InterpretationService();

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Criar projeto de teste
    const projectResult: any = await db.execute(sql`
      INSERT INTO projects (nome, descricao, cor)
      VALUES ('Projeto Teste Interpretation', 'Teste', '#FF0000')
    `);
    testProjectId = Number(projectResult[0].insertId);

    // Criar lead de teste com dados geográficos e qualidade
    const leadResult: any = await db.execute(sql`
      INSERT INTO leads (projectId, mercadoId, nome, uf, qualidadeScore, validationStatus)
      VALUES (${testProjectId}, 1, 'Lead Teste SP', 'SP', 85, 'rich')
    `);
    testLeadId = Number(leadResult[0].insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar dados de teste
    if (testLeadId) {
      await db.execute(sql`DELETE FROM leads WHERE id = ${testLeadId}`);
    }
    if (testProjectId) {
      await db.execute(sql`DELETE FROM projects WHERE id = ${testProjectId}`);
    }
  });

  it('deve estimar registros sem erro SQL (bug corrigido)', async () => {
    // Este teste valida que a correção do bug SQL funcionou
    // Antes: DrizzleQueryError: syntax error, unexpected '?'
    // Depois: Query executada com sucesso usando template strings sql

    const context = 'leads de alta qualidade em São Paulo';
    
    // Não deve lançar erro SQL
    await expect(
      service.interpret(context, String(testProjectId))
    ).resolves.toBeDefined();
  });

  it('deve interpretar contexto com filtros geográficos', async () => {
    const context = 'leads em São Paulo com qualidade acima de 80';
    
    const result = await service.interpret(context, String(testProjectId));
    
    expect(result).toBeDefined();
    expect(result.entities).toBeDefined();
    expect(result.entities.entityType).toBe('leads');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.estimatedRecords).toBeGreaterThanOrEqual(0);
  });

  it('deve interpretar contexto com filtros de qualidade', async () => {
    const context = 'clientes validados com alta qualidade';
    
    const result = await service.interpret(context, String(testProjectId));
    
    expect(result).toBeDefined();
    expect(result.entities.entityType).toBe('clientes');
    expect(result.entities.quality).toBeDefined();
  });

  it('deve retornar sugestões e warnings', async () => {
    const context = 'leads';
    
    const result = await service.interpret(context, String(testProjectId));
    
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('deve cachear resultados', async () => {
    const context = 'leads em SP';
    
    // Primeira chamada
    const result1 = await service.interpret(context, String(testProjectId));
    expect(result1.cached).toBe(false);
    
    // Segunda chamada (deve vir do cache)
    const result2 = await service.interpret(context, String(testProjectId));
    expect(result2.cached).toBe(true);
    
    // Resultados devem ser idênticos
    expect(result2.entities).toEqual(result1.entities);
    expect(result2.confidence).toBe(result1.confidence);
  });

  it('deve lidar com contextos complexos sem erro', async () => {
    const context = 'concorrentes de médio e grande porte no Sudeste com qualidade superior a 70 e validados nos últimos 30 dias';
    
    // Não deve lançar erro
    await expect(
      service.interpret(context, String(testProjectId))
    ).resolves.toBeDefined();
  });

  it('deve estimar corretamente registros com múltiplos filtros', async () => {
    const context = 'leads em SP com qualidade acima de 80';
    
    const result = await service.interpret(context, String(testProjectId));
    
    // Deve encontrar pelo menos o lead de teste criado
    expect(result.estimatedRecords).toBeGreaterThanOrEqual(1);
  });
});
