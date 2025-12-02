#!/usr/bin/env python3
"""
Simulação de Custos - Enriquecimento com IA
Compara GPT-4o vs GPT-4o-mini vs GPT-3.5-turbo
"""

import os
import json
import time
from openai import OpenAI

# Inicializar cliente OpenAI
client = OpenAI(api_key=os.environ.get("BUILT_IN_FORGE_API_KEY"))

# Tabela de preços OpenAI (por 1M tokens)
PRECOS = {
    "gpt-4o": {
        "input": 2.50,   # $2.50 por 1M tokens
        "output": 10.00  # $10.00 por 1M tokens
    },
    "gpt-4o-mini": {
        "input": 0.150,  # $0.15 por 1M tokens
        "output": 0.600  # $0.60 por 1M tokens
    },
    "gpt-3.5-turbo": {
        "input": 0.50,   # $0.50 por 1M tokens
        "output": 1.50   # $1.50 por 1M tokens
    }
}

# Cliente de exemplo para teste
CLIENTE_TESTE = {
    "nome": "TOTVS S.A.",
    "projetoNome": "Análise de Mercado Tech 2025",
    "pesquisaNome": "Empresas de Software"
}

# ============================================================================
# PROMPT 1: ENRIQUECER CLIENTE
# ============================================================================
def criar_prompt_p1(cliente):
    return f"""Você é um analista de dados B2B especializado em empresas brasileiras.

CLIENTE: {cliente['nome']}
PROJETO: {cliente['projetoNome']}
PESQUISA: {cliente['pesquisaNome']}

TAREFA: Enriquecer dados cadastrais do cliente com informações REAIS e VERIFICÁVEIS do Brasil.

CAMPOS A PREENCHER (8):

1. nomeFantasia (string | null): Nome fantasia se diferente da razão social
2. cnpj (string | null): Formato XX.XXX.XXX/XXXX-XX - NULL se NÃO TIVER CERTEZA
3. email (string | null): Email corporativo oficial
4. telefone (string | null): Formato (XX) XXXXX-XXXX
5. site (string | null): URL completa https://...
6. numFiliais (number | null): Número de filiais
7. numLojas (number | null): Número de lojas físicas
8. numFuncionarios (number | null): Número aproximado de funcionários

REGRAS CRÍTICAS:
- Dados do BRASIL
- Se NÃO TEM CERTEZA: retorne NULL
- Seja conservador e preciso

FORMATO DE SAÍDA (JSON válido):
{{
  "nomeFantasia": "string ou null",
  "cnpj": "string ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string ou null",
  "numFiliais": number ou null,
  "numLojas": number ou null,
  "numFuncionarios": number ou null
}}"""

# ============================================================================
# PROMPT 2: MERCADO FORNECEDOR
# ============================================================================
def criar_prompt_p2(cliente):
    return f"""Você é um analista de mercado especializado em inteligência competitiva do Brasil.

CLIENTE: {cliente['nome']}

TAREFA: Identificar o MERCADO FORNECEDOR onde o cliente ATUA.

CAMPOS A PREENCHER (7):

1. nome (string): Nome específico do mercado
2. categoria (string): Indústria | Comércio | Serviços | Tecnologia
3. segmentacao (string): B2B | B2C | B2B2C
4. tamanhoMercado (string): Tamanho no Brasil em R$ e número de empresas
5. crescimentoAnual (string): Taxa de crescimento anual
6. tendencias (array): 3-5 tendências ATUAIS do mercado brasileiro
7. principaisPlayers (array): 5-10 empresas brasileiras LÍDERES

FORMATO DE SAÍDA (JSON válido):
{{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": ["string", "string", "string"],
  "principaisPlayers": ["string", "string", "string", "string", "string"]
}}"""

# ============================================================================
# PROMPT 3: PRODUTOS
# ============================================================================
def criar_prompt_p3(cliente):
    return f"""Você é um especialista em análise de produtos e serviços B2B.

CLIENTE: {cliente['nome']}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços que o cliente OFERECE.

CAMPOS (para cada produto):
1. nome (string): Nome do produto/serviço
2. categoria (string): Categoria específica
3. descricao (text): Descrição DETALHADA (max 500 chars)

REGRAS:
- EXATAMENTE 3 produtos
- Produtos DIFERENTES entre si
- Descrições ESPECÍFICAS e TÉCNICAS

FORMATO DE SAÍDA (JSON válido com 3 produtos):
{{
  "produtos": [
    {{"nome": "string", "categoria": "string", "descricao": "string"}},
    {{"nome": "string", "categoria": "string", "descricao": "string"}},
    {{"nome": "string", "categoria": "string", "descricao": "string"}}
  ]
}}"""

