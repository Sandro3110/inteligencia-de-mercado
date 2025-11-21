/**
 * Quick Win 3: Sistema de Score de Qualidade
 * Calcula score de 0-100 baseado na completude dos dados
 */

interface QualityEntity {
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
  siteOficial?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  produto?: string | null;
  produtoPrincipal?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cnae?: string | null;
  porte?: string | null;
  faturamentoEstimado?: string | null;
}

// Pesos para cada campo (total deve somar 100)
const FIELD_WEIGHTS = {
  cnpj: 20,
  email: 15,
  telefone: 10,
  site: 15,
  linkedin: 10,
  instagram: 5,
  produto: 15,
  cidade: 3,
  uf: 2,
  cnae: 3,
  porte: 2,
} as const;

/**
 * Calcula o score de qualidade de uma entidade (0-100)
 */
export function calculateQualityScore(entity: QualityEntity): number {
  if (!entity) return 0;

  let score = 0;

  // CNPJ
  if (entity.cnpj && entity.cnpj.trim() !== '') {
    score += FIELD_WEIGHTS.cnpj;
  }

  // Email
  if (entity.email && entity.email.trim() !== '') {
    score += FIELD_WEIGHTS.email;
  }

  // Telefone
  if (entity.telefone && entity.telefone.trim() !== '') {
    score += FIELD_WEIGHTS.telefone;
  }

  // Site (pode ser 'site' ou 'siteOficial')
  const siteValue = entity.site || entity.siteOficial;
  if (siteValue && siteValue.trim() !== '') {
    score += FIELD_WEIGHTS.site;
  }

  // LinkedIn
  if (entity.linkedin && entity.linkedin.trim() !== '') {
    score += FIELD_WEIGHTS.linkedin;
  }

  // Instagram
  if (entity.instagram && entity.instagram.trim() !== '') {
    score += FIELD_WEIGHTS.instagram;
  }

  // Produto (pode ser 'produto' ou 'produtoPrincipal')
  const produtoValue = entity.produto || entity.produtoPrincipal;
  if (produtoValue && produtoValue.trim() !== '') {
    score += FIELD_WEIGHTS.produto;
  }

  // Cidade
  if (entity.cidade && entity.cidade.trim() !== '') {
    score += FIELD_WEIGHTS.cidade;
  }

  // UF
  if (entity.uf && entity.uf.trim() !== '') {
    score += FIELD_WEIGHTS.uf;
  }

  // CNAE
  if (entity.cnae && entity.cnae.trim() !== '') {
    score += FIELD_WEIGHTS.cnae;
  }

  // Porte
  if (entity.porte && entity.porte.trim() !== '') {
    score += FIELD_WEIGHTS.porte;
  }

  return Math.round(score);
}

/**
 * Classifica a qualidade baseada no score
 */
export function classifyQuality(score: number): {
  label: string;
  color: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (score >= 80) {
    return {
      label: 'Excelente',
      color: 'text-green-500',
      variant: 'default',
    };
  }
  if (score >= 60) {
    return {
      label: 'Bom',
      color: 'text-blue-500',
      variant: 'secondary',
    };
  }
  if (score >= 40) {
    return {
      label: 'Regular',
      color: 'text-yellow-500',
      variant: 'outline',
    };
  }
  return {
    label: 'Ruim',
    color: 'text-red-500',
    variant: 'destructive',
  };
}

/**
 * Retorna os campos faltantes para melhorar o score
 */
export function getMissingFields(entity: QualityEntity): string[] {
  const missing: string[] = [];

  if (!entity.cnpj || entity.cnpj.trim() === '') missing.push('CNPJ');
  if (!entity.email || entity.email.trim() === '') missing.push('Email');
  if (!entity.telefone || entity.telefone.trim() === '') missing.push('Telefone');
  
  const siteValue = entity.site || entity.siteOficial;
  if (!siteValue || siteValue.trim() === '') missing.push('Site');
  
  if (!entity.linkedin || entity.linkedin.trim() === '') missing.push('LinkedIn');
  
  const produtoValue = entity.produto || entity.produtoPrincipal;
  if (!produtoValue || produtoValue.trim() === '') missing.push('Produto');
  
  if (!entity.cidade || entity.cidade.trim() === '') missing.push('Cidade');
  if (!entity.uf || entity.uf.trim() === '') missing.push('UF');

  return missing;
}

/**
 * Valida formato de CNPJ (apenas formato, não valida dígitos verificadores)
 */
export function isValidCNPJFormat(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // CNPJ deve ter 14 dígitos
  return cleaned.length === 14;
}

/**
 * Valida formato de email
 */
export function isValidEmailFormat(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de telefone brasileiro
 */
export function isValidPhoneFormat(phone: string | null | undefined): boolean {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Telefone brasileiro: 10 ou 11 dígitos (com DDD)
  return cleaned.length >= 10 && cleaned.length <= 11;
}
