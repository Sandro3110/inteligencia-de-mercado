/**
 * Tipos TypeScript para Sistema de Enriquecimento V2
 */

export interface ClienteInput {
  nome: string;
  cnpj?: string | null;
  produtoPrincipal?: string | null;
  siteOficial?: string | null;
  cidade?: string | null;
  uf?: string | null;
  segmentacaoB2BB2C?: string | null;
}

export interface ClienteEnriquecido {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  setor: string;
  descricao: string;
  latitude?: number;
  longitude?: number;
}

export interface Mercado {
  nome: string;
  categoria: string;
  segmentacao: string;
  tamanhoMercado: string;
}

export interface MercadoEnriquecido extends Mercado {
  crescimentoAnual: string;
  tendencias: string[];
  principaisPlayers: string[];
}

export interface Produto {
  nome: string;
  descricao: string;
  publicoAlvo: string;
  diferenciais: string[];
}

export interface Concorrente {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoPrincipal: string;
}

export interface Lead {
  nome: string;
  cnpj: string | null;
  site: string | null;
  cidade: string;
  uf: string;
  produtoInteresse: string;
  fonte: 'PLAYER_DO_MERCADO' | 'PESQUISA_ADICIONAL';
}

export interface EnriquecimentoCompleto {
  cliente: ClienteEnriquecido;
  mercado: MercadoEnriquecido;
  produtos: Produto[];
  concorrentes: Concorrente[];
  leads: Lead[];
}
