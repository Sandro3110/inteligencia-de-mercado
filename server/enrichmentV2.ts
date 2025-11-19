/**
 * Sistema de Enriquecimento Modular V2 - Gemini LLM
 * Implementação completa das 5 etapas de enriquecimento
 */

import { invokeLLM } from './_core/llm';
import { validateAndFormatCNPJ } from './validators';
import { getDb } from "./db";
import { eq, or, sql, and } from "drizzle-orm";
import { clientes, mercadosUnicos, clientesMercados, produtos, concorrentes, leads } from "../drizzle/schema";

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeHash(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateQualityScore(entity: any, weights: Record<string, number>): number {
  let score = 0;
  for (const [field, weight] of Object.entries(weights)) {
    if (entity[field] && entity[field] !== null && entity[field] !== "") {
      score += weight;
    }
  }
  return Math.min(score, 100);
}

function getQualityClassification(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  return "Ruim";
}

// ============================================
// ETAPA 1: ENRIQUECIMENTO DE CLIENTES
// ============================================

export async function enrichCliente(clienteId: number) {
  const db = await getDb();
  if (!db) return null;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) {
    console.error(`[Enrichment] Cliente ${clienteId} não encontrado`);
    return null;
  }

  const prompt = `Você é um especialista em inteligência de mercado B2B brasileiro.

Com base nos dados abaixo, preencha os campos faltantes com informações REAIS e PRECISAS:
- Nome: ${cliente.nome}
- CNPJ: ${cliente.cnpj || "não informado"}
- Produto Principal: ${cliente.produtoPrincipal || "não informado"}

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "siteOficial": "URL do site oficial (pesquise se necessário)",
  "segmentacaoB2bB2c": "B2B | B2C | B2B2C",
  "email": "email de contato comercial",
  "telefone": "telefone principal com DDD",
  "linkedin": "URL do LinkedIn da empresa",
  "instagram": "URL do Instagram (se aplicável, senão null)",
  "cidade": "cidade da sede",
  "uf": "UF da sede (2 letras maiúsculas)",
  "regiao": "Norte | Nordeste | Centro-Oeste | Sudeste | Sul",
  "cnae": "código CNAE principal (formato: 0000-0/00)",
  "porte": "MEI | Pequena | Média | Grande",
  "faturamentoDeclarado": "Faturamento anual declarado (ex: R$ 50 milhões/ano) ou null",
  "numeroEstabelecimentos": "Número de filiais/unidades (inteiro) ou null"
}

REGRAS:
- Use dados reais e atualizados do mercado brasileiro
- Se não encontrar informação confiável, retorne null
- Telefone deve ter formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
- Email deve ser válido e preferencialmente comercial
- Região deve corresponder ao estado (UF)`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;

    const result = JSON.parse(content);
    
    const updateData: any = {};
    if (!cliente.siteOficial && result.siteOficial) updateData.siteOficial = result.siteOficial;
    if (!cliente.segmentacaoB2bB2c && result.segmentacaoB2bB2c) updateData.segmentacaoB2bB2c = result.segmentacaoB2bB2c;
    if (!cliente.email && result.email) updateData.email = result.email;
    if (!cliente.telefone && result.telefone) updateData.telefone = result.telefone;
    if (!cliente.linkedin && result.linkedin) updateData.linkedin = result.linkedin;
    if (!cliente.instagram && result.instagram) updateData.instagram = result.instagram;
    if (!cliente.cidade && result.cidade) updateData.cidade = result.cidade;
    if (!cliente.uf && result.uf) updateData.uf = result.uf;
    if (!cliente.regiao && result.regiao) updateData.regiao = result.regiao;
    if (!cliente.cnae && result.cnae) updateData.cnae = result.cnae;
    if (!cliente.porte && result.porte) updateData.porte = result.porte;
    if (!cliente.faturamentoDeclarado && result.faturamentoDeclarado) updateData.faturamentoDeclarado = result.faturamentoDeclarado;
    if (!cliente.numeroEstabelecimentos && result.numeroEstabelecimentos) updateData.numeroEstabelecimentos = result.numeroEstabelecimentos;

    const weights = {
      cnpj: 15, email: 10, telefone: 8, siteOficial: 10, linkedin: 7,
      cidade: 5, uf: 5, regiao: 5, cnae: 10, porte: 10,
      faturamentoDeclarado: 10, numeroEstabelecimentos: 5
    };
    const updatedCliente = { ...cliente, ...updateData };
    updateData.qualidadeScore = calculateQualityScore(updatedCliente, weights);
    updateData.qualidadeClassificacao = getQualityClassification(updateData.qualidadeScore);

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await db.update(clientes).set(updateData).where(eq(clientes.id, clienteId));
    }

    return result;
  } catch (error) {
    console.error(`[Enrichment] Erro ao enriquecer cliente ${clienteId}:`, error);
    return null;
  }
}

