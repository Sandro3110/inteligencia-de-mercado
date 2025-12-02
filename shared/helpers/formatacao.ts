/**
 * Helpers de Formatação
 * 100% Funcional
 */

// ============================================================================
// MOEDA
// ============================================================================

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

export function formatarMoedaCompacta(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  if (valor >= 1_000_000_000) {
    return `R$ ${(valor / 1_000_000_000).toFixed(1)}B`;
  } else if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(1)}M`;
  } else if (valor >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(1)}K`;
  }
  
  return formatarMoeda(valor);
}

// ============================================================================
// NÚMERO
// ============================================================================

export function formatarNumero(valor: number | null | undefined, casasDecimais: number = 0): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(valor);
}

export function formatarNumeroCompacto(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  if (valor >= 1_000_000_000) {
    return `${(valor / 1_000_000_000).toFixed(1)}B`;
  } else if (valor >= 1_000_000) {
    return `${(valor / 1_000_000).toFixed(1)}M`;
  } else if (valor >= 1_000) {
    return `${(valor / 1_000).toFixed(1)}K`;
  }
  
  return formatarNumero(valor);
}

// ============================================================================
// PERCENTUAL
// ============================================================================

export function formatarPercentual(valor: number | null | undefined, casasDecimais: number = 1): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  return `${valor.toFixed(casasDecimais)}%`;
}

export function formatarPercentualVariacao(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'N/A';
  
  const sinal = valor > 0 ? '+' : '';
  return `${sinal}${valor.toFixed(1)}%`;
}

// ============================================================================
// DATA
// ============================================================================

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return 'N/A';
  
  const d = typeof data === 'string' ? new Date(data) : data;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

export function formatarDataHora(data: Date | string | null | undefined): string {
  if (!data) return 'N/A';
  
  const d = typeof data === 'string' ? new Date(data) : data;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
}

export function formatarDataRelativa(data: Date | string | null | undefined): string {
  if (!data) return 'N/A';
  
  const d = typeof data === 'string' ? new Date(data) : data;
  const agora = new Date();
  const diff = agora.getTime() - d.getTime();
  
  const segundos = Math.floor(diff / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
  const anos = Math.floor(dias / 365);
  
  if (anos > 0) return `há ${anos} ano${anos > 1 ? 's' : ''}`;
  if (meses > 0) return `há ${meses} ${meses > 1 ? 'meses' : 'mês'}`;
  if (dias > 0) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'agora mesmo';
}

// ============================================================================
// CNPJ/CPF
// ============================================================================

export function formatarCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return 'N/A';
  
  const limpo = cnpj.replace(/\D/g, '');
  
  if (limpo.length !== 14) return cnpj;
  
  return limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatarCPF(cpf: string | null | undefined): string {
  if (!cpf) return 'N/A';
  
  const limpo = cpf.replace(/\D/g, '');
  
  if (limpo.length !== 11) return cpf;
  
  return limpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

// ============================================================================
// TELEFONE
// ============================================================================

export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return 'N/A';
  
  const limpo = telefone.replace(/\D/g, '');
  
  if (limpo.length === 11) {
    return limpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (limpo.length === 10) {
    return limpo.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  return telefone;
}

// ============================================================================
// SCORE
// ============================================================================

export function formatarScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  
  return `${score}/100`;
}

export function getCorScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'gray';
  
  if (score >= 90) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 50) return 'yellow';
  return 'red';
}

export function getEmojiScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '⚪';
  
  if (score >= 90) return '🟢';
  if (score >= 70) return '🔵';
  if (score >= 50) return '🟡';
  return '🔴';
}

// ============================================================================
// SEGMENTO
// ============================================================================

export function getCorSegmento(segmento: string | null | undefined): string {
  if (!segmento) return 'gray';
  
  switch (segmento.toUpperCase()) {
    case 'A':
      return 'green';
    case 'B':
      return 'yellow';
    case 'C':
      return 'red';
    default:
      return 'gray';
  }
}

export function getEmojiSegmento(segmento: string | null | undefined): string {
  if (!segmento) return '⚪';
  
  switch (segmento.toUpperCase()) {
    case 'A':
      return '🟢';
    case 'B':
      return '🟡';
    case 'C':
      return '🔴';
    default:
      return '⚪';
  }
}

// ============================================================================
// TEMPO
// ============================================================================

export function formatarDuracao(segundos: number | null | undefined): string {
  if (segundos === null || segundos === undefined) return 'N/A';
  
  if (segundos < 60) {
    return `${segundos.toFixed(1)}s`;
  } else if (segundos < 3600) {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos}min ${seg.toFixed(0)}s`;
  } else {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}min`;
  }
}

export function formatarDias(dias: number | null | undefined): string {
  if (dias === null || dias === undefined) return 'N/A';
  
  return `${dias} dia${dias !== 1 ? 's' : ''}`;
}

// ============================================================================
// TAMANHO DE ARQUIVO
// ============================================================================

export function formatarTamanhoArquivo(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return 'N/A';
  
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

// ============================================================================
// TRUNCAR TEXTO
// ============================================================================

export function truncarTexto(texto: string | null | undefined, maxLength: number = 50): string {
  if (!texto) return 'N/A';
  
  if (texto.length <= maxLength) return texto;
  
  return `${texto.substring(0, maxLength)}...`;
}

// ============================================================================
// CAPITALIZAR
// ============================================================================

export function capitalizar(texto: string | null | undefined): string {
  if (!texto) return 'N/A';
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

// ============================================================================
// PLURALIZAR
// ============================================================================

export function pluralizar(quantidade: number, singular: string, plural: string): string {
  return quantidade === 1 ? singular : plural;
}
