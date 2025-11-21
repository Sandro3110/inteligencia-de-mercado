import { getDb } from './server/db.ts';

async function seedTestData() {
  console.log('🌱 INICIANDO SEED DE DADOS DE TESTE\n');
  console.log('='.repeat(80));
  
  try {
    const db = await getDb();
    
    if (!db) {
      console.error('❌ Erro: Banco de dados não conectado');
      process.exit(1);
    }
    
    // 1. Criar projeto de teste
    console.log('\n📁 Criando projeto de teste...');
    const projectResult = await db.execute(`
      INSERT INTO projects (nome, descricao, status, createdAt, lastActivityAt)
      VALUES ('Projeto Teste PAV', 'Projeto de teste para validação completa do sistema', 'active', NOW(), NOW())
    `);
    
    const projectId = projectResult.insertId;
    console.log(`✅ Projeto criado com ID: ${projectId}`);
    
    // 2. Criar pesquisa de teste
    console.log('\n🔍 Criando pesquisa de teste...');
    const pesquisaResult = await db.execute(`
      INSERT INTO pesquisas (
        projectId, nome, descricao, status, 
        metodo, dataInicio, createdAt
      )
      VALUES (
        ${projectId}, 
        'Pesquisa Teste 2025', 
        'Pesquisa de teste para validação do sistema',
        'ativa',
        'manual',
        NOW(),
        NOW()
      )
    `);
    
    const pesquisaId = pesquisaResult.insertId;
    console.log(`✅ Pesquisa criada com ID: ${pesquisaId}`);
    
    // 3. Criar mercados de teste
    console.log('\n🎯 Criando mercados de teste...');
    const mercados = [
      {
        nome: 'Tecnologia da Informação',
        segmentacao: 'B2B',
        categoria: 'Software',
        tamanhoMercado: 'Grande',
        crescimentoAnual: '15%',
        tendencias: 'Cloud Computing, IA, Automação',
        principaisPlayers: 'Microsoft, Google, AWS'
      },
      {
        nome: 'Saúde e Bem-estar',
        segmentacao: 'B2C',
        categoria: 'Serviços',
        tamanhoMercado: 'Médio',
        crescimentoAnual: '8%',
        tendencias: 'Telemedicina, Apps de saúde',
        principaisPlayers: 'Hospital Albert Einstein, Fleury'
      },
      {
        nome: 'E-commerce',
        segmentacao: 'B2C',
        categoria: 'Varejo',
        tamanhoMercado: 'Grande',
        crescimentoAnual: '20%',
        tendencias: 'Mobile commerce, Social commerce',
        principaisPlayers: 'Mercado Livre, Amazon, Shopee'
      }
    ];
    
    const mercadoIds = [];
    for (const mercado of mercados) {
      const result = await db.execute(`
        INSERT INTO mercados_unicos (
          nome, segmentacao, categoria, tamanhoMercado,
          crescimentoAnual, tendencias, principaisPlayers,
          projectId, pesquisaId, quantidadeClientes, createdAt
        )
        VALUES (
          '${mercado.nome}',
          '${mercado.segmentacao}',
          '${mercado.categoria}',
          '${mercado.tamanhoMercado}',
          '${mercado.crescimentoAnual}',
          '${mercado.tendencias}',
          '${mercado.principaisPlayers}',
          ${projectId},
          ${pesquisaId},
          0,
          NOW()
        )
      `);
      mercadoIds.push(result.insertId);
      console.log(`✅ Mercado criado: ${mercado.nome} (ID: ${result.insertId})`);
    }
    
    // 4. Criar clientes de teste
    console.log('\n👥 Criando clientes de teste...');
    const clientes = [
      {
        nome: 'Tech Solutions Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'contato@techsolutions.com.br',
        telefone: '(11) 3456-7890',
        uf: 'SP',
        cidade: 'São Paulo',
        mercadoId: mercadoIds[0],
        qualityScore: 85,
        status: 'validado'
      },
      {
        nome: 'Clínica Vida Saudável',
        cnpj: '98.765.432/0001-10',
        email: 'contato@vidasaudavel.com.br',
        telefone: '(21) 2345-6789',
        uf: 'RJ',
        cidade: 'Rio de Janeiro',
        mercadoId: mercadoIds[1],
        qualityScore: 92,
        status: 'validado'
      },
      {
        nome: 'Loja Virtual Premium',
        cnpj: '11.222.333/0001-44',
        email: 'vendas@lojavirtual.com.br',
        telefone: '(11) 9876-5432',
        uf: 'SP',
        cidade: 'Campinas',
        mercadoId: mercadoIds[2],
        qualityScore: 78,
        status: 'pendente'
      }
    ];
    
    for (const cliente of clientes) {
      await db.execute(`
        INSERT INTO clientes (
          nome, cnpj, email, telefone, uf, cidade,
          mercadoId, pesquisaId, projectId,
          qualityScore, status, createdAt
        )
        VALUES (
          '${cliente.nome}',
          '${cliente.cnpj}',
          '${cliente.email}',
          '${cliente.telefone}',
          '${cliente.uf}',
          '${cliente.cidade}',
          ${cliente.mercadoId},
          ${pesquisaId},
          ${projectId},
          ${cliente.qualityScore},
          '${cliente.status}',
          NOW()
        )
      `);
      console.log(`✅ Cliente criado: ${cliente.nome}`);
    }
    
    // 5. Criar concorrentes de teste
    console.log('\n🏢 Criando concorrentes de teste...');
    const concorrentes = [
      {
        nome: 'Competitor Tech Inc',
        cnpj: '22.333.444/0001-55',
        website: 'www.competitortech.com',
        mercadoId: mercadoIds[0],
        qualityScore: 88,
        status: 'validado'
      },
      {
        nome: 'Saúde Total',
        cnpj: '33.444.555/0001-66',
        website: 'www.saudetotal.com.br',
        mercadoId: mercadoIds[1],
        qualityScore: 75,
        status: 'validado'
      }
    ];
    
    for (const concorrente of concorrentes) {
      await db.execute(`
        INSERT INTO concorrentes (
          nome, cnpj, website,
          mercadoId, pesquisaId, projectId,
          qualityScore, status, createdAt
        )
        VALUES (
          '${concorrente.nome}',
          '${concorrente.cnpj}',
          '${concorrente.website}',
          ${concorrente.mercadoId},
          ${pesquisaId},
          ${projectId},
          ${concorrente.qualityScore},
          '${concorrente.status}',
          NOW()
        )
      `);
      console.log(`✅ Concorrente criado: ${concorrente.nome}`);
    }
    
    // 6. Criar leads de teste
    console.log('\n🎯 Criando leads de teste...');
    const leads = [
      {
        nome: 'Lead Potencial A',
        email: 'leadA@empresa.com.br',
        telefone: '(11) 98765-4321',
        empresa: 'Empresa Potencial A',
        cargo: 'Diretor de TI',
        mercadoId: mercadoIds[0],
        qualityScore: 95,
        status: 'qualificado',
        stage: 'negociacao'
      },
      {
        nome: 'Lead Potencial B',
        email: 'leadB@empresa.com.br',
        telefone: '(21) 91234-5678',
        empresa: 'Empresa Potencial B',
        cargo: 'Gerente de Compras',
        mercadoId: mercadoIds[1],
        qualityScore: 82,
        status: 'qualificado',
        stage: 'prospeccao'
      },
      {
        nome: 'Lead Potencial C',
        email: 'leadC@empresa.com.br',
        telefone: '(11) 99999-8888',
        empresa: 'Empresa Potencial C',
        cargo: 'CEO',
        mercadoId: mercadoIds[2],
        qualityScore: 70,
        status: 'pendente',
        stage: 'descoberta'
      }
    ];
    
    for (const lead of leads) {
      await db.execute(`
        INSERT INTO leads (
          nome, email, telefone, empresa, cargo,
          mercadoId, pesquisaId, projectId,
          qualityScore, status, stage, createdAt
        )
        VALUES (
          '${lead.nome}',
          '${lead.email}',
          '${lead.telefone}',
          '${lead.empresa}',
          '${lead.cargo}',
          ${lead.mercadoId},
          ${pesquisaId},
          ${projectId},
          ${lead.qualityScore},
          '${lead.status}',
          '${lead.stage}',
          NOW()
        )
      `);
      console.log(`✅ Lead criado: ${lead.nome}`);
    }
    
    // 7. Criar produtos de teste
    console.log('\n📦 Criando produtos de teste...');
    const produtos = [
      {
        nome: 'Software de Gestão ERP',
        descricao: 'Sistema completo de gestão empresarial',
        categoria: 'Software',
        preco: 5000.00
      },
      {
        nome: 'Plataforma de Telemedicina',
        descricao: 'Solução completa para consultas online',
        categoria: 'SaaS',
        preco: 3500.00
      },
      {
        nome: 'Sistema de E-commerce',
        descricao: 'Plataforma completa para vendas online',
        categoria: 'Software',
        preco: 4200.00
      }
    ];
    
    for (const produto of produtos) {
      await db.execute(`
        INSERT INTO produtos (
          nome, descricao, categoria, preco,
          projectId, createdAt
        )
        VALUES (
          '${produto.nome}',
          '${produto.descricao}',
          '${produto.categoria}',
          ${produto.preco},
          ${projectId},
          NOW()
        )
      `);
      console.log(`✅ Produto criado: ${produto.nome}`);
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DO SEED');
    console.log('='.repeat(80));
    console.log(`✅ 1 Projeto criado`);
    console.log(`✅ 1 Pesquisa criada`);
    console.log(`✅ ${mercados.length} Mercados criados`);
    console.log(`✅ ${clientes.length} Clientes criados`);
    console.log(`✅ ${concorrentes.length} Concorrentes criados`);
    console.log(`✅ ${leads.length} Leads criados`);
    console.log(`✅ ${produtos.length} Produtos criados`);
    console.log('='.repeat(80));
    console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR SEED:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTestData();
