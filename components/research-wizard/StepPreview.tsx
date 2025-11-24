'use client';

/**
 * Componente de Preview/Resumo para cada Step do Wizard
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info } from "lucide-react";
import type { ResearchWizardData } from "@/types/research-wizard";

interface StepPreviewProps {
  step: number;
  data: ResearchWizardData;
}

export function StepPreview({ step, data }: StepPreviewProps) {
  const renderPreview = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Projeto Selecionado:</span>
            </div>
            <div className="ml-6 text-sm">
              <p className="font-semibold">
                {data.projectName || "Não selecionado"}
              </p>
              {data.projectId && (
                <p className="text-muted-foreground">ID: {data.projectId}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Informações da Pesquisa:</span>
            </div>
            <div className="ml-6 text-sm space-y-1">
              <p>
                <strong>Nome:</strong> {data.researchName || "Não definido"}
              </p>
              {data.researchDescription && (
                <p>
                  <strong>Descrição:</strong> {data.researchDescription}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Parâmetros Configurados:</span>
            </div>
            <div className="ml-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Concorrentes/Mercado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.qtdConcorrentes}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Leads/Mercado</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.qtdLeads}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Produtos/Cliente</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.qtdProdutos}
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Método de Entrada:</span>
            </div>
            <div className="ml-6">
              <Badge
                variant={
                  data.inputMethod === "manual"
                    ? "default"
                    : data.inputMethod === "spreadsheet"
                      ? "secondary"
                      : "outline"
                }
              >
                {data.inputMethod === "manual" && "Entrada Manual"}
                {data.inputMethod === "spreadsheet" && "Importação de Planilha"}
                {data.inputMethod === "pre-research" &&
                  "Pré-Pesquisa Automática"}
              </Badge>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Dados Inseridos:</span>
            </div>
            <div className="ml-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Mercados</p>
                <p className="text-xl font-bold">{data.mercados.length}</p>
                {data.mercados.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {data.mercados.slice(0, 3).map((m: any, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {m.nome}
                      </li>
                    ))}
                    {data.mercados.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        ... e mais {data.mercados.length - 3}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Clientes</p>
                <p className="text-xl font-bold">{data.clientes.length}</p>
                {data.clientes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {data.clientes.slice(0, 3).map((c: any, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {c.nome}
                      </li>
                    ))}
                    {data.clientes.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        ... e mais {data.clientes.length - 3}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium">Dados Validados:</span>
            </div>
            <div className="ml-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Mercados Aprovados</p>
                <p className="text-xl font-bold text-green-600">
                  {data.validatedData.mercados.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Clientes Aprovados</p>
                <p className="text-xl font-bold text-green-600">
                  {data.validatedData.clientes.length}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (step >= 7) return null; // Não mostrar preview no step 7 (já é o resumo final)

  return (
    <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Resumo do Passo {step}
          </h3>
          {renderPreview()}
        </div>
      </div>
    </Card>
  );
}
