/**
 * Tipos compartilhados do Research Wizard
 */

export interface ResearchWizardData {
  // Step 1
  projectId: number | null;
  projectName: string;

  // Step 2
  researchName: string;
  researchDescription: string;

  // Step 3
  qtdConcorrentes: number;
  qtdLeads: number;
  qtdProdutos: number;

  // Step 4
  inputMethod: "manual" | "spreadsheet" | "pre-research";

  // Step 5
  mercados: any[];
  clientes: any[];

  // Step 6
  validatedData: {
    mercados: any[];
    clientes: any[];
  };
}
