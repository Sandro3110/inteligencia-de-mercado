import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Converter undefined para null
const clean = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = value === undefined ? null : value;
  }
  return cleaned;
};

async function restoreData() {
  let connection;
  
  try {
    console.log('🔄 Iniciando restauração dos dados...\n');

    // Conectar ao MySQL
    connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Ler arquivos JSON
    const mercados = JSON.parse(readFileSync(join(__dirname, 'data_mercados_unicos.json'), 'utf-8'));
    const clientes = JSON.parse(readFileSync(join(__dirname, 'data_clientes.json'), 'utf-8'));
    const clientesMercados = JSON.parse(readFileSync(join(__dirname, 'data_clientes_mercados.json'), 'utf-8'));
    const concorrentes = JSON.parse(readFileSync(join(__dirname, 'data_concorrentes.json'), 'utf-8'));
    const leads = JSON.parse(readFileSync(join(__dirname, 'data_leads.json'), 'utf-8'));

    console.log(`📊 Dados encontrados:`);
    console.log(`  - ${mercados.length} mercados`);
    console.log(`  - ${clientes.length} clientes`);
    console.log(`  - ${clientesMercados.length} relações cliente-mercado`);
    console.log(`  - ${concorrentes.length} concorrentes`);
    console.log(`  - ${leads.length} leads\n`);

    // Importar mercados
    console.log('📥 Importando mercados...');
    let count = 0;
    for (const m of mercados) {
      const mercado = clean(m);
      await connection.execute(
        `INSERT INTO mercados_unicos (id, mercadoHash, nome, categoria, descricao, tamanhoMercado, potencialCrescimento, nivelConcorrencia, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [mercado.id, mercado.mercadoHash, mercado.nome, mercado.categoria, mercado.descricao, 
         mercado.tamanhoMercado, mercado.potencialCrescimento, mercado.nivelConcorrencia, 
         mercado.createdAt || new Date()]
      );
      count++;
      if (count % 10 === 0) process.stdout.write(`\r  ${count}/${mercados.length}`);
    }
    console.log(`\n✅ ${mercados.length} mercados importados\n`);

    // Importar clientes
    console.log('📥 Importando clientes...');
    count = 0;
    for (const c of clientes) {
      const cliente = clean(c);
      await connection.execute(
        `INSERT INTO clientes (id, clienteHash, nome, cnpj, siteOficial, produtoPrincipal, segmentacaoB2bB2c, 
         email, telefone, linkedin, instagram, cidade, uf, cnae, validationStatus, validationNotes, 
         validatedBy, validatedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [cliente.id, cliente.clienteHash, cliente.nome, cliente.cnpj, cliente.siteOficial, 
         cliente.produtoPrincipal, cliente.segmentacaoB2bB2c, cliente.email, cliente.telefone,
         cliente.linkedin, cliente.instagram, cliente.cidade, cliente.uf, cliente.cnae,
         cliente.validationStatus || 'pending', cliente.validationNotes, cliente.validatedBy,
         cliente.validatedAt, cliente.createdAt || new Date()]
      );
      count++;
      if (count % 50 === 0) process.stdout.write(`\r  ${count}/${clientes.length}`);
    }
    console.log(`\n✅ ${clientes.length} clientes importados\n`);

    // Importar relações
    console.log('📥 Importando relações cliente-mercado...');
    count = 0;
    for (const r of clientesMercados) {
      const rel = clean(r);
      await connection.execute(
        `INSERT INTO clientes_mercados (id, clienteId, mercadoId, createdAt)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE clienteId = VALUES(clienteId)`,
        [rel.id, rel.clienteId, rel.mercadoId, rel.createdAt || new Date()]
      );
      count++;
      if (count % 50 === 0) process.stdout.write(`\r  ${count}/${clientesMercados.length}`);
    }
    console.log(`\n✅ ${clientesMercados.length} relações importadas\n`);

    // Importar concorrentes
    console.log('📥 Importando concorrentes...');
    count = 0;
    for (const c of concorrentes) {
      const concorrente = clean(c);
      await connection.execute(
        `INSERT INTO concorrentes (id, concorrenteHash, mercadoId, nome, cnpj, site, produto, porte, 
         faturamentoEstimado, qualidadeScore, qualidadeClassificacao, validationStatus, validationNotes,
         validatedBy, validatedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [concorrente.id, concorrente.concorrenteHash, concorrente.mercadoId, concorrente.nome,
         concorrente.cnpj, concorrente.site, concorrente.produto, concorrente.porte,
         concorrente.faturamentoEstimado, concorrente.qualidadeScore, concorrente.qualidadeClassificacao,
         concorrente.validationStatus || 'pending', concorrente.validationNotes, concorrente.validatedBy,
         concorrente.validatedAt, concorrente.createdAt || new Date()]
      );
      count++;
      if (count % 50 === 0) process.stdout.write(`\r  ${count}/${concorrentes.length}`);
    }
    console.log(`\n✅ ${concorrentes.length} concorrentes importados\n`);

    // Importar leads
    console.log('📥 Importando leads...');
    count = 0;
    for (const l of leads) {
      const lead = clean(l);
      await connection.execute(
        `INSERT INTO leads (id, leadHash, mercadoId, nome, cnpj, site, produto, porte, faturamentoEstimado,
         qualidadeScore, qualidadeClassificacao, validationStatus, validationNotes, validatedBy, validatedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
        [lead.id, lead.leadHash, lead.mercadoId, lead.nome, lead.cnpj, lead.site, lead.produto,
         lead.porte, lead.faturamentoEstimado, lead.qualidadeScore, lead.qualidadeClassificacao,
         lead.validationStatus || 'pending', lead.validationNotes, lead.validatedBy, lead.validatedAt,
         lead.createdAt || new Date()]
      );
      count++;
      if (count % 50 === 0) process.stdout.write(`\r  ${count}/${leads.length}`);
    }
    console.log(`\n✅ ${leads.length} leads importados\n`);

    console.log('🎉 Restauração concluída com sucesso!');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

restoreData();
