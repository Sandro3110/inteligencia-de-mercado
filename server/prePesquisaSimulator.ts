/**
 * Módulo de Simulação de IA para Testes de Pré-Pesquisa Inteligente
 *
 * Simula respostas da OpenAI para testar os 4 fluxos principais:
 * 1. Retry Inteligente
 * 2. Processamento Multi-Cliente
 * 3. Aprovação Obrigatória
 * 4. Refinamento de Contexto (3 Níveis)
 */

// Tipo de dados de empresa
export interface EmpresaInfo {
  nome: string;
  cnpj: string | null;
  site: string | null;
  produto: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  segmentacao: string | null;
  porte: string | null;
}

// Tipo de entidade separada
export interface EntidadeSeparada {
  tipo: "especifica" | "contexto";
  query: string;
  contexto_adicional: string | null;
}

// Tipo de pergunta de refinamento
export interface PerguntaRefinamento {
  pergunta: string;
  opcoes: string[];
}

// Tipo de resultado de retry
export interface RetryResult {
  tentativa: number;
  completude: number;
  dados: EmpresaInfo;
  camposFaltantes: string[];
}

/**
 * Calcula completude dos dados (0-100%)
 */
export function calcularCompletude(empresa: EmpresaInfo): number {
  const campos = [
    "nome",
    "cnpj",
    "site",
    "produto",
    "cidade",
    "uf",
    "telefone",
    "email",
    "segmentacao",
    "porte",
  ];

  const preenchidos = campos.filter(campo => {
    const valor = empresa[campo as keyof EmpresaInfo];
    return valor !== null && valor !== "";
  }).length;

  return Math.round((preenchidos / campos.length) * 100);
}

/**
 * Identifica campos faltantes
 */
export function identificarCamposFaltantes(empresa: EmpresaInfo): string[] {
  const campos = [
    "nome",
    "cnpj",
    "site",
    "produto",
    "cidade",
    "uf",
    "telefone",
    "email",
    "segmentacao",
    "porte",
  ];

  return campos.filter(campo => {
    const valor = empresa[campo as keyof EmpresaInfo];
    return valor === null || valor === "";
  });
}

/**
 * FLUXO 1: RETRY INTELIGENTE
 * Simula 3 tentativas progressivas de pré-pesquisa
 */
export async function simularRetryInteligente(
  query: string
): Promise<RetryResult[]> {
  const resultados: RetryResult[] = [];

  // Tentativa 1: Dados parciais (40% completude)
  const tentativa1: EmpresaInfo = {
    nome: "Empresa XYZ Ltda",
    cnpj: null,
    site: null,
    produto: "Serviços de consultoria",
    cidade: "São Paulo",
    uf: "SP",
    telefone: null,
    email: null,
    segmentacao: null,
    porte: null,
  };

  resultados.push({
    tentativa: 1,
    completude: calcularCompletude(tentativa1),
    dados: tentativa1,
    camposFaltantes: identificarCamposFaltantes(tentativa1),
  });

  // Simular delay de 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Tentativa 2: Dados melhorados (70% completude)
  const tentativa2: EmpresaInfo = {
    ...tentativa1,
    cnpj: "12.345.678/0001-90",
    site: "https://www.empresaxyz.com.br",
    telefone: "(11) 1234-5678",
    email: "contato@empresaxyz.com.br",
  };

  resultados.push({
    tentativa: 2,
    completude: calcularCompletude(tentativa2),
    dados: tentativa2,
    camposFaltantes: identificarCamposFaltantes(tentativa2),
  });

  // Simular delay de 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Tentativa 3: Dados completos (100% completude)
  const tentativa3: EmpresaInfo = {
    ...tentativa2,
    segmentacao: "B2B",
    porte: "Médio",
  };

  resultados.push({
    tentativa: 3,
    completude: calcularCompletude(tentativa3),
    dados: tentativa3,
    camposFaltantes: identificarCamposFaltantes(tentativa3),
  });

  return resultados;
}

