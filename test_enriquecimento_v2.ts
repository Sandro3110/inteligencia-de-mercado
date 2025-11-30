/**
 * TESTE DO SISTEMA DE ENRIQUECIMENTO V2
 *
 * Arquitetura de 8 Fases:
 * 1. Enriquecer Cliente
 * 2. Identificar Mercado
 * 3. Produtos/Serviços
 * 4. Concorrentes
 * 5. Leads
 * 6. Validação e Qualificação
 * 7. Geocodificação
 * 8. Gravação
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Importar prompts
import { PROMPT_CLIENTE, type ClienteEnriquecido } from './prompts_v2/prompt1_cliente';
import { PROMPT_MERCADO, type MercadoEnriquecido } from './prompts_v2/prompt2_mercado';
import { PROMPT_PRODUTOS, type ProdutosResponse } from './prompts_v2/prompt3_produtos';
import { PROMPT_CONCORRENTES, type ConcorrentesResponse } from './prompts_v2/prompt4_concorrentes';
import { PROMPT_LEADS, type LeadsResponse } from './prompts_v2/prompt5_leads';

// Cliente de teste
const CLIENTE_TESTE = {
  nome: 'TOTVS',
  cnpj: '53.113.791/0001-22',
};

interface ResultadoEnriquecimento {
  cliente: ClienteEnriquecido;
  mercado: MercadoEnriquecido;
  produtos: ProdutosResponse;
  concorrentes: ConcorrentesResponse;
  leads: LeadsResponse;
  qualidade: {
    score: number;
    camposPreenchidos: number;
    camposTotal: number;
    validacoes: string[];
  };
}

/**
 * FASE 1: Enriquecer Cliente
 */
async function fase1_enriquecerCliente(cliente: typeof CLIENTE_TESTE): Promise<ClienteEnriquecido> {
  console.log('\n🔵 FASE 1: Enriquecendo Cliente...');

  const prompt = PROMPT_CLIENTE.replace('{{clienteNome}}', cliente.nome).replace(
    '{{clienteCnpj}}',
    cliente.cnpj
  );

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const resultado = JSON.parse(response.choices[0].message.content!) as ClienteEnriquecido;
  console.log('✅ Cliente enriquecido:', resultado);

  return resultado;
}

/**
 * FASE 2: Identificar Mercado
 */
async function fase2_identificarMercado(cliente: ClienteEnriquecido): Promise<MercadoEnriquecido> {
  console.log('\n🔵 FASE 2: Identificando Mercado...');

  const prompt = PROMPT_MERCADO.replace('{{clienteNome}}', cliente.nome)
    .replace('{{clienteSetor}}', cliente.setor)
    .replace('{{clienteDescricao}}', cliente.descricao);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    response_format: { type: 'json_object' },
  });

  const resultado = JSON.parse(response.choices[0].message.content!) as MercadoEnriquecido;
  console.log('✅ Mercado identificado:', resultado);

  return resultado;
}

/**
 * FASE 3: Produtos/Serviços
 */
async function fase3_produtos(cliente: ClienteEnriquecido): Promise<ProdutosResponse> {
  console.log('\n🔵 FASE 3: Identificando Produtos/Serviços...');

  const prompt = PROMPT_PRODUTOS.replace('{{clienteNome}}', cliente.nome)
    .replace('{{clienteSetor}}', cliente.setor)
    .replace('{{clienteDescricao}}', cliente.descricao)
    .replace('{{clienteSite}}', cliente.site || 'não disponível');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    response_format: { type: 'json_object' },
  });

  const resultado = JSON.parse(response.choices[0].message.content!) as ProdutosResponse;
  console.log(`✅ ${resultado.produtos.length} produtos identificados`);

  return resultado;
}

/**
 * FASE 4: Concorrentes
 */
async function fase4_concorrentes(
  cliente: ClienteEnriquecido,
  mercado: MercadoEnriquecido,
  produtos: ProdutosResponse
): Promise<ConcorrentesResponse> {
  console.log('\n🔵 FASE 4: Identificando Concorrentes...');

  const produtosStr = produtos.produtos.map((p) => p.nome).join(', ');

  const prompt = PROMPT_CONCORRENTES.replace('{{clienteNome}}', cliente.nome)
    .replace('{{clienteSetor}}', cliente.setor)
    .replace('{{clienteProdutos}}', produtosStr)
    .replace('{{mercadoNome}}', mercado.nome);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.0,
    response_format: { type: 'json_object' },
  });

  const resultado = JSON.parse(response.choices[0].message.content!) as ConcorrentesResponse;
  console.log(`✅ ${resultado.concorrentes.length} concorrentes identificados`);

  return resultado;
}

/**
 * FASE 5: Leads
 */
async function fase5_leads(
  cliente: ClienteEnriquecido,
  produtos: ProdutosResponse
): Promise<LeadsResponse> {
  console.log('\n🔵 FASE 5: Identificando Leads...');

  const produtosStr = produtos.produtos.map((p) => p.nome).join(', ');
  const publicoAlvo = produtos.produtos.map((p) => p.publicoAlvo).join('; ');

  const prompt = PROMPT_LEADS.replace('{{clienteNome}}', cliente.nome)
    .replace('{{clienteSetor}}', cliente.setor)
    .replace('{{clienteProdutos}}', produtosStr)
    .replace('{{publicoAlvo}}', publicoAlvo);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.0,
    response_format: { type: 'json_object' },
  });

  const resultado = JSON.parse(response.choices[0].message.content!) as LeadsResponse;
  console.log(`✅ ${resultado.leads.length} leads identificados`);

  return resultado;
}

