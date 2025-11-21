/**
 * Documentação dos Tipos Principais do Schema
 *
 * Este arquivo fornece documentação detalhada sobre os tipos principais
 * do sistema de pesquisa de mercado PAV.
 *
 * @module drizzle/schema
 */

import type {
  User,
  InsertUser,
  Project,
  InsertProject,
  Pesquisa,
  InsertPesquisa,
  Cliente,
  InsertCliente,
  Concorrente,
  InsertConcorrente,
  Lead,
  InsertLead,
} from "./schema";

// ===== USUÁRIOS =====

/**
 * Representa um usuário do sistema
 *
 * @property id - Identificador único do usuário (UUID)
 * @property name - Nome completo do usuário
 * @property email - Endereço de email para contato
 * @property loginMethod - Método de autenticação utilizado
 * @property role - Papel do usuário no sistema ('user' ou 'admin')
 * @property createdAt - Data e hora de criação da conta
 * @property lastSignedIn - Data e hora do último login realizado
 *
 * @example
 * ```ts
 * const user: User = {
 *   id: 'uuid-123',
 *   name: 'João Silva',
 *   email: 'joao@example.com',
 *   role: 'user',
 *   createdAt: '2025-01-01 10:00:00',
 *   lastSignedIn: '2025-11-21 15:30:00'
 * };
 * ```
 */
export type UserDoc = User;

/**
 * Dados para inserção de novo usuário
 *
 * Campos opcionais: name, email, loginMethod, lastSignedIn
 * Campo obrigatório: id
 */
export type InsertUserDoc = InsertUser;

// ===== PROJETOS =====

/**
 * Representa um projeto de pesquisa de mercado
 *
 * Um projeto é o container principal que agrupa múltiplas pesquisas
 * relacionadas a um mesmo objetivo de negócio.
 *
 * @property id - Identificador único do projeto (auto-incremento)
 * @property name - Nome descritivo do projeto
 * @property description - Descrição detalhada dos objetivos
 * @property status - Status atual ('active' ou 'hibernated')
 * @property createdAt - Data de criação do projeto
 * @property lastActivityAt - Última atividade registrada (usado para hibernação automática)
 *
 * @example
 * ```ts
 * const project: Project = {
 *   id: 1,
 *   name: 'Expansão Regional Sul',
 *   description: 'Pesquisa de mercado para expansão na região Sul',
 *   status: 'active',
 *   createdAt: '2025-01-01 10:00:00',
 *   lastActivityAt: '2025-11-21 15:30:00'
 * };
 * ```
 */
export type ProjectDoc = Project;

/**
 * Dados para criação de novo projeto
 *
 * Campos obrigatórios: name
 * Campos opcionais: description, status
 */
export type InsertProjectDoc = InsertProject;

// ===== PESQUISAS =====

/**
 * Representa uma pesquisa de mercado dentro de um projeto
 *
 * Cada pesquisa foca em um termo ou conceito específico e gera
 * mercados, clientes, concorrentes e leads relacionados.
 *
 * @property id - Identificador único da pesquisa (auto-incremento)
 * @property projectId - ID do projeto pai
 * @property nome - Nome/termo da pesquisa
 * @property status - Status de execução ('pendente', 'em_andamento', 'concluida', 'erro')
 * @property enrichmentStatus - Status do enriquecimento de dados
 * @property createdAt - Data de criação
 * @property updatedAt - Data da última atualização
 *
 * @example
 * ```ts
 * const pesquisa: Pesquisa = {
 *   id: 1,
 *   projectId: 1,
 *   nome: 'Aterro Sanitário',
 *   status: 'concluida',
 *   enrichmentStatus: 'completed',
 *   createdAt: '2025-11-21 10:00:00',
 *   updatedAt: '2025-11-21 15:30:00'
 * };
 * ```
 */
export type PesquisaDoc = Pesquisa;

/**
 * Dados para criação de nova pesquisa
 *
 * Campos obrigatórios: projectId, nome
 * Campos opcionais: status, enrichmentStatus
 */
export type InsertPesquisaDoc = InsertPesquisa;

// ===== MERCADOS =====

// Mercado - Tipo documentado no schema principal

// ===== CLIENTES =====

/**
 * Representa um cliente identificado na pesquisa
 *
 * Clientes são empresas que já utilizam produtos/serviços
 * relacionados ao termo pesquisado.
 *
 * @property id - Identificador único do cliente (auto-incremento)
 * @property projectId - ID do projeto
 * @property pesquisaId - ID da pesquisa
 * @property razaoSocial - Razão social da empresa
 * @property cnpj - CNPJ (quando disponível)
 * @property qualityScore - Pontuação de qualidade dos dados (0-100)
 * @property validationStatus - Status de validação ('pendente', 'validado', 'descartado')
 * @property createdAt - Data de identificação
 *
 * @example
 * ```ts
 * const cliente: Cliente = {
 *   id: 1,
 *   projectId: 1,
 *   pesquisaId: 1,
 *   razaoSocial: 'Empresa XYZ Ltda',
 *   cnpj: '12.345.678/0001-90',
 *   qualityScore: 90,
 *   validationStatus: 'validado',
 *   createdAt: '2025-11-21 10:00:00'
 * };
 * ```
 */