/**
 * FLUXO 2: PROCESSAMENTO MULTI-CLIENTE
 * Simula separação de entidades em texto livre
 */
export async function simularSeparacaoMultiCliente(
  textoLivre: string
): Promise<EntidadeSeparada[]> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Exemplo: "Pesquisei cooperativas agrícolas de café em Minas Gerais e distribuidoras de insumos em São Paulo"
  if (
    textoLivre.toLowerCase().includes("cooperativas") &&
    textoLivre.toLowerCase().includes("distribuidoras")
  ) {
    return [
      {
        tipo: "contexto",
        query: "cooperativas agrícolas de café",
        contexto_adicional: "Minas Gerais",
      },
      {
        tipo: "contexto",
        query: "distribuidoras de insumos",
        contexto_adicional: "São Paulo",
      },
    ];
  }

  // Exemplo: "Quero pesquisar a Cooperativa de Holambra, a Carga Pesada Distribuidora e a Braskem"
  if (
    textoLivre.toLowerCase().includes("holambra") &&
    textoLivre.toLowerCase().includes("braskem")
  ) {
    return [
      {
        tipo: "especifica",
        query: "Cooperativa de Holambra",
        contexto_adicional: null,
      },
      {
        tipo: "especifica",
        query: "Carga Pesada Distribuidora",
        contexto_adicional: null,
      },
      {
        tipo: "especifica",
        query: "Braskem",
        contexto_adicional: null,
      },
    ];
  }

  // Fallback: Retornar query única
  return [
    {
      tipo: "especifica",
      query: textoLivre,
      contexto_adicional: null,
    },
  ];
}

/**
 * FLUXO 2: Pré-pesquisa de entidade específica
 */
export async function simularPrePesquisaEntidade(
  entidade: EntidadeSeparada
): Promise<EmpresaInfo> {
  // Simular delay de pesquisa
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Dados simulados baseados na query
  if (entidade.query.toLowerCase().includes("holambra")) {
    return {
      nome: "Cooperativa de Insumos de Holambra",
      cnpj: "46.331.066/0001-00",
      site: "https://www.cih.com.br",
      produto: "Insumos agrícolas",
      cidade: "Holambra",
      uf: "SP",
      telefone: "(19) 3802-8000",
      email: "contato@cih.com.br",
      segmentacao: "B2B",
      porte: "Grande",
    };
  }

  if (entidade.query.toLowerCase().includes("carga pesada")) {
    return {
      nome: "Carga Pesada Distribuidora",
      cnpj: "08.835.655/0001-90",
      site: "https://www.cargapesada.com.br",
      produto: "Distribuição de cargas",
      cidade: "São Paulo",
      uf: "SP",
      telefone: "(11) 3456-7890",
      email: "contato@cargapesada.com.br",
      segmentacao: "B2B",
      porte: "Médio",
    };
  }

  if (entidade.query.toLowerCase().includes("braskem")) {
    return {
      nome: "Braskem S.A.",
      cnpj: "42.150.391/0001-70",
      site: "https://www.braskem.com.br",
      produto: "Petroquímica e plásticos",
      cidade: "São Paulo",
      uf: "SP",
      telefone: null, // Proposital para testar completude parcial
      email: null,
      segmentacao: "B2B",
      porte: "Grande",
    };
  }

  // Fallback: Dados genéricos
  return {
    nome: entidade.query,
    cnpj: "00.000.000/0001-00",
    site: null,
    produto: "Não especificado",
    cidade: entidade.contexto_adicional || "São Paulo",
    uf: "SP",
    telefone: null,
    email: null,
    segmentacao: "B2B",
    porte: "Médio",
  };
}

/**
 * FLUXO 4: REFINAMENTO DE CONTEXTO (3 NÍVEIS)
 * Simula geração de perguntas de refinamento
 */