# ============================================================================
# PROMPT 4: CONCORRENTES
# ============================================================================
def criar_prompt_p4(cliente, mercado_nome="Software de Gestão Empresarial"):
    return f"""Você é um especialista em inteligência competitiva do Brasil.

CLIENTE (NÃO PODE SER CONCORRENTE): {cliente['nome']}
MERCADO FORNECEDOR: {mercado_nome}

TAREFA: Identificar 5 CONCORRENTES REAIS do mesmo mercado.

CAMPOS (para cada concorrente):
1. nome (string): Razão social
2. cidade (string): Cidade
3. uf (string): Estado 2 letras
4. cnpj (string | null): NULL se não souber
5. site (string | null): URL
6. porte (string | null): Micro|Pequena|Média|Grande
7. produtoPrincipal (string): Principal produto similar
8. nivelCompeticao (string): Direto|Indireto|Potencial

REGRAS:
- EXATAMENTE 5 concorrentes
- NÃO inclua {cliente['nome']}
- Empresas REAIS

FORMATO DE SAÍDA (JSON válido com 5 concorrentes):
{{
  "concorrentes": [
    {{"nome": "string", "cidade": "string", "uf": "string", "cnpj": "string ou null", "site": "string ou null", "porte": "string ou null", "produtoPrincipal": "string", "nivelCompeticao": "string"}},
    ... (mais 4)
  ]
}}"""

# ============================================================================
# PROMPT 5: LEADS
# ============================================================================
def criar_prompt_p5(cliente):
    return f"""Você é um especialista em prospecção B2B do Brasil.

CLIENTE (FORNECEDOR): {cliente['nome']}

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM os produtos do cliente).

CAMPOS (para cada lead):
1. nome (string): Razão social
2. cidade (string): Cidade
3. uf (string): Estado 2 letras
4. cnpj (string | null): NULL se não souber
5. site (string | null): URL
6. setor (string): Setor de atuação
7. produtoInteresse (string): Qual produto compraria
8. motivoFit (string | null): Por que é um bom lead

REGRAS:
- EXATAMENTE 5 leads
- NÃO inclua {cliente['nome']}
- Empresas REAIS que usariam os produtos

FORMATO DE SAÍDA (JSON válido com 5 leads):
{{
  "leads": [
    {{"nome": "string", "cidade": "string", "uf": "string", "cnpj": "string ou null", "site": "string ou null", "setor": "string", "produtoInteresse": "string", "motivoFit": "string ou null"}},
    ... (mais 4)
  ]
}}"""

# ============================================================================
# PROMPT 6: VALIDAÇÃO
# ============================================================================
def criar_prompt_p6():
    return """Você é um validador de qualidade de dados.

TAREFA: Calcular score de qualidade (0-100).

CRITÉRIOS:
- Campos obrigatórios: 60 pontos
- Campos opcionais: 40 pontos

CLASSIFICAÇÃO:
- 90-100: "excelente"
- 75-89: "bom"
- 60-74: "aceitavel"
- 0-59: "ruim"

FORMATO DE SAÍDA (JSON):
{
  "qualidadeScore": 95,
  "qualidadeClassificacao": "excelente"
}"""

