// Módulo de validação de dados

// Validar CNPJ (dígitos verificadores)
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  
  // Remover formatação
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validar primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) return false;
  
  // Validar segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(1)) return false;
  
  return true;
}

// Normalizar CNPJ para formato padrão
export function normalizarCNPJ(cnpj) {
  if (!cnpj) return null;
  
  const digitos = cnpj.replace(/\D/g, '');
  
  if (digitos.length !== 14) return null;
  
  // Formato: XX.XXX.XXX/XXXX-XX
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

// Normalizar telefone
export function normalizarTelefone(telefone) {
  if (!telefone) return null;
  
  // Remover tudo exceto dígitos
  const digitos = telefone.replace(/\D/g, '');
  
  // Validar quantidade de dígitos
  if (digitos.length < 10 || digitos.length > 11) {
    return null;
  }
  
  // Formatar
  if (digitos.length === 10) {
    // (XX) XXXX-XXXX
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  } else {
    // (XX) XXXXX-XXXX
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
}

// Validar email
export function validarEmail(email) {
  if (!email) return false;
  
  // Regex básico
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;
  
  // Validar domínios inválidos
  const dominiosInvalidos = ['example.com', 'test.com', 'email.com', 'teste.com'];
  const dominio = email.split('@')[1]?.toLowerCase();
  if (dominiosInvalidos.includes(dominio)) return false;
  
  return true;
}

// Normalizar email
export function normalizarEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

// Calcular score de qualidade (0-100)
export function calcularScoreQualidade(entidade) {
  let score = 0;
  
  const pesos = {
    nome: 10,
    cnpj: 15,
    email: 10,
    telefone: 10,
    site: 10,
    cidade: 5,
    uf: 5,
    porte: 5,
    setor: 10,
    produto_principal: 10,
    segmentacao_b2b_b2c: 5,
    enriquecido: 5
  };
  
  // Verificar cada campo
  if (entidade.nome) score += pesos.nome;
  if (entidade.cnpj && validarCNPJ(entidade.cnpj)) score += pesos.cnpj;
  if (entidade.email && validarEmail(entidade.email)) score += pesos.email;
  if (entidade.telefone && normalizarTelefone(entidade.telefone)) score += pesos.telefone;
  if (entidade.site && (entidade.site.startsWith('http://') || entidade.site.startsWith('https://'))) score += pesos.site;
  if (entidade.cidade) score += pesos.cidade;
  if (entidade.uf) score += pesos.uf;
  if (entidade.porte) score += pesos.porte;
  if (entidade.setor) score += pesos.setor;
  if (entidade.produto_principal) score += pesos.produto_principal;
  if (entidade.segmentacao_b2b_b2c) score += pesos.segmentacao_b2b_b2c;
  if (entidade.enriquecido_em) score += pesos.enriquecido;
  
  return score;
}

// Identificar campos faltantes
export function identificarCamposFaltantes(entidade) {
  const camposObrigatorios = [
    'nome', 'cnpj', 'email', 'telefone', 'site',
    'cidade', 'uf', 'porte', 'setor', 'produto_principal'
  ];
  
  const faltantes = [];
  
  for (const campo of camposObrigatorios) {
    if (!entidade[campo]) {
      faltantes.push(campo);
    }
  }
  
  return faltantes.join(', ');
}

// Validar e normalizar entidade completa
export function validarENormalizarEntidade(entidade) {
  const resultado = {
    valido: true,
    erros: [],
    dados: { ...entidade },
    validacoes: {
      cnpj: false,
      email: false,
      telefone: false
    }
  };
  
  // CNPJ
  if (entidade.cnpj) {
    const cnpjNormalizado = normalizarCNPJ(entidade.cnpj);
    if (cnpjNormalizado && validarCNPJ(cnpjNormalizado)) {
      resultado.dados.cnpj = cnpjNormalizado;
      resultado.validacoes.cnpj = true;
    } else {
      resultado.erros.push('CNPJ inválido');
      resultado.valido = false;
    }
  }
  
  // Email
  if (entidade.email) {
    const emailNormalizado = normalizarEmail(entidade.email);
    if (validarEmail(emailNormalizado)) {
      resultado.dados.email = emailNormalizado;
      resultado.validacoes.email = true;
    } else {
      resultado.erros.push('Email inválido');
    }
  }
  
  // Telefone
  if (entidade.telefone) {
    const telefoneNormalizado = normalizarTelefone(entidade.telefone);
    if (telefoneNormalizado) {
      resultado.dados.telefone = telefoneNormalizado;
      resultado.validacoes.telefone = true;
    } else {
      resultado.erros.push('Telefone inválido');
    }
  }
  
  // Score de qualidade
  resultado.dados.score_qualidade_dados = calcularScoreQualidade(resultado.dados);
  resultado.dados.campos_faltantes = identificarCamposFaltantes(resultado.dados);
  
  return resultado;
}

// Calcular similaridade entre strings (0-1)
export function calcularSimilaridade(str1, str2) {
  if (!str1 || !str2) return 0;
  
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();
  
  if (str1 === str2) return 1;
  
  // Levenshtein distance simplificado
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1;
  
  let matches = 0;
  const minLen = Math.min(len1, len2);
  
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / maxLen;
}
