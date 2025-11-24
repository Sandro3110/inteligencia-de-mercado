/**
 * AllSteps - Re-export de todos os steps do Wizard de Pesquisa
 * 
 * Este arquivo serve como ponto de entrada único para todos os steps.
 * Cada step foi refatorado em arquivo separado para melhor manutenibilidade.
 * 
 * Estrutura:
 * - Step1: Seleção de Projeto (CRUD completo)
 * - Step2: Nomear Pesquisa
 * - Step3: Configurar Parâmetros
 * - Step4: Escolher Método de Entrada
 * - Step5: Inserir Dados
 * - Step6: Validar Dados
 * - Step7: Resumo
 */

export { Step1SelectProject } from './steps/Step1SelectProject';
export { Step2NameResearch } from './steps/Step2NameResearch';
export { Step3ConfigureParams } from './steps/Step3ConfigureParams';
export { Step4ChooseMethod } from './steps/Step4ChooseMethod';
export { Step5InsertData } from './steps/Step5InsertData';
export { Step6ValidateData } from './steps/Step6ValidateData';
export { Step7Summary } from './steps/Step7Summary';
