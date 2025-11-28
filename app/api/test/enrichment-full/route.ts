import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { enrichClienteOptimized } from '@/server/enrichmentOptimized';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

export async function POST() {
  const results: any[] = [];
  const startTime = Date.now();
  let sql: any = null;

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_URL não configurada',
        },
        { status: 500 }
      );
    }

    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    });

    // FASE 1: Criar Projeto
    const [project] = await sql`
      INSERT INTO projects (nome, descricao, status, "createdAt")
      VALUES ('Validação', 'Projeto de teste para validação do módulo de enriquecimento', 'ativo', NOW())
      RETURNING id, nome
    `;

    const projectId = project.id;
    results.push({
      phase: 'Criar Projeto',
      success: true,
      data: { projectId, nome: project.nome },
    });

    // FASE 2: Criar Pesquisa "One"
    const [pesquisaOne] = await sql`
      INSERT INTO pesquisas ("projectId", nome, descricao, status, "createdAt")
      VALUES (${projectId}, 'One', 'Pesquisa de teste com 1 cliente', 'ativa', NOW())
      RETURNING id, nome
    `;

    const pesquisaOneId = pesquisaOne.id;
    results.push({
      phase: 'Criar Pesquisa One',
      success: true,
      data: { pesquisaId: pesquisaOneId },
    });

    // FASE 3: Criar Pesquisa "Five"
    const [pesquisaFive] = await sql`
      INSERT INTO pesquisas ("projectId", nome, descricao, status, "createdAt")
      VALUES (${projectId}, 'Five', 'Pesquisa de teste com 5 clientes', 'ativa', NOW())
      RETURNING id, nome
    `;

    const pesquisaFiveId = pesquisaFive.id;
    results.push({
      phase: 'Criar Pesquisa Five',
      success: true,
      data: { pesquisaId: pesquisaFiveId },
    });

    // FASE 4: Criar 1 Cliente para Pesquisa "One"
    const [clienteOne] = await sql`
      INSERT INTO clientes ("projectId", "pesquisaId", nome, "produtoPrincipal", cidade, uf, "validationStatus", "createdAt")
      VALUES (${projectId}, ${pesquisaOneId}, 'Embalagens Flex Brasil Ltda', 'Embalagens plásticas flexíveis', 'São Paulo', 'SP', 'pending', NOW())
      RETURNING id, nome
    `;

    const clienteOneId = clienteOne.id;
    results.push({
      phase: 'Criar Cliente One',
      success: true,
      data: { clienteId: clienteOneId, nome: clienteOne.nome },
    });

    // FASE 5: Enriquecer Cliente One
    const enrichStart = Date.now();
    try {
      const enrichResult = await enrichClienteOptimized(clienteOneId, projectId);
      results.push({
        phase: 'Enriquecimento Cliente One',
        success: enrichResult.success,
        duration: Date.now() - enrichStart,
        data: {
          mercados: enrichResult.mercadosCreated,
          produtos: enrichResult.produtosCreated,
          concorrentes: enrichResult.concorrentesCreated,
          leads: enrichResult.leadsCreated,
          duration: enrichResult.duration,
        },
      });
    } catch (error: any) {
      results.push({
        phase: 'Enriquecimento Cliente One',
        success: false,
        duration: Date.now() - enrichStart,
        error: error.message,
      });
    }

    // FASE 6: Criar 5 Clientes para Pesquisa "Five"
    const clientesData = [
      {
        nome: 'Plásticos Industriais SP',
        produto: 'Embalagens industriais',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      {
        nome: 'Embalagens Eco Verde',
        produto: 'Embalagens biodegradáveis',
        cidade: 'Curitiba',
        uf: 'PR',
      },
      { nome: 'Flex Pack Nordeste', produto: 'Embalagens flexíveis', cidade: 'Recife', uf: 'PE' },
      {
        nome: 'Embalagens Premium RJ',
        produto: 'Embalagens de luxo',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
      },
      {
        nome: 'Pack Solutions MG',
        produto: 'Soluções em embalagens',
        cidade: 'Belo Horizonte',
        uf: 'MG',
      },
    ];

    const clientesFiveIds: number[] = [];

    for (const c of clientesData) {
      const [cliente] = await sql`
        INSERT INTO clientes ("projectId", "pesquisaId", nome, "produtoPrincipal", cidade, uf, "validationStatus", "createdAt")
        VALUES (${projectId}, ${pesquisaFiveId}, ${c.nome}, ${c.produto}, ${c.cidade}, ${c.uf}, 'pending', NOW())
        RETURNING id, nome
      `;
      clientesFiveIds.push(cliente.id);
    }

    results.push({
      phase: 'Criar 5 Clientes Five',
      success: true,
      data: { count: 5, ids: clientesFiveIds },
    });

    // FASE 7: Enriquecer 5 Clientes em Lote
    const batchStart = Date.now();
    const batchResults = [];

    for (const clienteId of clientesFiveIds) {
      try {
        const enrichResult = await enrichClienteOptimized(clienteId, projectId);
        batchResults.push({
          clienteId,
          success: enrichResult.success,
          mercados: enrichResult.mercadosCreated,
          produtos: enrichResult.produtosCreated,
          concorrentes: enrichResult.concorrentesCreated,
          leads: enrichResult.leadsCreated,
          duration: enrichResult.duration,
        });
      } catch (error: any) {
        batchResults.push({
          clienteId,
          success: false,
          error: error.message,
        });
      }
    }

    const batchDuration = Date.now() - batchStart;
    const successCount = batchResults.filter((r) => r.success).length;

    results.push({
      phase: 'Enriquecimento Lote 5',
      success: successCount === 5,
      duration: batchDuration,
      data: {
        successCount,
        failedCount: 5 - successCount,
        avgDuration: batchDuration / 5,
        results: batchResults,
      },
    });

    // Fechar conexão
    await sql.end();

    // Relatório Final
    const totalDuration = Date.now() - startTime;
    const totalTests = results.length;
    const successTests = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalTests,
        successTests,
        failedTests: totalTests - successTests,
        successRate: ((successTests / totalTests) * 100).toFixed(1) + '%',
        totalDuration: (totalDuration / 1000).toFixed(2) + 's',
        avgDuration: (totalDuration / totalTests / 1000).toFixed(2) + 's',
      },
      testData: {
        projectId,
        pesquisaOneId,
        pesquisaFiveId,
        clienteOneId,
        clientesFiveIds,
      },
      results,
    });
  } catch (error: any) {
    if (sql) await sql.end();

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        results,
      },
      { status: 500 }
    );
  }
}