// ============================================
// ETAPA 2: IDENTIFICAÇÃO DE MERCADOS
// ============================================

export async function identifyMercados(clienteId: number, projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) return [];

  const prompt = `Você é um especialista em segmentação de mercado B2B brasileiro.

Analise a empresa abaixo e identifique de 1 a 5 mercados ESPECÍFICOS em que ela atua:
- Nome: ${cliente.nome}
- Produto Principal: ${cliente.produtoPrincipal || "não informado"}
- Segmentação: ${cliente.segmentacaoB2bB2c || "não informado"}
- CNAE: ${cliente.cnae || "não informado"}
- Localização: ${cliente.cidade || "não informado"}/${cliente.uf || "não informado"}

Retorne APENAS um objeto JSON com array "mercados" (sem markdown):
{
  "mercados": [
    {
      "nome": "Nome específico do mercado",
      "segmentacao": "B2B | B2C | B2B2C",
      "categoria": "Categoria CNAE ou setor industrial",
      "tamanhoMercado": "Tamanho do mercado no Brasil",
      "crescimentoAnual": "Taxa de crescimento",
      "tendencias": "Principais tendências (máx 200 caracteres)",
      "principaisPlayers": "Top 5 empresas separadas por vírgula"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    const mercadosData = parsed.mercados || [];

    const mercadoIds: number[] = [];

    for (const mercadoData of mercadosData) {
      const hash = normalizeHash(`${mercadoData.nome}-${projectId}`);
      
      const [existing] = await db.select().from(mercadosUnicos)
        .where(eq(mercadosUnicos.mercadoHash, hash))
        .limit(1);

      let mercadoId: number;

      if (existing) {
        mercadoId = existing.id;
      } else {
        const [newMercado] = await db.insert(mercadosUnicos).values({
          projectId,
          mercadoHash: hash,
          nome: mercadoData.nome,
          segmentacao: mercadoData.segmentacao,
          categoria: mercadoData.categoria,
          tamanhoMercado: mercadoData.tamanhoMercado,
          crescimentoAnual: mercadoData.crescimentoAnual,
          tendencias: mercadoData.tendencias,
          principaisPlayers: mercadoData.principaisPlayers,
        });
        mercadoId = newMercado.insertId;
      }

      mercadoIds.push(mercadoId);

      const [assoc] = await db.select().from(clientesMercados)
        .where(and(
          eq(clientesMercados.clienteId, clienteId),
          eq(clientesMercados.mercadoId, mercadoId)
        ))
        .limit(1);

      if (!assoc) {
        await db.insert(clientesMercados).values({ clienteId, mercadoId });
      }
    }

    return mercadoIds;
  } catch (error) {
    console.error(`[Enrichment] Erro ao identificar mercados:`, error);
    return [];
  }
}

// ============================================
// ETAPA 3: CRIAÇÃO DE PRODUTOS
// ============================================

export async function createProdutosCliente(clienteId: number, projectId: number, mercadoIds: number[]) {
  const db = await getDb();
  if (!db) return 0;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) return 0;

    if (mercadoIds.length === 0) return 0;
    
    const mercados = await db.select().from(mercadosUnicos)
    .where(sql`id IN (${sql.raw(mercadoIds.join(","))})`);

  const mercadosInfo = mercados.map(m => ({ id: m.id, nome: m.nome }));

  const prompt = `Você é um especialista em catálogo de produtos B2B.

