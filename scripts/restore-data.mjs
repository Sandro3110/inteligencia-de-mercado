import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Converter undefined para null
const toNull = (value) => value === undefined ? null : value;

async function restoreData() {
  let connection;
  
  try {
    console.log('🔄 Iniciando restauração dos dados...\n');

    // Conectar diretamente ao MySQL
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
    for (const mercado of mercados) {
      await connection.execute(`
        INSERT INTO mercados_unicos (id, mercadoHash, nome, categoria, descricao, tamanhoMercado, potencialCrescimento, nivelConcorrencia, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          mercadoHash = VALUES(mercadoHash),
          nome = VALUES(nome),
          categoria = VALUES(categoria),
          descricao = VALUES(descricao),
          tamanhoMercado = VALUES(tamanhoMercado),
          potencialCrescimento = VALUES(potencialCrescimento),
          nivelConcorrencia = VALUES(nivelConcorrencia)
      ], [
        mercado.id,
        toNull(mercado.mercadoHash),
        mercado.nome,
        toNull(mercado.categoria),
        toNull(mercado.descricao),
        toNull(mercado.tamanhoMercado),
        toNull(mercado.potencialCrescimento),
        toNull(mercado.nivelConcorrencia),
        mercado.createdAt || new Date()
      ]);
    }
    console.log(`✅ ${mercados.length} mercados importados\n`);

    // Importar clientes
    console.log('📥 Importando clientes...');
    for (const cliente of clientes) {
      await connection.execute(`
        INSERT INTO clientes (id, clienteHash, nome, cnpj, siteOficial, produtoPrincipal, segmentacaoB2bB2c, email, telefone, linkedin, instagram, cidade, uf, cnae, validationStatus, validationNotes, validatedBy, validatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          clienteHash = VALUES(clienteHash),
          nome = VALUES(nome),
          cnpj = VALUES(cnpj),
          siteOficial = VALUES(siteOficial),
          produtoPrincipal = VALUES(produtoPrincipal),
          segmentacaoB2bB2c = VALUES(segmentacaoB2bB2c),
          email = VALUES(email),
          telefone = VALUES(telefone),
          linkedin = VALUES(linkedin),
          instagram = VALUES(instagram),
          cidade = VALUES(cidade),
          uf = VALUES(uf),
          cnae = VALUES(cnae),
          validationStatus = VALUES(validationStatus)
      `, [
        toNull(cliente.id),
        toNull(cliente.clienteHash),
        toNull(cliente.nome),
        toNull(cliente.cnpj),
        toNull(cliente.siteOficial),
        toNull(cliente.produtoPrincipal),
        toNull(cliente.segmentacaoB)2bB2c,
        toNull(cliente.email),
        toNull(cliente.telefone),
        toNull(cliente.linkedin),
        toNull(cliente.instagram),
        toNull(cliente.cidade),
        toNull(cliente.uf),
        toNull(cliente.cnae),
        toNull(cliente.validationStatus) || 'pending',
        toNull(cliente.validationNotes),
        toNull(cliente.validatedBy),
        toNull(cliente.validatedAt),
        toNull(cliente.createdAt) || new Date()
      ]);
    }
    console.log(`✅ ${clientes.length} clientes importados\n`);

    // Importar relações cliente-mercado
    console.log('📥 Importando relações cliente-mercado...');
    for (const rel of clientesMercados) {
      await connection.execute(`
        INSERT INTO clientes_mercados (id, clienteId, mercadoId, createdAt)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          clienteId = VALUES(clienteId),
          mercadoId = VALUES(mercadoId)
      `, [
        toNull(rel.id),
        toNull(rel.clienteId),
        toNull(rel.mercadoId),
        toNull(rel.createdAt) || new Date()
      ]);
    }
    console.log(`✅ ${clientesMercados.length} relações importadas\n`);

    // Importar concorrentes
    console.log('📥 Importando concorrentes...');
    for (const concorrente of concorrentes) {
      await connection.execute(`
        INSERT INTO concorrentes (id, concorrenteHash, mercadoId, nome, cnpj, site, produto, porte, faturamentoEstimado, qualidadeScore, qualidadeClassificacao, validationStatus, validationNotes, validatedBy, validatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          concorrenteHash = VALUES(concorrenteHash),
          mercadoId = VALUES(mercadoId),
          nome = VALUES(nome),
          cnpj = VALUES(cnpj),
          site = VALUES(site),
          produto = VALUES(produto),
          porte = VALUES(porte),
          faturamentoEstimado = VALUES(faturamentoEstimado),
          qualidadeScore = VALUES(qualidadeScore),
          qualidadeClassificacao = VALUES(qualidadeClassificacao),
          validationStatus = VALUES(validationStatus)
      `, [
        toNull(concorrente.id),
        toNull(concorrente.concorrenteHash),
        toNull(concorrente.mercadoId),
        toNull(concorrente.nome),
        toNull(concorrente.cnpj),
        toNull(concorrente.site),
        toNull(concorrente.produto),
        toNull(concorrente.porte),
        toNull(concorrente.faturamentoEstimado),
        toNull(concorrente.qualidadeScore),
        toNull(concorrente.qualidadeClassificacao),
        toNull(concorrente.validationStatus) || 'pending',
        toNull(concorrente.validationNotes),
        toNull(concorrente.validatedBy),
        toNull(concorrente.validatedAt),
        toNull(concorrente.createdAt) || new Date()
      ]);
    }
    console.log(`✅ ${concorrentes.length} concorrentes importados\n`);

    // Importar leads
    console.log('📥 Importando leads...');
    for (const lead of leads) {
      await connection.execute(`
        INSERT INTO leads (id, leadHash, mercadoId, nome, cnpj, site, produto, porte, faturamentoEstimado, qualidadeScore, qualidadeClassificacao, validationStatus, validationNotes, validatedBy, validatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          leadHash = VALUES(leadHash),
          mercadoId = VALUES(mercadoId),
          nome = VALUES(nome),
          cnpj = VALUES(cnpj),
          site = VALUES(site),
          produto = VALUES(produto),
          porte = VALUES(porte),
          faturamentoEstimado = VALUES(faturamentoEstimado),
          qualidadeScore = VALUES(qualidadeScore),
          qualidadeClassificacao = VALUES(qualidadeClassificacao),
          validationStatus = VALUES(validationStatus)
      `, [
        toNull(lead.id),
        toNull(lead.leadHash),
        toNull(lead.mercadoId),
        toNull(lead.nome),
        toNull(lead.cnpj),
        toNull(lead.site),
        toNull(lead.produto),
        toNull(lead.porte),
        toNull(lead.faturamentoEstimado),
        toNull(lead.qualidadeScore),
        toNull(lead.qualidadeClassificacao),
        toNull(lead.validationStatus) || 'pending',
        toNull(lead.validationNotes),
        toNull(lead.validatedBy),
        toNull(lead.validatedAt),
        toNull(lead.createdAt) || new Date()
      ]);
    }
    console.log(`✅ ${leads.length} leads importados\n`);

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