export type ClienteDoc = Cliente;

/**
 * Dados para criação de novo cliente
 *
 * Campos obrigatórios: projectId, pesquisaId, razaoSocial
 * Campos opcionais: cnpj, qualityScore, validationStatus
 */
export type InsertClienteDoc = InsertCliente;

// ===== CONCORRENTES =====

/**
 * Representa um concorrente identificado na pesquisa
 *
 * Concorrentes são empresas que oferecem produtos/serviços
 * similares aos do cliente.
 *
 * @property id - Identificador único do concorrente (auto-incremento)
 * @property projectId - ID do projeto
 * @property pesquisaId - ID da pesquisa
 * @property razaoSocial - Razão social da empresa
 * @property cnpj - CNPJ (quando disponível)
 * @property qualityScore - Pontuação de qualidade dos dados (0-100)
 * @property createdAt - Data de identificação
 *
 * @example
 * ```ts
 * const concorrente: Concorrente = {
 *   id: 1,
 *   projectId: 1,
 *   pesquisaId: 1,
 *   razaoSocial: 'Concorrente ABC S.A.',
 *   cnpj: '98.765.432/0001-10',
 *   qualityScore: 85,
 *   createdAt: '2025-11-21 10:00:00'
 * };
 * ```
 */
export type ConcorrenteDoc = Concorrente;

/**
 * Dados para criação de novo concorrente
 *
 * Campos obrigatórios: projectId, pesquisaId, razaoSocial
 * Campos opcionais: cnpj, qualityScore
 */
export type InsertConcorrenteDoc = InsertConcorrente;

// ===== LEADS =====

/**
 * Representa um lead gerado durante a pesquisa
 *
 * Leads são potenciais clientes identificados através da
 * análise de mercado e enriquecimento de dados.
 *
 * @property id - Identificador único do lead (auto-incremento)
 * @property projectId - ID do projeto
 * @property pesquisaId - ID da pesquisa
 * @property razaoSocial - Razão social da empresa
 * @property cnpj - CNPJ (quando disponível)
 * @property qualityScore - Pontuação de qualidade (0-100)
 * @property validationStatus - Status de validação ('pendente', 'validado', 'descartado')
 * @property enrichmentStatus - Status do enriquecimento ('pending', 'in_progress', 'completed', 'failed')
 * @property createdAt - Data de geração
 *
 * @example
 * ```ts
 * const lead: Lead = {
 *   id: 1,
 *   projectId: 1,
 *   pesquisaId: 1,
 *   razaoSocial: 'Lead Potencial Ltda',
 *   cnpj: '11.222.333/0001-44',
 *   qualityScore: 95,
 *   validationStatus: 'pendente',
 *   enrichmentStatus: 'completed',
 *   createdAt: '2025-11-21 10:00:00'
 * };
 * ```
 */
export type LeadDoc = Lead;

/**
 * Dados para criação de novo lead
 *
 * Campos obrigatórios: projectId, pesquisaId, razaoSocial
 * Campos opcionais: cnpj, qualityScore, validationStatus, enrichmentStatus
 */
export type InsertLeadDoc = InsertLead;

// ===== API HEALTH LOG =====

// ApiHealthLog - Tipo documentado no schema principal

// ===== GUIA DE USO =====

/**
 * Guia Rápido de Uso dos Tipos
 *
 * ## Convenções de Nomenclatura
 *
 * - `Type` - Tipo completo retornado do banco de dados
 * - `InsertType` - Tipo para inserção (campos opcionais/defaults)
 *
 * ## Padrões de Quality Score
 *
 * - 0-30: Baixa qualidade (dados incompletos)
 * - 31-60: Qualidade média (dados parciais)
 * - 61-85: Boa qualidade (dados completos)
 * - 86-100: Excelente qualidade (dados completos + validados)
 *
 * ## Status de Validação
 *
 * - `pendente`: Aguardando validação manual
 * - `validado`: Aprovado para uso
 * - `descartado`: Rejeitado (baixa qualidade ou irrelevante)
 *
 * ## Status de Enriquecimento
 *
 * - `pending`: Aguardando enriquecimento
 * - `in_progress`: Enriquecimento em andamento
 * - `completed`: Enriquecimento concluído com sucesso
 * - `failed`: Falha no enriquecimento
 *
 * ## Hierarquia de Dados
 *
 * ```
 * Projeto (Project)
 *   └── Pesquisa (Pesquisa)
 *         ├── Mercados (Mercado)
 *         ├── Clientes (Cliente)
 *         ├── Concorrentes (Concorrente)
 *         └── Leads (Lead)
 * ```
 */
export const SCHEMA_GUIDE = {
  qualityScoreRanges: {
    low: { min: 0, max: 30, label: "Baixa" },
    medium: { min: 31, max: 60, label: "Média" },
    good: { min: 61, max: 85, label: "Boa" },
    excellent: { min: 86, max: 100, label: "Excelente" },
  },
  validationStatuses: ["pendente", "validado", "descartado"] as const,
  enrichmentStatuses: [
    "pending",
    "in_progress",
    "completed",
    "failed",
  ] as const,
  projectStatuses: ["active", "hibernated"] as const,
  pesquisaStatuses: ["pendente", "em_andamento", "concluida", "erro"] as const,
};