Analise a empresa e liste de 2 a 5 produtos ESPECÍFICOS que ela oferece para CADA mercado:
- Cliente: ${cliente.nome}
- Produto Principal: ${cliente.produtoPrincipal || "não informado"}
- Mercados: ${JSON.stringify(mercadosInfo)}

Retorne APENAS um objeto JSON com array "produtos" (sem markdown):
{
  "produtos": [
    {
      "mercadoId": 10,
      "nome": "Nome específico e técnico do produto",
      "descricao": "Descrição técnica detalhada (máx 300 caracteres)",
      "categoria": "Categoria do produto",
      "preco": "Faixa de preço estimada",
      "unidade": "kg | litro | unidade | m² | rolo | caixa"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return 0;

    const parsed = JSON.parse(content);
    const produtosData = parsed.produtos || [];

    let count = 0;
    for (const produtoData of produtosData) {
      // UPSERT: Insert or Update if exists
      await db.insert(produtos).values({
        projectId,
        clienteId,
        mercadoId: produtoData.mercadoId,
        nome: produtoData.nome,
        descricao: produtoData.descricao,
        categoria: produtoData.categoria,
        preco: produtoData.preco,
        unidade: produtoData.unidade,
        ativo: 1,
      }).onDuplicateKeyUpdate({
        set: {
          descricao: produtoData.descricao,
          categoria: produtoData.categoria,
          preco: produtoData.preco,
          unidade: produtoData.unidade,
          updatedAt: new Date(),
        }
      });
      count++;
    }

    return count;
  } catch (error) {
    console.error(`[Enrichment] Erro ao criar produtos:`, error);
    return 0;
  }
}

// ============================================
// ETAPA 4: BUSCA DE CONCORRENTES
// ============================================

export async function findConcorrentesCliente(clienteId: number, projectId: number) {
  const db = await getDb();
  if (!db) return 0;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) return 0;

  const mercadosCliente = await db.select()
    .from(mercadosUnicos)
    .innerJoin(clientesMercados, eq(clientesMercados.mercadoId, mercadosUnicos.id))
    .where(eq(clientesMercados.clienteId, clienteId));

  if (mercadosCliente.length === 0) return 0;

  const todosClientes = await db.select().from(clientes).where(eq(clientes.projectId, projectId));
  const clientesExistentes = todosClientes.map(c => c.nome);

  const mercadosInfo = mercadosCliente.map(m => ({ id: m.mercados_unicos.id, nome: m.mercados_unicos.nome }));

  const produtosCliente = await db.select().from(produtos).where(eq(produtos.clienteId, clienteId));
  const produtosInfo = produtosCliente.map(p => p.nome).join(', ');

  const prompt = `Você é um especialista em mapeamento competitivo B2B brasileiro.

Identifique EXATAMENTE 10 empresas CONCORRENTES DIRETAS que fabricam/fornecem produtos SIMILARES:

**Cliente Referência:**
- Nome: ${cliente.nome}
- Produto Principal: ${cliente.produtoPrincipal || 'não informado'}
- Produtos Específicos: ${produtosInfo || 'não informado'}
- Localização: ${cliente.cidade || '?'}/${cliente.uf || '?'}
- Porte: ${cliente.porte || '?'}

**Mercados de Atuação:**
${mercadosInfo.map(m => `- ${m.nome}`).join('\n')}

**CRITÉRIOS OBRIGATÓRIOS:**
1. Concorrentes devem fabricar/fornecer produtos SIMILARES aos do cliente
2. Priorizar empresas do mesmo porte ou maiores
3. Incluir empresas de diferentes regiões do Brasil (diversidade geográfica)
4. Buscar empresas REAIS e ATIVAS no mercado
5. CNPJs devem ser válidos (formato: 00.000.000/0001-00)

Retorne APENAS um objeto JSON com array "concorrentes" (sem markdown):
{
  "concorrentes": [
    {
      "mercadoId": 10,
      "nome": "Razão social completa da empresa",
      "cnpj": "00.000.000/0001-00 (formato válido) ou null",
      "site": "URL completa do site oficial",
      "produto": "Linha de produtos específica que compete diretamente",
      "cidade": "Cidade da sede principal",
      "uf": "UF (2 letras maiúsculas)",
      "porte": "MEI | Pequena | Média | Grande",
      "faturamentoEstimado": "Faixa de faturamento anual estimado",
      "faturamentoDeclarado": "Faturamento público declarado ou null",
      "numeroEstabelecimentos": "Quantidade de filiais/unidades ou null"
    }
  ]
}

**CRÍTICO - NÃO INCLUIR ESTAS EMPRESAS:**
${JSON.stringify(clientesExistentes)}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return 0;

    const parsed = JSON.parse(content);
    const concorrentesData = parsed.concorrentes || [];

    let count = 0;
    for (const concorrenteData of concorrentesData) {
      const [isCliente] = await db.select().from(clientes)
        .where(or(
          sql`LOWER(TRIM(nome)) = ${concorrenteData.nome.toLowerCase().trim()}`,
          concorrenteData.cnpj ? eq(clientes.cnpj, concorrenteData.cnpj) : sql`FALSE`
        ))
        .limit(1);

      if (isCliente) continue;

      // Validar e formatar CNPJ
      const cnpjValidado = validateAndFormatCNPJ(concorrenteData.cnpj);

      const hash = normalizeHash(`${concorrenteData.nome}-${cnpjValidado || ""}`);
      const [existing] = await db.select().from(concorrentes)
        .where(eq(concorrentes.concorrenteHash, hash))
        .limit(1);

      const weights = {
        cnpj: 20, site: 15, produto: 15, cidade: 5, uf: 5,
        porte: 10, faturamentoDeclarado: 15, numeroEstabelecimentos: 5,
        faturamentoEstimado: 10
      };
      const qualidadeScore = calculateQualityScore(concorrenteData, weights);

      if (existing) {
        // UPDATE: Atualizar dados do concorrente
        await db.update(concorrentes).set({
          site: concorrenteData.site,
          produto: concorrenteData.produto,
          cidade: concorrenteData.cidade,
          uf: concorrenteData.uf,
          porte: concorrenteData.porte,
          faturamentoEstimado: concorrenteData.faturamentoEstimado,
          faturamentoDeclarado: concorrenteData.faturamentoDeclarado,
          numeroEstabelecimentos: concorrenteData.numeroEstabelecimentos,
          qualidadeScore,
          qualidadeClassificacao: getQualityClassification(qualidadeScore),
        }).where(eq(concorrentes.id, existing.id));
      } else {
        // INSERT: Criar novo concorrente
        await db.insert(concorrentes).values({
          projectId,
          concorrenteHash: hash,
          mercadoId: concorrenteData.mercadoId,
          nome: concorrenteData.nome,
          cnpj: cnpjValidado,
          site: concorrenteData.site,
          produto: concorrenteData.produto,
          cidade: concorrenteData.cidade,
          uf: concorrenteData.uf,
          porte: concorrenteData.porte,
          faturamentoEstimado: concorrenteData.faturamentoEstimado,
          faturamentoDeclarado: concorrenteData.faturamentoDeclarado,
          numeroEstabelecimentos: concorrenteData.numeroEstabelecimentos,
          qualidadeScore,
          qualidadeClassificacao: getQualityClassification(qualidadeScore),
        });
      }
      count++;
    }

    return count;
  } catch (error) {
    console.error(`[Enrichment] Erro ao buscar concorrentes:`, error);
    return 0;
  }
}

// ============================================
// ETAPA 5: BUSCA DE LEADS
// ============================================

export async function findLeadsCliente(clienteId: number, projectId: number) {
  const db = await getDb();
  if (!db) return 0;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) return 0;

  const mercadosCliente = await db.select()
    .from(mercadosUnicos)
    .innerJoin(clientesMercados, eq(clientesMercados.mercadoId, mercadosUnicos.id))
    .where(eq(clientesMercados.clienteId, clienteId));

  if (mercadosCliente.length === 0) return 0;

  const todosClientes = await db.select().from(clientes).where(eq(clientes.projectId, projectId));
  const todosConcorrentes = await db.select().from(concorrentes).where(eq(concorrentes.projectId, projectId));
  
  const clientesExistentes = todosClientes.map(c => c.nome);
  const concorrentesExistentes = todosConcorrentes.map(c => c.nome);

  const mercadosInfo = mercadosCliente.map(m => ({ id: m.mercados_unicos.id, nome: m.mercados_unicos.nome }));

  const produtosCliente = await db.select().from(produtos).where(eq(produtos.clienteId, clienteId));
  const produtosInfo = produtosCliente.map(p => `${p.nome} (${p.categoria || 'N/A'})`).join(', ');

  const prompt = `Você é um especialista em prospecção de leads B2B/B2C brasileiro.

Identifique EXATAMENTE 5 empresas que são POTENCIAIS COMPRADORES dos produtos abaixo:

**Produtos a Vender:**
${produtosInfo || cliente.produtoPrincipal || 'não informado'}

**Mercados-Alvo:**
${mercadosInfo.map(m => `- ${m.nome}`).join('\n')}

**Segmentação:** ${cliente.segmentacaoB2bB2c || 'B2B'}

**CRITÉRIOS OBRIGATÓRIOS:**
1. Leads devem ser empresas que COMPRAM/UTILIZAM os produtos listados
2. Diversidade geográfica: incluir leads de DIFERENTES regiões do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
3. Diversidade de porte: incluir empresas de diferentes tamanhos (Pequena, Média, Grande)
4. Diversidade de tipo: incluir pelo menos 3 tipos diferentes (Cliente Potencial, Distribuidor, Parceiro, Integrador, Revendedor)
5. Empresas REAIS e ATIVAS no mercado brasileiro
6. CNPJs válidos quando disponíveis (formato: 00.000.000/0001-00)

**EXEMPLOS DE LEADS POR TIPO:**
- Cliente Potencial: Empresa que usa o produto no seu processo/operação
- Distribuidor: Atacadista que revende para o varejo
- Parceiro: Empresa que pode integrar/complementar a solução
- Integrador: Empresa que incorpora o produto em projetos maiores
- Revendedor: Varejista especializado

Retorne APENAS um objeto JSON com array "leads" (sem markdown):
{
  "leads": [
    {
      "mercadoId": 10,
      "nome": "Razão social completa da empresa",
      "cnpj": "00.000.000/0001-00 (formato válido) ou null",
      "site": "URL completa do site oficial",
      "email": "Email comercial/contato",
      "telefone": "(XX) XXXX-XXXX ou (XX) XXXXX-XXXX",
      "tipo": "Cliente Potencial | Distribuidor | Parceiro | Integrador | Revendedor",
      "cidade": "Cidade da sede",
      "uf": "UF (2 letras maiúsculas)",
      "porte": "Pequena | Média | Grande",
      "faturamentoDeclarado": "Faturamento anual declarado ou null",
      "numeroEstabelecimentos": "Quantidade de unidades ou null",
      "regiao": "Norte | Nordeste | Centro-Oeste | Sudeste | Sul",
      "setor": "Setor específico de atuação do lead"
    }
  ]
}

**CRÍTICO - NÃO INCLUIR ESTAS EMPRESAS:**
${JSON.stringify([...clientesExistentes, ...concorrentesExistentes])}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return 0;

    const parsed = JSON.parse(content);
    const leadsData = parsed.leads || [];

    let count = 0;
    for (const leadData of leadsData) {
      const [isCliente] = await db.select().from(clientes)
        .where(or(
          sql`LOWER(TRIM(nome)) = ${leadData.nome.toLowerCase().trim()}`,
          leadData.cnpj ? eq(clientes.cnpj, leadData.cnpj) : sql`FALSE`
        ))
        .limit(1);

      if (isCliente) continue;

      const [isConcorrente] = await db.select().from(concorrentes)
        .where(or(
          sql`LOWER(TRIM(nome)) = ${leadData.nome.toLowerCase().trim()}`,
          leadData.cnpj ? eq(concorrentes.cnpj, leadData.cnpj) : sql`FALSE`
        ))
        .limit(1);

      if (isConcorrente) continue;

      // Validar e formatar CNPJ
      const cnpjValidado = validateAndFormatCNPJ(leadData.cnpj);

      const hash = normalizeHash(`${leadData.nome}-${cnpjValidado || ""}`);
      const [existing] = await db.select().from(leads)
        .where(eq(leads.leadHash, hash))
        .limit(1);

      const weights = {
        cnpj: 15, email: 15, telefone: 10, site: 10, cidade: 5, uf: 5,
        tipo: 10, porte: 10, faturamentoDeclarado: 10, numeroEstabelecimentos: 5, setor: 5
      };
      const qualidadeScore = calculateQualityScore(leadData, weights);

      if (existing) {
        // UPDATE: Atualizar dados do lead
        await db.update(leads).set({
          site: leadData.site,
          email: leadData.email,
          telefone: leadData.telefone,
          tipo: leadData.tipo,
          cidade: leadData.cidade,
          uf: leadData.uf,
          porte: leadData.porte,
          faturamentoDeclarado: leadData.faturamentoDeclarado,
          numeroEstabelecimentos: leadData.numeroEstabelecimentos,
          regiao: leadData.regiao,
          setor: leadData.setor,
          qualidadeScore,
          qualidadeClassificacao: getQualityClassification(qualidadeScore),
        }).where(eq(leads.id, existing.id));
      } else {
        // INSERT: Criar novo lead
        await db.insert(leads).values({
          projectId,
          leadHash: hash,
          mercadoId: leadData.mercadoId,
          nome: leadData.nome,
          cnpj: cnpjValidado,
          site: leadData.site,
          email: leadData.email,
          telefone: leadData.telefone,
          tipo: leadData.tipo,
          cidade: leadData.cidade,
          uf: leadData.uf,
          porte: leadData.porte,
          faturamentoDeclarado: leadData.faturamentoDeclarado,
          numeroEstabelecimentos: leadData.numeroEstabelecimentos,
          regiao: leadData.regiao,
          setor: leadData.setor,
          qualidadeScore,
          qualidadeClassificacao: getQualityClassification(qualidadeScore),
        });
      }
      count++;
    }

    return count;
  } catch (error) {
    console.error(`[Enrichment] Erro ao buscar leads:`, error);
    return 0;
  }
}

// ============================================
// ENRIQUECIMENTO COMPLETO
// ============================================

export async function enrichClienteCompleto(clienteId: number, projectId: number) {
  console.log(`[Enrichment] Iniciando enriquecimento completo do cliente ${clienteId}`);

  try {
    await enrichCliente(clienteId);
    const mercadoIds = await identifyMercados(clienteId, projectId);
    const produtosCount = await createProdutosCliente(clienteId, projectId, mercadoIds);
    const concorrentesCount = await findConcorrentesCliente(clienteId, projectId);
    const leadsCount = await findLeadsCliente(clienteId, projectId);

    return {
      success: true,
      mercados: mercadoIds.length,
      produtos: produtosCount,
      concorrentes: concorrentesCount,
      leads: leadsCount,
    };
  } catch (error) {
    console.error(`[Enrichment] Erro:`, error);
    return { success: false, mercados: 0, produtos: 0, concorrentes: 0, leads: 0 };
  }
}
