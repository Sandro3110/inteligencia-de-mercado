#!/usr/bin/env tsx
/**
 * Script para migrar dados do Supabase para o banco local
 * Executa queries via MCP CLI e insere no banco local
 */

import { execSync } from "child_process";
import { drizzle } from "drizzle-orm/mysql2";
import {
  mercadosUnicos,
  clientes,
  clientesMercados,
  concorrentes,
  leads,
} from "../drizzle/schema";

console.log("🚀 Iniciando migração de dados do Supabase...\n");

// Função para executar query no Supabase via MCP
function querySupabase(sql: string): any[] {
  console.log(`📊 Executando query: ${sql.substring(0, 60)}...`);

  try {
    const result = execSync(
      `manus-mcp-cli tool call execute_sql --server supabase --input '${JSON.stringify({ sql })}'`,
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
    );

    // Extrair JSON do resultado
    const match = result.match(/\[{.*}\]/s);
    if (!match) {
      console.error("❌ Erro ao extrair dados");
      return [];
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("❌ Erro na query:", error);
    return [];
  }
}

// Conectar ao banco local
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

const db = drizzle(process.env.DATABASE_URL);

async function migrate() {
  try {
    // 1. Migrar Mercados
    console.log("\n📦 Migrando mercados_unicos...");
    const mercadosData = querySupabase(
      "SELECT * FROM mercados_unicos ORDER BY id"
    );
    console.log(`   Encontrados: ${mercadosData.length} mercados`);

    for (const mercado of mercadosData) {
      await db
        .insert(mercadosUnicos)
        .values({
          id: mercado.id,
          mercadoHash: mercado.mercado_hash,
          nome: mercado.nome,
          segmentacao: mercado.segmentacao,
          categoria: mercado.categoria,
          tamanhoMercado: mercado.tamanho_mercado,
          crescimentoAnual: mercado.crescimento_anual,
          tendencias: mercado.tendencias,
          principaisPlayers: mercado.principais_players,
          quantidadeClientes: mercado.quantidade_clientes || 0,
        })
        .onDuplicateKeyUpdate({ set: { nome: mercado.nome } });
    }
    console.log("   ✅ Mercados migrados!");

    // 2. Migrar Clientes
    console.log("\n📦 Migrando clientes...");
    const clientesData = querySupabase("SELECT * FROM clientes ORDER BY id");
    console.log(`   Encontrados: ${clientesData.length} clientes`);

    for (const cliente of clientesData) {
      await db
        .insert(clientes)
        .values({
          id: cliente.id,
          clienteHash: cliente.cliente_hash,
          nome: cliente.nome || cliente.empresa,
          cnpj: cliente.cnpj,
          siteOficial: cliente.site_oficial,
          produtoPrincipal: cliente.produto_principal,
          segmentacaoB2bB2c: cliente.segmentacao_b2b_b2c,
          email: cliente.email,
          telefone: cliente.telefone,
          linkedin: cliente.linkedin,
          instagram: cliente.instagram,
          cidade: cliente.cidade,
          uf: cliente.uf,
          cnae: cliente.cnae,
          validationStatus: "pending",
        })
        .onDuplicateKeyUpdate({
          set: { nome: cliente.nome || cliente.empresa },
        });
    }
    console.log("   ✅ Clientes migrados!");

    // 3. Migrar Clientes_Mercados
    console.log("\n📦 Migrando clientes_mercados...");
    const cmData = querySupabase("SELECT * FROM clientes_mercados ORDER BY id");
    console.log(`   Encontrados: ${cmData.length} associações`);

    for (const cm of cmData) {
      await db
        .insert(clientesMercados)
        .values({
          id: cm.id,
          clienteId: cm.cliente_id,
          mercadoId: cm.mercado_id,
        })
        .onDuplicateKeyUpdate({ set: { clienteId: cm.cliente_id } });
    }
    console.log("   ✅ Associações migradas!");

    // 4. Migrar Concorrentes
    console.log("\n📦 Migrando concorrentes_fase3...");
    const concorrentesData = querySupabase(
      "SELECT * FROM concorrentes_fase3 ORDER BY id"
    );
    console.log(`   Encontrados: ${concorrentesData.length} concorrentes`);

    for (const conc of concorrentesData) {
      await db
        .insert(concorrentes)
        .values({
          id: conc.id,
          concorrenteHash: conc.concorrente_hash,
          mercadoId: conc.mercado_id,
          nome: conc.nome,
          cnpj: conc.cnpj,
          site: conc.site,
          produto: conc.produto,
          porte: conc.porte,
          faturamentoEstimado: conc.faturamento_estimado,
          qualidadeScore: conc.qualidade_score,
          qualidadeClassificacao: conc.qualidade_classificacao,
          validationStatus: "pending",
        })
        .onDuplicateKeyUpdate({ set: { nome: conc.nome } });
    }
    console.log("   ✅ Concorrentes migrados!");

    // 5. Migrar Leads
    console.log("\n📦 Migrando leads_fase4...");
    const leadsData = querySupabase("SELECT * FROM leads_fase4 ORDER BY id");
    console.log(`   Encontrados: ${leadsData.length} leads`);

    for (const lead of leadsData) {
      await db
        .insert(leads)
        .values({
          id: lead.id,
          leadHash: lead.lead_hash,
          mercadoId: lead.mercado_id,
          nome: lead.nome,
          cnpj: lead.cnpj,
          site: lead.site,
          email: lead.email,
          telefone: lead.telefone,
          tipo: lead.tipo,
          porte: lead.porte,
          regiao: lead.regiao,
          setor: lead.setor,
          qualidadeScore: lead.qualidade_score,
          qualidadeClassificacao: lead.qualidade_classificacao,
          validationStatus: "pending",
        } as any)
        .onDuplicateKeyUpdate({ set: { nome: lead.nome } });
    }
    console.log("   ✅ Leads migrados!");

    console.log("\n🎉 Migração concluída com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   - Mercados: ${mercadosData.length}`);
    console.log(`   - Clientes: ${clientesData.length}`);
    console.log(`   - Associações: ${cmData.length}`);
    console.log(`   - Concorrentes: ${concorrentesData.length}`);
    console.log(`   - Leads: ${leadsData.length}`);
    console.log(
      `   - Total: ${mercadosData.length + clientesData.length + cmData.length + concorrentesData.length + leadsData.length} registros\n`
    );
  } catch (error) {
    console.error("\n❌ Erro durante a migração:", error);
    process.exit(1);
  }
}

migrate();