export async function simularPerguntaNivel1(
  contextoInicial: string
): Promise<PerguntaRefinamento> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (contextoInicial.toLowerCase().includes("cooperativas agrícolas")) {
    return {
      pergunta: "Cooperativas agrícolas de qual setor específico?",
      opcoes: [
        "Café",
        "Soja",
        "Algodão",
        "Milho",
        "Frutas e hortaliças",
        "Pecuária (leite/carne)",
        "Insumos agrícolas",
        "Outro (especifique)",
      ],
    };
  }

  if (contextoInicial.toLowerCase().includes("distribuidoras")) {
    return {
      pergunta: "Distribuidoras de qual tipo de produto?",
      opcoes: [
        "Insumos agrícolas",
        "Alimentos",
        "Bebidas",
        "Produtos químicos",
        "Materiais de construção",
        "Equipamentos industriais",
        "Outro (especifique)",
      ],
    };
  }

  // Fallback genérico
  return {
    pergunta: "Qual o setor ou tipo de produto específico?",
    opcoes: [
      "Alimentos e bebidas",
      "Agronegócio",
      "Indústria química",
      "Construção civil",
      "Tecnologia",
      "Serviços",
      "Outro (especifique)",
    ],
  };
}

export async function simularPerguntaNivel2(
  contextoInicial: string,
  respostasNivel1: string[]
): Promise<PerguntaRefinamento> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  const primeiraResposta = respostasNivel1[0] || "";

  if (primeiraResposta.toLowerCase().includes("café")) {
    return {
      pergunta: "Cooperativas agrícolas de café em qual estado?",
      opcoes: [
        "Minas Gerais",
        "São Paulo",
        "Espírito Santo",
        "Bahia",
        "Paraná",
        "Todos os estados",
        "Outro (especifique)",
      ],
    };
  }

  if (primeiraResposta.toLowerCase().includes("insumos")) {
    return {
      pergunta: "Distribuidoras de insumos em qual estado?",
      opcoes: [
        "São Paulo",
        "Paraná",
        "Rio Grande do Sul",
        "Mato Grosso",
        "Goiás",
        "Todos os estados",
        "Outro (especifique)",
      ],
    };
  }

  // Fallback genérico
  return {
    pergunta: "Em qual estado?",
    opcoes: [
      "São Paulo",
      "Minas Gerais",
      "Rio de Janeiro",
      "Paraná",
      "Rio Grande do Sul",
      "Todos os estados",
      "Outro (especifique)",
    ],
  };
}

export async function simularPerguntaNivel3(
  contextoInicial: string,
  respostasNivel1: string[],
  respostasNivel2: string[]
): Promise<PerguntaRefinamento> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  const primeiraResposta2 = respostasNivel2[0] || "";

  if (primeiraResposta2.toLowerCase().includes("minas gerais")) {
    return {
      pergunta: "Há alguma cidade ou região específica em Minas Gerais?",
      opcoes: [
        "Sul de Minas",
        "Cerrado Mineiro",
        "Matas de Minas",
        "Chapada de Minas",
        "Todas as regiões",
        "Cidade específica (especifique)",
      ],
    };
  }

  if (primeiraResposta2.toLowerCase().includes("são paulo")) {
    return {
      pergunta: "Há alguma cidade ou região específica em São Paulo?",
      opcoes: [
        "Capital",
        "Grande São Paulo",
        "Interior (Campinas/Ribeirão)",
        "Vale do Paraíba",
        "Litoral",
        "Todas as regiões",
        "Cidade específica (especifique)",
      ],
    };
  }

  // Fallback genérico
  return {
    pergunta: "Há alguma cidade ou região específica?",
    opcoes: [
      "Capital",
      "Região metropolitana",
      "Interior",
      "Todas as regiões",
      "Cidade específica (especifique)",
    ],
  };
}

/**
 * FLUXO 4: Pré-pesquisa com contexto refinado
 */
