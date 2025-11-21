/**
 * Filtros para garantir que apenas empresas reais (pessoas jurídicas) sejam retornadas
 * Elimina sites de notícias, jornais, blogs e artigos
 */

/**
 * Lista de domínios bloqueados (sites de notícias, jornais, blogs)
 */
const BLOCKED_DOMAINS = [
  // Portais de notícias
  "globo.com",
  "uol.com.br",
  "folha.uol.com.br",
  "estadao.com.br",
  "g1.globo.com",
  "valor.globo.com",
  "exame.com",
  "infomoney.com.br",
  "istoedinheiro.com.br",
  "veja.abril.com.br",
  "cnnbrasil.com.br",
  "r7.com",
  "ig.com.br",
  "terra.com.br",
  "msn.com",
  "yahoo.com",

  // Portais automotivos (notícias)
  "motor1.uol.com.br",
  "autoesporte.globo.com",
  "quatrorodas.abril.com.br",
  "noticiasautomotivas.com.br",
  "autoo.com.br",
  "guiadoauto.com.br",
  "carrosnaweb.com.br",
  "carplace.com.br",
  "automotivebusiness.com.br",

  // Blogs e sites de conteúdo
  "medium.com",
  "wordpress.com",
  "blogspot.com",
  "wixsite.com",
  "weebly.com",

  // Sites de listagens/rankings (não são empresas)
  "econodata.com.br",
  "empresas.com.br",
  "listafabricantes.com.br",
  "guiaempresas.com.br",
  "cnpj.biz",
  "cnpja.com",

  // Outros
  "wikipedia.org",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com", // Não queremos perfis do LinkedIn, queremos sites corporativos
  "twitter.com",
  "tiktok.com",

  // Sites de seguros/comparação
  "minutoseguros.com.br",
  "comparador.com.br",
];

/**
 * Padrões de URL que indicam artigos/notícias (não empresas)
 */
const ARTICLE_URL_PATTERNS = [
  /\/blog\//i,
  /\/noticias?\//i,
  /\/artigos?\//i,
  /\/post\//i,
  /\/noticia\//i,
  /\/materia\//i,
  /\/reportagem\//i,
  /\/conteudo\//i,
  /\/news\//i,
  /\/article\//i,
  /\d{4}\/\d{2}\/\d{2}/, // Padrão de data em URL (ex: 2024/11/18)
  /\/maiores-empresas\//i,
  /\/ranking\//i,
  /\/top-\d+/i,
  /\/lista-/i,
  /\/conheca-as-/i,
  /\/quais-sao-/i,
  /\/confira-/i,
];

/**
 * Palavras-chave que indicam que é um artigo/notícia (não empresa)
 */
const ARTICLE_TITLE_KEYWORDS = [
  "maiores empresas",
  "principais empresas",
  "top 10",
  "top 20",
  "top",
  "ranking",
  "lista de",
  "lista",
  "conheça as",
  "conheça",
  "quais são",
  "confira",
  "saiba quais",
  "veja as",
  "veja",
  "descubra",
  "entenda",
  "como escolher",
  "guia completo",
  "guia",
  "tudo sobre",
  "melhores",
  "maiores",
  "principais",
  "fabricantes de",
  "distribuidores de",
  "fornecedores de",
  "empresas de",
  "indústria de",
  "setor de",
  "mercado de",
  "segmento de",
];

/**
 * Regex para detectar CNPJ em texto (formato XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX)
 */
const CNPJ_REGEX = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b|\b\d{14}\b/g;

/**
 * Verifica se uma URL pertence a um domínio bloqueado
 */
export function isBlockedDomain(url: string): boolean {
  if (!url) {
    return false;
  }

  const urlLower = url.toLowerCase();

  return BLOCKED_DOMAINS.some(domain => {
    return urlLower.includes(domain);
  });
}

/**
 * Verifica se uma URL tem padrão de artigo/notícia
 */
export function isArticleUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  return ARTICLE_URL_PATTERNS.some(pattern => {
    return pattern.test(url);
  });
}

/**
 * Verifica se o título parece ser de um artigo/notícia
 */
