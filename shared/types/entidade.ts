
/**
 * Interface canônica de Entidade
 * Gerada automaticamente do schema dim_entidade
 * 
 * IMPORTANTE: Use esta interface em TODOS os componentes
 * para garantir consistência de tipos.
 */
export interface Entidade {
  // Identificação
  id: number;
  entidade_hash: string;
  tipo_entidade: string;
  tipo: string; // Alias para tipo_entidade
  
  // Dados Cadastrais
  nome: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  site: string | null;
  website: string | null; // Alias para site
  
  // Endereço
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  estado: string | null; // Alias para uf
  cep: string | null;
  pais: string | null;
  
  // Dados Empresariais
  setor: string | null;
  porte: string | null;
  faturamento: string | null;
  num_filiais: number | null;
  num_lojas: number | null;
  num_funcionarios: number | null;
  numero_funcionarios: number | null; // Alias
  
  // Descrição
  descricao: string | null;
  observacoes: string | null;
  
  // Qualidade de Dados
  score_qualidade: number | null;
  score_qualidade_dados: number | null;
  validacao_cnpj: boolean | null;
  validacao_email: boolean | null;
  validacao_telefone: boolean | null;
  
  // Enriquecimento IA
  enriquecido: boolean | null;
  enriquecido_em: string | null;
  enriquecido_por: string | null;
  
  // Origem
  importacao_id: number | null;
  origem_tipo: string;
  origem_arquivo: string | null;
  origem_processo: string | null;
  origem_prompt: string | null;
  origem_confianca: number | null;
  origem_data: string;
  origem_usuario_id: number | null;
  
  // Auditoria
  created_at: string;
  created_by: number | null;
  updated_at: string;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Interface mínima para EditEntidadeDialog
 * Contém apenas campos editáveis
 */
export interface EntidadeEditavel {
  id: number;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  website: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  setor: string | null;
  porte: string | null;
}