/**
 * FASE 6: Validação e Qualificação
 */
function fase6_validacao(
  resultado: Omit<ResultadoEnriquecimento, 'qualidade'>
): ResultadoEnriquecimento['qualidade'] {
  console.log('\n🔵 FASE 6: Validação e Qualificação...');

  const validacoes: string[] = [];
  let camposPreenchidos = 0;
  let camposTotal = 0;

  // Validar Cliente
  camposTotal += 7;
  if (resultado.cliente.nome) camposPreenchidos++;
  if (resultado.cliente.cnpj) camposPreenchidos++;
  if (resultado.cliente.site) camposPreenchidos++;
  if (resultado.cliente.cidade) camposPreenchidos++;
  if (resultado.cliente.uf) camposPreenchidos++;
  if (resultado.cliente.setor) camposPreenchidos++;
  if (resultado.cliente.descricao) camposPreenchidos++;

  if (!resultado.cliente.cidade || !resultado.cliente.uf) {
    validacoes.push('❌ Cliente sem localização completa');
  } else {
    validacoes.push('✅ Cliente com localização');
  }

  // Validar Mercado
  camposTotal += 7;
  if (resultado.mercado.nome) camposPreenchidos++;
  if (resultado.mercado.categoria) camposPreenchidos++;
  if (resultado.mercado.segmentacao) camposPreenchidos++;
  if (resultado.mercado.tamanhoMercado) camposPreenchidos++;
  if (resultado.mercado.crescimentoAnual) camposPreenchidos++;
  if (resultado.mercado.tendencias.length >= 3) camposPreenchidos++;
  if (resultado.mercado.principaisPlayers.length >= 5) camposPreenchidos++;

  if (resultado.mercado.tendencias.length < 3) {
    validacoes.push(
      `❌ Mercado com apenas ${resultado.mercado.tendencias.length} tendências (mínimo 3)`
    );
  } else {
    validacoes.push(`✅ Mercado com ${resultado.mercado.tendencias.length} tendências`);
  }

  // Validar Produtos
  if (resultado.produtos.produtos.length !== 3) {
    validacoes.push(`❌ ${resultado.produtos.produtos.length} produtos (esperado: 3)`);
  } else {
    validacoes.push('✅ 3 produtos identificados');
    camposPreenchidos += 3;
  }
  camposTotal += 3;

  // Validar Concorrentes
  if (resultado.concorrentes.concorrentes.length !== 5) {
    validacoes.push(`❌ ${resultado.concorrentes.concorrentes.length} concorrentes (esperado: 5)`);
  } else {
    validacoes.push('✅ 5 concorrentes identificados');
  }

  const concorrentesComLocalizacao = resultado.concorrentes.concorrentes.filter(
    (c) => c.cidade && c.uf
  ).length;
  camposPreenchidos += concorrentesComLocalizacao;
  camposTotal += 5;
  validacoes.push(
    `${concorrentesComLocalizacao === 5 ? '✅' : '⚠️'} ${concorrentesComLocalizacao}/5 concorrentes com localização`
  );

  // Validar Leads
  if (resultado.leads.leads.length !== 5) {
    validacoes.push(`❌ ${resultado.leads.leads.length} leads (esperado: 5)`);
  } else {
    validacoes.push('✅ 5 leads identificados');
  }

  const leadsComLocalizacao = resultado.leads.leads.filter((l) => l.cidade && l.uf).length;
  camposPreenchidos += leadsComLocalizacao;
  camposTotal += 5;
  validacoes.push(
    `${leadsComLocalizacao === 5 ? '✅' : '⚠️'} ${leadsComLocalizacao}/5 leads com localização`
  );

  const score = Math.round((camposPreenchidos / camposTotal) * 100);

  console.log(`\n📊 Score de Qualidade: ${score}%`);
  console.log(`📈 Campos Preenchidos: ${camposPreenchidos}/${camposTotal}`);
  validacoes.forEach((v) => console.log(v));

  return {
    score,
    camposPreenchidos,
    camposTotal,
    validacoes,
  };
}

/**
 * Executar teste completo
 */
async function executarTeste() {
  console.log('🚀 INICIANDO TESTE DO SISTEMA DE ENRIQUECIMENTO V2\n');
  console.log(`📋 Cliente de Teste: ${CLIENTE_TESTE.nome}`);
  console.log('='.repeat(60));

  try {
    // Fase 1: Cliente
    const cliente = await fase1_enriquecerCliente(CLIENTE_TESTE);

    // Fase 2: Mercado
    const mercado = await fase2_identificarMercado(cliente);

    // Fase 3: Produtos
    const produtos = await fase3_produtos(cliente);

    // Fase 4: Concorrentes
    const concorrentes = await fase4_concorrentes(cliente, mercado, produtos);

    // Fase 5: Leads
    const leads = await fase5_leads(cliente, produtos);

    // Fase 6: Validação
    const qualidade = fase6_validacao({
      cliente,
      mercado,
      produtos,
      concorrentes,
      leads,
    });

    const resultado: ResultadoEnriquecimento = {
      cliente,
      mercado,
      produtos,
      concorrentes,
      leads,
      qualidade,
    };

    // Salvar resultado
    const fs = await import('fs/promises');
    await fs.writeFile('resultado_teste_v2.json', JSON.stringify(resultado, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log(`📁 Resultado salvo em: resultado_teste_v2.json`);
    console.log(`🎯 Score Final: ${qualidade.score}%`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    throw error;
  }
}

// Executar
executarTeste();