export function isArticleTitle(title: string): boolean {
  if (!title) {
    return false;
  }

  const titleLower = title.toLowerCase();

  // 1. Verificar palavras-chave
  const hasKeyword = ARTICLE_TITLE_KEYWORDS.some(keyword => {
    return titleLower.includes(keyword);
  });

  if (hasKeyword) {
    return true;
  }

  // 2. Verificar se inicia com número (ex: "50 Maiores", "23 Empresas")
  if (/^\d+\s/.test(title)) {
    return true;
  }

  // 3. Verificar pontuação excessiva (múltiplos : ou ?)
  const punctuationCount = (title.match(/[?:]/g) || []).length;
  if (punctuationCount > 1) {
    return true;
  }

  // 4. Verificar nome muito longo (provavelmente título de artigo)
  if (title.length > 80) {
    return true;
  }

  // 5. Verificar nomes genéricos
  const genericNames = ["lista", "ranking", "guia", "portal"];
  if (
    genericNames.some(
      generic => titleLower === generic || titleLower.startsWith(generic + " ")
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Extrai CNPJs de um texto
 */
export function extractCNPJs(text: string): string[] {
  if (!text) {
    return [];
  }

  const matches = text.match(CNPJ_REGEX);
  if (!matches) {
    return [];
  }

  // Remover formatação e retornar apenas dígitos
  return matches.map(cnpj => cnpj.replace(/\D/g, ""));
}

/**
 * Valida se um CNPJ tem formato válido (14 dígitos)
 */
export function isValidCNPJFormat(cnpj: string): boolean {
  if (!cnpj) {
    return false;
  }

  const cleaned = cnpj.replace(/\D/g, "");
  return cleaned.length === 14;
}

/**
 * Verifica se um resultado do SerpAPI é uma empresa real
 * Retorna true se for empresa, false se for artigo/notícia
 */
export function isRealCompany(result: {
  title: string;
  link: string;
  snippet?: string;
}): boolean {
  // 1. Verificar domínio bloqueado
  if (isBlockedDomain(result.link)) {
    console.log(`[Filter] Domínio bloqueado: ${result.link}`);
    return false;
  }

  // 2. Verificar padrão de URL de artigo
  if (isArticleUrl(result.link)) {
    console.log(`[Filter] URL de artigo detectada: ${result.link}`);
    return false;
  }

  // 3. Verificar título de artigo
  if (isArticleTitle(result.title)) {
    console.log(`[Filter] Título de artigo detectado: ${result.title}`);
    return false;
  }

  // 4. Se tiver CNPJ no snippet, provavelmente é empresa real
  if (result.snippet) {
    const cnpjs = extractCNPJs(result.snippet);
    if (cnpjs.length > 0) {
      console.log(
        `[Filter] CNPJ encontrado no snippet: ${cnpjs[0]} - Aprovado como empresa`
      );
      return true;
    }
  }

  // 5. Verificar se o domínio parece ser corporativo
  // Empresas reais geralmente têm domínios simples (ex: empresa.com.br)
  const domain = extractDomain(result.link);
  if (domain && isLikelyCorporateDomain(domain)) {
    console.log(`[Filter] Domínio corporativo detectado: ${domain} - Aprovado`);
    return true;
  }

  // Se passou por todos os filtros mas não tem CNPJ nem domínio corporativo claro,
  // rejeitar por segurança (provavelmente é artigo)
  console.log(
    `[Filter] Resultado rejeitado (sem CNPJ e sem domínio corporativo claro): ${result.title}`
  );
  return false;
}

/**
 * Extrai o domínio de uma URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Verifica se um domínio parece ser corporativo (não é notícia/blog)
 */
function isLikelyCorporateDomain(domain: string): boolean {
  // Domínios corporativos geralmente:
  // - Não têm subdomínios de notícias (blog., noticias., www. é ok)
  // - Têm extensões .com.br, .com, .ind.br, .net.br
  // - Não têm palavras-chave de conteúdo

  const domainLower = domain.toLowerCase();

  // Rejeitar subdomínios de conteúdo
  const contentSubdomains = [
    "blog",
    "noticias",
    "news",
    "artigos",
    "portal",
    "revista",
  ];
  if (contentSubdomains.some(sub => domainLower.startsWith(sub + "."))) {
    return false;
  }

  // Aceitar domínios com extensões corporativas
  const corporateExtensions = [
    ".com.br",
    ".ind.br",
    ".net.br",
    ".com",
    ".net",
    ".org",
  ];
  const hasCorporateExtension = corporateExtensions.some(ext =>
    domainLower.endsWith(ext)
  );

  // Rejeitar domínios com palavras-chave de conteúdo
  const contentKeywords = [
    "noticias",
    "news",
    "blog",
    "portal",
    "revista",
    "jornal",
    "guia",
    "lista",
  ];
  const hasContentKeyword = contentKeywords.some(keyword =>
    domainLower.includes(keyword)
  );

  return hasCorporateExtension && !hasContentKeyword;
}

/**
 * Filtra uma lista de resultados do SerpAPI, removendo artigos/notícias
 */
export function filterRealCompanies<
  T extends { title: string; link: string; snippet?: string },
>(results: T[]): T[] {
  console.log(`[Filter] Filtrando ${results.length} resultados...`);

  const filtered = results.filter(result => isRealCompany(result));

  console.log(
    `[Filter] ${filtered.length} empresas reais encontradas (${results.length - filtered.length} artigos removidos)`
  );

  return filtered;
}

/**
 * Gera queries otimizadas para buscar empresas (não artigos)
 * Adiciona operadores de busca do Google para filtrar resultados
 */
export function generateCompanySearchQueries(baseQuery: string): string[] {
  // Operadores do Google Search:
  // - "palavra" = busca exata
  // - site:dominio.com = busca em domínio específico
  // - -palavra = exclui palavra
  // - intitle: = palavra no título

  return [
    // Query 1: Busca exata com CNPJ
    `"${baseQuery}" CNPJ site:.com.br`,

    // Query 2: Busca em sites corporativos (.ind.br = indústria)
    `${baseQuery} site:.ind.br OR site:.com.br -noticia -blog -ranking`,

    // Query 3: Busca com exclusão de palavras-chave de artigos
    `${baseQuery} -"maiores empresas" -"principais empresas" -ranking -lista -top`,

    // Query 4: Busca focada em sites corporativos
    `${baseQuery} empresa CNPJ -blog -noticia -artigo`,
  ];
}
