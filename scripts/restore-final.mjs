import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function restoreData() {
  let connection;

  try {
    console.log("🔄 Iniciando restauração dos dados...\n");

    connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Ler arquivos JSON
    const mercados = JSON.parse(
      readFileSync(join(__dirname, "data_mercados_unicos.json"), "utf-8")
    );
    const clientes = JSON.parse(
      readFileSync(join(__dirname, "data_clientes.json"), "utf-8")
    );
    const clientesMercados = JSON.parse(
      readFileSync(join(__dirname, "data_clientes_mercados.json"), "utf-8")
    );
    const concorrentes = JSON.parse(
      readFileSync(join(__dirname, "data_concorrentes.json"), "utf-8")
    );
    const leads = JSON.parse(
      readFileSync(join(__dirname, "data_leads.json"), "utf-8")
    );

    console.log(`📊 Dados encontrados:`);
    console.log(`  - ${mercados.length} mercados`);
    console.log(`  - ${clientes.length} clientes`);
    console.log(`  - ${clientesMercados.length} relações cliente-mercado`);
    console.log(`  - ${concorrentes.length} concorrentes`);
    console.log(`  - ${leads.length} leads\n`);

    // Importar mercados
    console.log("📥 Importando mercados...");
    let count = 0;
    for (const m of mercados) {
      await connection.execute(
        `INSERT INTO mercados_unicos (id, mercadoHash, nome, segmentacao, categoria, tamanhoMercado, crescimentoAnual, tendencias, principaisPlayers, quantidadeClientes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [
          m.id,
          m.mercado_hash || null,
          m.nome,
          m.segmentacao || null,
          m.categoria || null,
          m.tamanho_mercado || null,
          m.crescimento_anual || null,
          m.tendencias || null,
          m.principais_players || null,
          m.quantidade_clientes || 0,
          m.created_at || new Date(),
        ]
      );
      count++;
      if (count % 10 === 0)
        process.stdout.write(`\r  ${count}/${mercados.length}`);
    }
    console.log(`\n✅ ${mercados.length} mercados importados\n`);

    // Importar clientes
    console.log("📥 Importando clientes...");
    count = 0;
    for (const c of clientes) {
      await connection.execute(
        `INSERT INTO clientes (id, clienteHash, nome, cnpj, siteOficial, produtoPrincipal, segmentacaoB2bB2c, 
         email, telefone, linkedin, instagram, cidade, uf, cnae, validationStatus, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [
          c.id,
          c.cliente_hash || null,
          c.nome,
          c.cnpj || null,
          c.site_oficial || null,
          c.produto_principal || null,
          c.segmentacao_b2b_b2c || null,
          c.email || null,
          c.telefone || null,
          c.linkedin || null,
          c.instagram || null,
          c.cidade || null,
          c.uf || null,
          c.cnae || null,
          c.validation_status || "pending",
          c.created_at || new Date(),
        ]
      );
      count++;
      if (count % 50 === 0)
        process.stdout.write(`\r  ${count}/${clientes.length}`);
    }
    console.log(`\n✅ ${clientes.length} clientes importados\n`);

    // Importar relações
    console.log("📥 Importando relações cliente-mercado...");
    count = 0;
    for (const r of clientesMercados) {
      await connection.execute(
        `INSERT INTO clientes_mercados (id, clienteId, mercadoId, createdAt)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE clienteId = VALUES(clienteId)`,
        [r.id, r.cliente_id, r.mercado_id, r.created_at || new Date()]
      );
      count++;
      if (count % 50 === 0)
        process.stdout.write(`\r  ${count}/${clientesMercados.length}`);
    }
    console.log(`\n✅ ${clientesMercados.length} relações importadas\n`);

    // Importar concorrentes
    console.log("📥 Importando concorrentes...");
    count = 0;
    for (const c of concorrentes) {
      await connection.execute(
        `INSERT INTO concorrentes (id, concorrenteHash, mercadoId, nome, cnpj, site, produto, porte, 
         faturamentoEstimado, qualidadeScore, qualidadeClassificacao, validationStatus, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [
          c.id,
          c.concorrente_hash || null,
          c.mercado_id,
          c.nome,
          c.cnpj || null,
          c.site || null,
          c.produto || null,
          c.porte || null,
          c.faturamento_estimado || null,
          c.qualidade_score || null,
          c.qualidade_classificacao || null,
          c.validation_status || "pending",
          c.created_at || new Date(),
        ]
      );
      count++;
      if (count % 50 === 0)
        process.stdout.write(`\r  ${count}/${concorrentes.length}`);
    }
    console.log(`\n✅ ${concorrentes.length} concorrentes importados\n`);

    // Importar leads
    console.log("📥 Importando leads...");
    count = 0;
    for (const l of leads) {
      await connection.execute(
        `INSERT INTO leads (id, leadHash, mercadoId, nome, cnpj, site, porte,
         qualidadeScore, qualidadeClassificacao, validationStatus, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [
          l.id,
          l.lead_hash || null,
          l.mercado_id,
          l.nome,
          l.cnpj || null,
          l.site || null,
          l.porte || null,
          l.qualidade_score || null,
          l.qualidade_classificacao || null,
          l.validation_status || "pending",
          l.created_at || new Date(),
        ]
      );
      count++;
      if (count % 50 === 0)
        process.stdout.write(`\r  ${count}/${leads.length}`);
    }
    console.log(`\n✅ ${leads.length} leads importados\n`);

    console.log("🎉 Restauração concluída com sucesso!");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro na restauração:", error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

restoreData();
