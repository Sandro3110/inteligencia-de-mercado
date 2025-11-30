import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  pesquisas as pesquisasTable,
  clientes,
  leads,
  concorrentes,
  mercadosUnicos,
  systemSettings,
} from '@/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import PDFDocument from 'pdfkit';

/**
 * Reports Router - Geração de relatórios analíticos
 */
export const reportsRouter = createTRPCRouter({
  /**
   * Gerar relatório PDF analítico de um projeto com IA
   */
  generateProjectReport: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // 1. Buscar API key do OpenAI
      const [openaiSetting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, 'OPENAI_API_KEY'));

      if (!openaiSetting?.settingValue) {
        throw new Error('OpenAI API key não configurada');
      }

      const apiKey = openaiSetting.settingValue;

      // 2. Buscar todas as pesquisas do projeto
      const pesquisas = await db
        .select()
        .from(pesquisasTable)
        .where(eq(pesquisasTable.projectId, input.projectId));

      if (pesquisas.length === 0) {
        throw new Error('Projeto não possui pesquisas');
      }

      const pesquisaIds = pesquisas.map((p) => p.id);

      // 3. Buscar todos os dados
      const [clientesData, leadsData, concorrentesData, mercadosData] = await Promise.all([
        db.select().from(clientes).where(inArray(clientes.pesquisaId, pesquisaIds)),
        db.select().from(leads).where(inArray(leads.pesquisaId, pesquisaIds)),
        db.select().from(concorrentes).where(inArray(concorrentes.pesquisaId, pesquisaIds)),
        db.select().from(mercadosUnicos).where(inArray(mercadosUnicos.pesquisaId, pesquisaIds)),
      ]);

      // 4. Preparar dados para análise da IA
      const totalEntidades =
        clientesData.length + leadsData.length + concorrentesData.length + mercadosData.length;

      // Top 10 mercados por tamanho estimado
      const top10Mercados = mercadosData
        .sort((a, b) => {
          const sizeA = parseFloat(a.tamanhoEstimado || '0');
          const sizeB = parseFloat(b.tamanhoEstimado || '0');
          return sizeB - sizeA;
        })
        .slice(0, 10);

      // Top 20 clientes (por ordem alfabética por enquanto)
      const top20Clientes = clientesData.slice(0, 20);

      // Produtos principais (extrair de clientes)
      const produtos = clientesData
        .map((c) => c.produtoPrincipal)
        .filter((p) => p && p.trim() !== '')
        .reduce((acc: { [key: string]: number }, produto) => {
          if (produto) {
            acc[produto] = (acc[produto] || 0) + 1;
          }
          return acc;
        }, {});

      const produtosPrincipais = Object.entries(produtos)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([nome, count]) => ({ nome, count }));

      // Distribuição geográfica de clientes
      const clientesPorEstado = clientesData
        .filter((c) => c.uf)
        .reduce((acc: { [key: string]: number }, cliente) => {
          const uf = cliente.uf || 'Não especificado';
          acc[uf] = (acc[uf] || 0) + 1;
          return acc;
        }, {});

      const top10Estados = Object.entries(clientesPorEstado)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([uf, count]) => ({
          uf,
          count,
          percentual: ((count / clientesData.length) * 100).toFixed(1),
        }));

      const clientesPorCidade = clientesData
        .filter((c) => c.cidade && c.uf)
        .reduce((acc: { [key: string]: { count: number; uf: string } }, cliente) => {
          const key = `${cliente.cidade}/${cliente.uf}`;
          if (!acc[key]) {
            acc[key] = { count: 0, uf: cliente.uf || '' };
          }
          acc[key].count++;
          return acc;
        }, {});

      const top10Cidades = Object.entries(clientesPorCidade)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([cidade, data]) => ({ cidade, count: data.count }));

      // 5. Gerar análise dissertativa com IA
      const prompt = `Você é um analista de inteligência de mercado. Analise os seguintes dados de pesquisa e gere um relatório executivo profissional em português brasileiro.

**Dados da Pesquisa:**
- Total de pesquisas: ${pesquisas.length}
- Total de entidades levantadas: ${totalEntidades}
  - Clientes: ${clientesData.length}
  - Leads: ${leadsData.length}
  - Concorrentes: ${concorrentesData.length}
  - Mercados: ${mercadosData.length}

**Top 10 Mercados:**
${top10Mercados.map((m, i) => `${i + 1}. ${m.nome} - ${m.tamanhoEstimado || 'N/A'} - ${m.potencial || 'N/A'}`).join('\n')}

**Produtos Principais:**
${produtosPrincipais.map((p, i) => `${i + 1}. ${p.nome} (${p.count} menções)`).join('\n')}

**Distribuição Geográfica de Clientes:**
- Total de clientes: ${clientesData.length}
- Estados com maior presença:
${top10Estados.map((e, i) => `  ${i + 1}. ${e.uf}: ${e.count} clientes (${e.percentual}%)`).join('\n')}

- Principais cidades:
${top10Cidades.map((c, i) => `  ${i + 1}. ${c.cidade}: ${c.count} clientes`).join('\n')}

**Gere uma análise dissertativa profissional com:**
1. **Resumo Executivo** (2-3 parágrafos): Visão geral da pesquisa, abrangência e principais descobertas
2. **Análise de Mercados** (3-4 parágrafos): Análise dos 10 principais mercados identificados, potencial e oportunidades
3. **Perfil de Clientes e Distribuição Geográfica** (3-4 parágrafos): Perfil dos clientes, análise da distribuição geográfica (estados e cidades), concentração vs. dispersão, oportunidades de expansão regional
4. **Análise de Produtos e Serviços** (2-3 parágrafos): Portfólio de produtos identificados, categorização, produtos mais demandados, oportunidades de cross-selling
5. **Análise de Leads e Oportunidades** (2 parágrafos): Perfil dos leads qualificados, potencial de conversão, estratégias de abordagem
6. **Panorama Competitivo** (2-3 parágrafos): Análise dos concorrentes identificados, nível de competitividade, estratégias de diferenciação
7. **Análise SWOT do Mercado** (2-3 parágrafos): Forças (Strengths), Fraquezas (Weaknesses), Oportunidades (Opportunities) e Ameaças (Threats) identificadas
8. **Conclusões e Recomendações Estratégicas** (3-4 parágrafos): Insights estratégicos principais, recomendações de curto, médio e longo prazo, próximos passos sugeridos

Use linguagem profissional, objetiva e baseada em dados. Seja específico e cite números quando relevante.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é um analista de inteligência de mercado especializado em gerar relatórios executivos profissionais.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const analiseIA = aiResponse.choices[0]?.message?.content || 'Análise não disponível';

      // 6. Gerar PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // Cabeçalho com fundo azul
      doc.rect(0, 0, doc.page.width, 120).fillAndStroke('#2563eb', '#2563eb');

      // Título
      doc
        .fillColor('#ffffff')
        .fontSize(26)

        .text('RELATÓRIO DE INTELIGÊNCIA DE MERCADO', 50, 30, {
          align: 'center',
        });

      doc
        .fontSize(14)

        .fillColor('#e0e7ff')
        .text('Análise Consolidada de Mercado', 50, 65, { align: 'center' });

      doc
        .fontSize(11)
        .fillColor('#ffffff')
        .text(
          `Projeto ID: ${input.projectId} | Data: ${new Date().toLocaleDateString('pt-BR')}`,
          50,
          90,
          { align: 'center' }
        );

      // Resetar cor para preto
      doc.fillColor('#000000');

      doc.moveDown(3);

      // Estatísticas com caixa
      doc.rect(50, doc.y, doc.page.width - 100, 120).fillAndStroke('#f0f9ff', '#2563eb');
      doc
        .fillColor('#000000')
        .fontSize(16)

        .text('📊 ESTATÍSTICAS GERAIS', 70, doc.y + 15);
      const statsY = doc.y + 45;
      doc.fontSize(11);
      doc.text(`• Total de Pesquisas: ${pesquisas.length}`, 70, statsY);
      doc.text(`• Total de Entidades: ${totalEntidades}`, 70, statsY + 20);
      doc.text(`  - Clientes: ${clientesData.length}`, 90, statsY + 40);
      doc.text(`  - Leads: ${leadsData.length}`, 90, statsY + 55);
      doc.text(`  - Concorrentes: ${concorrentesData.length}`, 90, statsY + 70);
      doc.text(`  - Mercados: ${mercadosData.length}`, 90, statsY + 85);
      doc.y = statsY + 110;

      doc.moveDown(2);

      // Análise da IA com separador
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#2563eb')
        .lineWidth(2)
        .stroke();
      doc.moveDown(1);
      doc.fontSize(18).fillColor('#2563eb').text('📋 ANÁLISE DETALHADA');
      doc.fillColor('#000000').moveDown(0.5);
      doc.fontSize(11).text(analiseIA, {
        align: 'justify',
        lineGap: 3,
      });

      doc.moveDown(2);

      // Top 10 Mercados
      doc.fontSize(14).text('Top 10 Mercados');
      doc.moveDown(0.5);
      doc.fontSize(10);
      top10Mercados.forEach((mercado, i) => {
        doc.text(
          `${i + 1}. ${mercado.nome} - Tamanho: ${mercado.tamanhoEstimado || 'N/A'} - Potencial: ${mercado.potencial || 'N/A'}`
        );
      });

      doc.moveDown(1.5);

      // Top 20 Clientes
      doc.fontSize(14).text('Top 20 Clientes');
      doc.moveDown(0.5);
      doc.fontSize(10);
      top20Clientes.forEach((cliente, i) => {
        doc.text(`${i + 1}. ${cliente.nome} - ${cliente.cidade || 'N/A'}/${cliente.uf || 'N/A'}`);
      });

      doc.moveDown(1.5);

      // Produtos Principais
      doc.fontSize(14).text('Produtos Principais');
      doc.moveDown(0.5);
      doc.fontSize(10);
      produtosPrincipais.forEach((produto, i) => {
        doc.text(`${i + 1}. ${produto.nome} (${produto.count} menções)`);
      });

      doc.end();

      // Aguardar finalização do PDF
      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });

      const base64 = pdfBuffer.toString('base64');

      return {
        filename: `relatorio_projeto_${input.projectId}_${Date.now()}.pdf`,
        data: base64,
        mimeType: 'application/pdf',
      };
    }),
});
