/**
 * Types for Research Wizard
 */

export interface ResearchWizardData {
  projectId?: string;
  projectName?: string;
  researchName?: string;
  researchDescription?: string;
  qtdConcorrentes?: number;
  qtdLeads?: number;
  qtdProdutos?: number;
  mercados: Market[];
  clientes?: Client[];
  inputMethod?: string;
  validatedData?: {
    mercados?: Market[];
    clientes?: Client[];
  };
}

export interface Market {
  id?: number;
  nome: string;
  segmentacao?: string;
}

export interface Client {
  id?: number;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  site?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  porte?: string;
}

export interface EntityResult {
  nome: string;
  descricao?: string;
  categoria?: string;
  segmentacao?: string;
  razaoSocial?: string;
  cnpj?: string;
  site?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  porte?: string;
  selected?: boolean;
}