# ============================================================================
# FUNÇÃO DE SIMULAÇÃO
# ============================================================================
def simular_prompt(prompt_texto, modelo, temperatura=1.0, prompt_nome=""):
    """Simula chamada à API OpenAI e retorna métricas"""
    
    print(f"\n{'='*80}")
    print(f"🔬 Simulando: {prompt_nome}")
    print(f"📊 Modelo: {modelo}")
    print(f"🌡️  Temperatura: {temperatura}")
    print(f"{'='*80}")
    
    try:
        inicio = time.time()
        
        response = client.chat.completions.create(
            model=modelo,
            temperature=temperatura,
            messages=[
                {"role": "system", "content": "Você é um assistente especializado em análise de dados B2B do Brasil."},
                {"role": "user", "content": prompt_texto}
            ],
            response_format={"type": "json_object"}
        )
        
        tempo_resposta = time.time() - inicio
        
        # Extrair métricas
        tokens_input = response.usage.prompt_tokens
        tokens_output = response.usage.completion_tokens
        tokens_total = response.usage.total_tokens
        
        # Calcular custo
        custo_input = (tokens_input / 1_000_000) * PRECOS[modelo]["input"]
        custo_output = (tokens_output / 1_000_000) * PRECOS[modelo]["output"]
        custo_total = custo_input + custo_output
        
        # Extrair resposta
        resposta = response.choices[0].message.content
        
        # Validar JSON
        try:
            resposta_json = json.loads(resposta)
            json_valido = True
        except:
            resposta_json = None
            json_valido = False
        
        # Exibir resultados
        print(f"\n✅ Sucesso!")
        print(f"⏱️  Tempo: {tempo_resposta:.2f}s")
        print(f"📥 Tokens Input: {tokens_input:,}")
        print(f"📤 Tokens Output: {tokens_output:,}")
        print(f"📊 Tokens Total: {tokens_total:,}")
        print(f"💰 Custo Input: ${custo_input:.6f}")
        print(f"💰 Custo Output: ${custo_output:.6f}")
        print(f"💰 Custo Total: ${custo_total:.6f}")
        print(f"✓  JSON Válido: {json_valido}")
        
        if resposta_json:
            print(f"\n📄 Resposta (preview):")
            print(json.dumps(resposta_json, indent=2, ensure_ascii=False)[:500] + "...")
        
        return {
            "modelo": modelo,
            "prompt_nome": prompt_nome,
            "tokens_input": tokens_input,
            "tokens_output": tokens_output,
            "tokens_total": tokens_total,
            "custo_input": custo_input,
            "custo_output": custo_output,
            "custo_total": custo_total,
            "tempo_resposta": tempo_resposta,
            "json_valido": json_valido,
            "resposta": resposta_json
        }
        
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        return None

# ============================================================================
# SIMULAÇÃO COMPLETA
# ============================================================================
def simular_cenario_completo(modelo):
    """Simula todos os 6 prompts para um modelo"""
    
    print(f"\n\n{'#'*80}")
    print(f"# CENÁRIO: {modelo.upper()}")
    print(f"{'#'*80}")
    
    resultados = []
    
    # P1: Cliente
    p1 = simular_prompt(
        criar_prompt_p1(CLIENTE_TESTE),
        modelo,
        temperatura=1.0,
        prompt_nome="P1: Enriquecer Cliente"
    )
    if p1: resultados.append(p1)
    time.sleep(1)  # Rate limit
    
    # P2: Mercado
    p2 = simular_prompt(
        criar_prompt_p2(CLIENTE_TESTE),
        modelo,
        temperatura=1.0,
        prompt_nome="P2: Mercado Fornecedor"
    )
    if p2: resultados.append(p2)
    time.sleep(1)
    
    # P3: Produtos
    p3 = simular_prompt(
        criar_prompt_p3(CLIENTE_TESTE),
        modelo,
        temperatura=1.0,
        prompt_nome="P3: Produtos"
    )
    if p3: resultados.append(p3)
    time.sleep(1)
    
    # P4: Concorrentes
    p4 = simular_prompt(
        criar_prompt_p4(CLIENTE_TESTE),
        modelo,
        temperatura=1.0,
        prompt_nome="P4: Concorrentes"
    )
    if p4: resultados.append(p4)
    time.sleep(1)
    
    # P5: Leads
    p5 = simular_prompt(
        criar_prompt_p5(CLIENTE_TESTE),
        modelo,
        temperatura=1.0,
        prompt_nome="P5: Leads"
    )
    if p5: resultados.append(p5)
    time.sleep(1)
    
    # P6: Validação (sempre GPT-4o-mini)
    p6 = simular_prompt(
        criar_prompt_p6(),
        "gpt-4o-mini",
        temperatura=1.0,
        prompt_nome="P6: Validação"
    )
    if p6: resultados.append(p6)
    
    return resultados

