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

**Gere uma análise dissertativa profissional com:**
1. **Resumo Executivo** (2-3 parágrafos): Visão geral da pesquisa, abrangência e principais descobertas
2. **Análise de Mercados** (2-3 parágrafos): Análise dos 10 principais mercados identificados, potencial e oportunidades
3. **Análise de Clientes e Leads** (2 parágrafos): Perfil dos clientes, distribuição geográfica, potencial de negócios
4. **Análise Competitiva** (1-2 parágrafos): Panorama dos concorrentes identificados
5. **Produtos e Serviços** (1-2 parágrafos): Principais produtos/serviços identificados no mercado
6. **Conclusões e Recomendações** (2-3 parágrafos): Insights estratégicos e próximos passos recomendados

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

      // Título
      doc.fontSize(24).font('Helvetica-Bold').text('Relatório de Inteligência de Mercado', {
        align: 'center',
      });

      doc.moveDown();
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Projeto ID: ${input.projectId}`, { align: 'center' });
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });

      doc.moveDown(2);

      // Estatísticas
      doc.fontSize(16).font('Helvetica-Bold').text('Estatísticas Gerais');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`• Total de Pesquisas: ${pesquisas.length}`);
      doc.text(`• Total de Entidades: ${totalEntidades}`);
      doc.text(`  - Clientes: ${clientesData.length}`);
      doc.text(`  - Leads: ${leadsData.length}`);
      doc.text(`  - Concorrentes: ${concorrentesData.length}`);
      doc.text(`  - Mercados: ${mercadosData.length}`);

      doc.moveDown(2);

      // Análise da IA
      doc.fontSize(16).font('Helvetica-Bold').text('Análise Detalhada');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(analiseIA, {
        align: 'justify',
        lineGap: 2,
      });

      doc.moveDown(2);

      // Top 10 Mercados
      doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Mercados');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      top10Mercados.forEach((mercado, i) => {
        doc.text(
          `${i + 1}. ${mercado.nome} - Tamanho: ${mercado.tamanhoEstimado || 'N/A'} - Potencial: ${mercado.potencial || 'N/A'}`
        );
      });

      doc.moveDown(1.5);

      // Top 20 Clientes
      doc.fontSize(14).font('Helvetica-Bold').text('Top 20 Clientes');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      top20Clientes.forEach((cliente, i) => {
        doc.text(`${i + 1}. ${cliente.nome} - ${cliente.cidade || 'N/A'}/${cliente.uf || 'N/A'}`);
      });

      doc.moveDown(1.5);

      // Produtos Principais
      doc.fontSize(14).font('Helvetica-Bold').text('Produtos Principais');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
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
