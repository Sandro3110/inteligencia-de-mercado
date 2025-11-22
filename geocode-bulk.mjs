#!/usr/bin/env node
/**
 * Script de Geocodificação em Massa
 * Fase 69.3 - Geocodificar registros antigos que não têm coordenadas
 * 
 * Uso:
 *   node geocode-bulk.mjs all              # Geocodificar todos os tipos
 *   node geocode-bulk.mjs clientes         # Apenas clientes
 *   node geocode-bulk.mjs concorrentes     # Apenas concorrentes
 *   node geocode-bulk.mjs leads            # Apenas leads
 *   node geocode-bulk.mjs --limit 100      # Limitar quantidade
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

// Configurar conexão com o banco
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Configuração de rate limiting (Google Maps API: 50 req/s)
const RATE_LIMIT_MS = 100; // 10 requisições por segundo (seguro)
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

// Helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para geocodificar endereço
async function geocodeAddress(endereco, cidade, uf) {
  if (!endereco && !cidade) {
    return null;
  }

  const fullAddress = [endereco, cidade, uf, 'Brasil']
    .filter(Boolean)
    .join(', ');

  try {
    // Buscar coordenadas usando Nominatim (OpenStreetMap)
    const params = new URLSearchParams({
      q: fullAddress,
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'GestorPAV/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error(`Erro ao geocodificar "${fullAddress}":`, error.message);
    return null;
  }
}

// Geocodificar com retry
async function geocodeWithRetry(endereco, cidade, uf, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await geocodeAddress(endereco, cidade, uf);
      if (result) {
        return result;
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await delay(RATE_LIMIT_MS * (i + 1)); // Backoff exponencial
    }
  }
  return null;
}

// Geocodificar clientes
async function geocodeClientes(limit = null) {
  console.log('\n📍 Geocodificando CLIENTES...\n');

  // Buscar clientes sem coordenadas
  const query = limit
    ? sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM clientes WHERE latitude IS NULL OR longitude IS NULL LIMIT ${limit}`
    : sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM clientes WHERE latitude IS NULL OR longitude IS NULL`;

  const result = await db.execute(query);
  const clientes = result[0];

  if (clientes.length === 0) {
    console.log('✅ Todos os clientes já estão geocodificados!');
    return { total: 0, success: 0, failed: 0 };
  }

  console.log(`📊 Total de clientes a processar: ${clientes.length}\n`);

  const progressBar = new cliProgress.SingleBar({
    format: 'Progresso |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(clientes.length, 0);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < clientes.length; i++) {
    const cliente = clientes[i];

    try {
      const coords = await geocodeWithRetry(
        cliente.endereco,
        cliente.cidade,
        cliente.uf
      );

      if (coords) {
        await db.execute(sql`
          UPDATE clientes 
          SET latitude = ${coords.latitude}, 
              longitude = ${coords.longitude},
              geocodedAt = CURRENT_TIMESTAMP
          WHERE id = ${cliente.id}
        `);
        success++;
      } else {
        failed++;
      }

      progressBar.update(i + 1);
      await delay(RATE_LIMIT_MS);
    } catch (error) {
      console.error(`\n❌ Erro ao processar cliente ${cliente.id}:`, error.message);
      failed++;
    }
  }

  progressBar.stop();

  console.log(`\n✅ Clientes geocodificados: ${success}`);
  console.log(`❌ Falhas: ${failed}\n`);

  return { total: clientes.length, success, failed };
}

// Geocodificar concorrentes
async function geocodeConcorrentes(limit = null) {
  console.log('\n📍 Geocodificando CONCORRENTES...\n');

  const query = limit
    ? sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM concorrentes WHERE latitude IS NULL OR longitude IS NULL LIMIT ${limit}`
    : sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM concorrentes WHERE latitude IS NULL OR longitude IS NULL`;

  const result = await db.execute(query);
  const concorrentes = result[0];

  if (concorrentes.length === 0) {
    console.log('✅ Todos os concorrentes já estão geocodificados!');
    return { total: 0, success: 0, failed: 0 };
  }

  console.log(`📊 Total de concorrentes a processar: ${concorrentes.length}\n`);

  const progressBar = new cliProgress.SingleBar({
    format: 'Progresso |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(concorrentes.length, 0);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < concorrentes.length; i++) {
    const concorrente = concorrentes[i];

    try {
      const coords = await geocodeWithRetry(
        concorrente.endereco,
        concorrente.cidade,
        concorrente.uf
      );

      if (coords) {
        await db.execute(sql`
          UPDATE concorrentes 
          SET latitude = ${coords.latitude}, 
              longitude = ${coords.longitude},
              geocodedAt = CURRENT_TIMESTAMP
          WHERE id = ${concorrente.id}
        `);
        success++;
      } else {
        failed++;
      }

      progressBar.update(i + 1);
      await delay(RATE_LIMIT_MS);
    } catch (error) {
      console.error(`\n❌ Erro ao processar concorrente ${concorrente.id}:`, error.message);
      failed++;
    }
  }

  progressBar.stop();

  console.log(`\n✅ Concorrentes geocodificados: ${success}`);
  console.log(`❌ Falhas: ${failed}\n`);

  return { total: concorrentes.length, success, failed };
}

// Geocodificar leads
async function geocodeLeads(limit = null) {
  console.log('\n📍 Geocodificando LEADS...\n');

  const query = limit
    ? sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM leads WHERE latitude IS NULL OR longitude IS NULL LIMIT ${limit}`
    : sql`SELECT id, nomeEmpresa, endereco, cidade, uf FROM leads WHERE latitude IS NULL OR longitude IS NULL`;

  const result = await db.execute(query);
  const leads = result[0];

  if (leads.length === 0) {
    console.log('✅ Todos os leads já estão geocodificados!');
    return { total: 0, success: 0, failed: 0 };
  }

  console.log(`📊 Total de leads a processar: ${leads.length}\n`);

  const progressBar = new cliProgress.SingleBar({
    format: 'Progresso |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(leads.length, 0);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];

    try {
      const coords = await geocodeWithRetry(
        lead.endereco,
        lead.cidade,
        lead.uf
      );

      if (coords) {
        await db.execute(sql`
          UPDATE leads 
          SET latitude = ${coords.latitude}, 
              longitude = ${coords.longitude},
              geocodedAt = CURRENT_TIMESTAMP
          WHERE id = ${lead.id}
        `);
        success++;
      } else {
        failed++;
      }

      progressBar.update(i + 1);
      await delay(RATE_LIMIT_MS);
    } catch (error) {
      console.error(`\n❌ Erro ao processar lead ${lead.id}:`, error.message);
      failed++;
    }
  }

  progressBar.stop();

  console.log(`\n✅ Leads geocodificados: ${success}`);
  console.log(`❌ Falhas: ${failed}\n`);

  return { total: leads.length, success, failed };
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;

  console.log('\n🗺️  GEOCODIFICAÇÃO EM MASSA - Gestor PAV\n');
  console.log('═'.repeat(60));

  const startTime = Date.now();
  const results = { clientes: null, concorrentes: null, leads: null };

  try {
    if (type === 'all' || type === 'clientes') {
      results.clientes = await geocodeClientes(limit);
    }

    if (type === 'all' || type === 'concorrentes') {
      results.concorrentes = await geocodeConcorrentes(limit);
    }

    if (type === 'all' || type === 'leads') {
      results.leads = await geocodeLeads(limit);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 RESUMO FINAL\n');

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    if (results.clientes) {
      console.log(`Clientes: ${results.clientes.success}/${results.clientes.total} ✅`);
      totalProcessed += results.clientes.total;
      totalSuccess += results.clientes.success;
      totalFailed += results.clientes.failed;
    }

    if (results.concorrentes) {
      console.log(`Concorrentes: ${results.concorrentes.success}/${results.concorrentes.total} ✅`);
      totalProcessed += results.concorrentes.total;
      totalSuccess += results.concorrentes.success;
      totalFailed += results.concorrentes.failed;
    }

    if (results.leads) {
      console.log(`Leads: ${results.leads.success}/${results.leads.total} ✅`);
      totalProcessed += results.leads.total;
      totalSuccess += results.leads.success;
      totalFailed += results.leads.failed;
    }

    console.log(`\nTotal: ${totalSuccess}/${totalProcessed} geocodificados`);
    console.log(`Falhas: ${totalFailed}`);
    console.log(`Tempo: ${duration}s`);
    console.log('\n✅ Processo concluído!\n');
  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