# ============================================================================
# RELATÓRIO COMPARATIVO
# ============================================================================
def gerar_relatorio(cenarios):
    """Gera relatório comparativo entre cenários"""
    
    print(f"\n\n{'#'*80}")
    print(f"# RELATÓRIO COMPARATIVO")
    print(f"{'#'*80}\n")
    
    for nome_cenario, resultados in cenarios.items():
        total_tokens_input = sum(r["tokens_input"] for r in resultados)
        total_tokens_output = sum(r["tokens_output"] for r in resultados)
        total_tokens = sum(r["tokens_total"] for r in resultados)
        total_custo = sum(r["custo_total"] for r in resultados)
        total_tempo = sum(r["tempo_resposta"] for r in resultados)
        
        print(f"\n{'='*80}")
        print(f"CENÁRIO: {nome_cenario}")
        print(f"{'='*80}")
        print(f"📥 Tokens Input Total:  {total_tokens_input:,}")
        print(f"📤 Tokens Output Total: {total_tokens_output:,}")
        print(f"📊 Tokens Total:        {total_tokens:,}")
        print(f"💰 Custo Total:         ${total_custo:.4f}")
        print(f"⏱️  Tempo Total:         {total_tempo:.2f}s")
        print(f"\nDetalhamento por Prompt:")
        for r in resultados:
            print(f"  {r['prompt_nome']:25} | Tokens: {r['tokens_total']:6,} | Custo: ${r['custo_total']:.4f}")
    
    # Tabela comparativa final
    print(f"\n\n{'='*80}")
    print(f"TABELA COMPARATIVA FINAL")
    print(f"{'='*80}\n")
    
    print(f"{'Cenário':<30} | {'Tokens':<10} | {'Custo':<12} | {'Tempo':<10}")
    print(f"{'-'*30}-+-{'-'*10}-+-{'-'*12}-+-{'-'*10}")
    
    for nome_cenario, resultados in cenarios.items():
        total_tokens = sum(r["tokens_total"] for r in resultados)
        total_custo = sum(r["custo_total"] for r in resultados)
        total_tempo = sum(r["tempo_resposta"] for r in resultados)
        print(f"{nome_cenario:<30} | {total_tokens:>10,} | ${total_custo:>10.4f} | {total_tempo:>8.2f}s")
    
    # Economia
    print(f"\n{'='*80}")
    print(f"ECONOMIA")
    print(f"{'='*80}\n")
    
    custo_base = sum(r["custo_total"] for r in cenarios["GPT-4o (Atual)"])
    
    for nome_cenario, resultados in cenarios.items():
        if nome_cenario == "GPT-4o (Atual)":
            continue
        custo_cenario = sum(r["custo_total"] for r in resultados)
        economia = custo_base - custo_cenario
        economia_pct = (economia / custo_base) * 100
        print(f"{nome_cenario:<30} | Economia: ${economia:.4f} ({economia_pct:.1f}%)")

# ============================================================================
# MAIN
# ============================================================================
if __name__ == "__main__":
    print("🚀 Iniciando Simulação de Custos - Enriquecimento com IA")
    print(f"📊 Cliente de Teste: {CLIENTE_TESTE['nome']}\n")
    
    cenarios = {}
    
    # Cenário 1: GPT-4o (Atual)
    print("\n🔵 Simulando Cenário 1: GPT-4o (Atual)")
    cenarios["GPT-4o (Atual)"] = simular_cenario_completo("gpt-4o")
    
    # Cenário 2: GPT-4o-mini
    print("\n🟢 Simulando Cenário 2: GPT-4o-mini")
    cenarios["GPT-4o-mini"] = simular_cenario_completo("gpt-4o-mini")
    
    # Cenário 3: GPT-3.5-turbo
    print("\n🟡 Simulando Cenário 3: GPT-3.5-turbo")
    cenarios["GPT-3.5-turbo"] = simular_cenario_completo("gpt-3.5-turbo")
    
    # Gerar relatório
    gerar_relatorio(cenarios)
    
    # Salvar resultados
    with open("/home/ubuntu/inteligencia-de-mercado/simulacao-custos-resultado.json", "w") as f:
        json.dump(cenarios, f, indent=2, ensure_ascii=False, default=str)
    
    print("\n\n✅ Simulação concluída!")
    print("📄 Resultados salvos em: simulacao-custos-resultado.json")
