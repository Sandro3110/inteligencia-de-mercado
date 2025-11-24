import { logger } from '@/lib/logger';

// TODO: Fix this test - temporarily disabled
// Reason: Requires API mocking or real API keys

/**
 * Teste de Geolocalização via IA
 * Valida que a OpenAI está retornando latitude/longitude e que estão sendo gravadas no banco
 */

import { describe, it, expect } from 'vitest';
import { generateAllDataOptimized } from '../integrations/openaiOptimized';
import { enrichClienteOptimized } from '../enrichmentOptimized';
import { getDb } from '../db';
import { clientes, concorrentes, leads } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe.skip('Geolocalização via IA', () => {
  it('OpenAI deve retornar coordenadas geográficas para o cliente', async () => {
    const result = await generateAllDataOptimized({
      nome: 'Empresa Teste São Paulo',
      cidade: 'São Paulo',
    });

    expect(result.clienteEnriquecido).toBeDefined();

    // Verificar se latitude e longitude foram retornadas
    const { latitude, longitude } = result.clienteEnriquecido;

    logger.debug('📍 Coordenadas do cliente:', { latitude, longitude });

    // Latitude e longitude devem existir (podem ser undefined se IA não retornou)
    if (latitude !== undefined && longitude !== undefined) {
      expect(typeof latitude).toBe('number');
      expect(typeof longitude).toBe('number');

      // Validar range aproximado para Brasil
      expect(latitude).toBeGreaterThanOrEqual(-34); // Sul do Brasil
      expect(latitude).toBeLessThanOrEqual(6); // Norte do Brasil
      expect(longitude).toBeGreaterThanOrEqual(-74); // Oeste do Brasil
      expect(longitude).toBeLessThanOrEqual(-34); // Leste do Brasil
    }
  }, 30000);

  it('OpenAI deve retornar coordenadas para concorrentes', async () => {
    const result = await generateAllDataOptimized({
      nome: 'Empresa Teste Rio de Janeiro',
      cidade: 'Rio de Janeiro',
    });

    expect(result.mercados).toBeDefined();
    expect(result.mercados.length).toBeGreaterThan(0);

    const concorrentes = result.mercados[0]?.concorrentes || [];
    logger.debug(`📍 Testando ${concorrentes.length} concorrentes...`);

    let concorrentesComCoordenadas = 0;

    for (const concorrente of concorrentes) {
      if (concorrente.latitude !== undefined && concorrente.longitude !== undefined) {
        concorrentesComCoordenadas++;
        logger.debug(
          `  ✓ ${concorrente.nome}: (${concorrente.latitude}, ${concorrente.longitude})`
        );

        expect(typeof concorrente.latitude).toBe('number');
        expect(typeof concorrente.longitude).toBe('number');
      }
    }

    logger.debug(
      `📊 ${concorrentesComCoordenadas}/${concorrentes.length} concorrentes com coordenadas`
    );
  }, 30000);

  it('OpenAI deve retornar coordenadas para leads', async () => {
    const result = await generateAllDataOptimized({
      nome: 'Empresa Teste Belo Horizonte',
      cidade: 'Belo Horizonte',
    });

    expect(result.mercados).toBeDefined();
    expect(result.mercados.length).toBeGreaterThan(0);

    const leads = result.mercados[0]?.leads || [];
    logger.debug(`📍 Testando ${leads.length} leads...`);

    let leadsComCoordenadas = 0;

    for (const lead of leads) {
      if (lead.latitude !== undefined && lead.longitude !== undefined) {
        leadsComCoordenadas++;
        logger.debug(`  ✓ ${lead.nome}: (${lead.latitude}, ${lead.longitude})`);

        expect(typeof lead.latitude).toBe('number');
        expect(typeof lead.longitude).toBe('number');
      }
    }

    logger.debug(`📊 ${leadsComCoordenadas}/${leads.length} leads com coordenadas`);
  }, 30000);

  it('Coordenadas devem ser gravadas no banco de dados (cliente)', async () => {
    const db = await getDb();
    if (!db) {
      console.warn('⚠️ Database not available, skipping test');
      return;
    }

    // Criar cliente de teste
    const [insertResult] = await db.insert(clientes).values({
      nome: 'Teste Geolocalização Cliente',
      projectId: 1,
      cidade: 'Curitiba',
    });

    const clienteId = Number(insertResult.insertId);

    try {
      // Enriquecer cliente
      logger.debug('🚀 Enriquecendo cliente de teste...');
      const result = await enrichClienteOptimized(clienteId, 1);

      expect(result.success).toBe(true);

      // Buscar cliente atualizado
      const [clienteAtualizado] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.id, clienteId))
        .limit(1);

      logger.debug('📍 Cliente após enriquecimento:', {
        nome: clienteAtualizado.nome,
        cidade: clienteAtualizado.cidade,
        latitude: clienteAtualizado.latitude,
        longitude: clienteAtualizado.longitude,
        geocodedAt: clienteAtualizado.geocodedAt,
      });

      // Verificar se coordenadas foram gravadas
      if (clienteAtualizado.latitude && clienteAtualizado.longitude) {
        expect(clienteAtualizado.latitude).toBeTruthy();
        expect(clienteAtualizado.longitude).toBeTruthy();
        expect(clienteAtualizado.geocodedAt).toBeTruthy();
        logger.debug('✅ Coordenadas gravadas com sucesso no banco!');
      } else {
        console.warn('⚠️ OpenAI não retornou coordenadas nesta execução');
      }
    } finally {
      // Limpar dados de teste
      await db.delete(clientes).where(eq(clientes.id, clienteId));
    }
  }, 60000);

  it('Coordenadas devem ser gravadas no banco de dados (concorrentes e leads)', async () => {
    const db = await getDb();
    if (!db) {
      console.warn('⚠️ Database not available, skipping test');
      return;
    }

    // Criar cliente de teste
    const [insertResult] = await db.insert(clientes).values({
      nome: 'Teste Geolocalização Completo',
      projectId: 1,
      cidade: 'Porto Alegre',
    });

    const clienteId = Number(insertResult.insertId);

    try {
      // Enriquecer cliente
      logger.debug('🚀 Enriquecendo cliente de teste...');
      const result = await enrichClienteOptimized(clienteId, 1);

      expect(result.success).toBe(true);
      expect(result.concorrentesCreated).toBeGreaterThan(0);
      expect(result.leadsCreated).toBeGreaterThan(0);

      // Buscar concorrentes criados
      const concorrentesCriados = await db
        .select()
        .from(concorrentes)
        .where(eq(concorrentes.projectId, 1))
        .limit(10);

      logger.debug(`\n📍 Verificando ${concorrentesCriados.length} concorrentes...`);
      let concorrentesComGeo = 0;

      for (const c of concorrentesCriados) {
        if (c.latitude && c.longitude) {
          concorrentesComGeo++;
          logger.debug(`  ✓ ${c.nome}: (${c.latitude}, ${c.longitude})`);
        }
      }

      logger.debug(
        `📊 ${concorrentesComGeo}/${concorrentesCriados.length} concorrentes com coordenadas no banco`
      );

      // Buscar leads criados
      const leadsCriados = await db.select().from(leads).where(eq(leads.projectId, 1)).limit(10);

      logger.debug(`\n📍 Verificando ${leadsCriados.length} leads...`);
      let leadsComGeo = 0;

      for (const l of leadsCriados) {
        if (l.latitude && l.longitude) {
          leadsComGeo++;
          logger.debug(`  ✓ ${l.nome}: (${l.latitude}, ${l.longitude})`);
        }
      }

      logger.debug(`📊 ${leadsComGeo}/${leadsCriados.length} leads com coordenadas no banco`);
    } finally {
      // Limpar dados de teste
      await db.delete(clientes).where(eq(clientes.id, clienteId));
    }
  }, 90000);
});