export async function simularPrePesquisaRefinada(
  contextoInicial: string,
  respostaNivel1: string,
  respostaNivel2: string,
  respostaNivel3: string
): Promise<EmpresaInfo[]> {
  // Simular delay de pesquisa
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Exemplo: Cooperativas de café no Sul de Minas
  if (
    respostaNivel1.toLowerCase().includes("café") &&
    respostaNivel2.toLowerCase().includes("minas gerais") &&
    respostaNivel3.toLowerCase().includes("sul de minas")
  ) {
    return [
      {
        nome: "Coopercitrus - Sul de Minas",
        cnpj: "12.345.678/0001-01",
        site: "https://www.coopercitrus.com.br",
        produto: "Café arábica",
        cidade: "Varginha",
        uf: "MG",
        telefone: "(35) 1234-5678",
        email: "contato@coopercitrus.com.br",
        segmentacao: "B2B",
        porte: "Grande",
      },
      {
        nome: "Cooxupé - Cooperativa Regional de Cafeicultores",
        cnpj: "23.456.789/0001-02",
        site: "https://www.cooxupe.com.br",
        produto: "Café arábica e robusta",
        cidade: "Guaxupé",
        uf: "MG",
        telefone: "(35) 2345-6789",
        email: "contato@cooxupe.com.br",
        segmentacao: "B2B",
        porte: "Grande",
      },
      {
        nome: "Minasul - Cooperativa dos Cafeicultores da Zona de Varginha",
        cnpj: "34.567.890/0001-03",
        site: "https://www.minasul.com.br",
        produto: "Café especial",
        cidade: "Varginha",
        uf: "MG",
        telefone: "(35) 3456-7890",
        email: "contato@minasul.com.br",
        segmentacao: "B2B",
        porte: "Médio",
      },
    ];
  }

  // Fallback: Retornar 1 resultado genérico
  return [
    {
      nome: `Empresa de ${respostaNivel1}`,
      cnpj: "00.000.000/0001-00",
      site: null,
      produto: respostaNivel1,
      cidade: respostaNivel3 || "Não especificado",
      uf: respostaNivel2.substring(0, 2).toUpperCase(),
      telefone: null,
      email: null,
      segmentacao: "B2B",
      porte: "Médio",
    },
  ];
}

/**
 * FLUXO 5: Pré-pesquisa com múltiplas combinações (produto cartesiano)
 */
export async function simularPrePesquisaRefinadaMultipla(
  contextoInicial: string,
  respostasNivel1: string[],
  respostasNivel2: string[],
  respostasNivel3: string[]
): Promise<EmpresaInfo[]> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  const resultados: EmpresaInfo[] = [];

  // Gerar produto cartesiano: N1 × N2 × N3
  for (const r1 of respostasNivel1) {
    for (const r2 of respostasNivel2) {
      for (const r3 of respostasNivel3) {
        // Gerar empresa fictícia para cada combinação
        const combinacao = `${r1} + ${r2} + ${r3}`;

        resultados.push({
          nome: `Cooperativa ${r1} - ${r3}`,
          cnpj: `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}/0001-${Math.floor(Math.random() * 90 + 10)}`,
          site: `https://www.coop-${r1.toLowerCase().replace(/\s+/g, "-")}.com.br`,
          produto: `${r1} - ${combinacao}`,
          cidade: r3,
          uf: r2.includes("Minas")
            ? "MG"
            : r2.includes("São Paulo")
              ? "SP"
              : r2.includes("Paraná")
                ? "PR"
                : "RS",
          telefone: `(${Math.floor(Math.random() * 90 + 10)}) ${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          email: `contato@coop-${r1.toLowerCase().replace(/\s+/g, "-")}.com.br`,
          segmentacao: "B2B",
          porte: Math.random() > 0.5 ? "Grande" : "Médio",
        });
      }
    }
  }

  return resultados;
}
