import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExportState } from "@/pages/ExportWizard";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface Step4OutputProps {
  state: ExportState;
  setState: React.Dispatch<React.SetStateAction<ExportState>>;
}

export default function Step4Output({ state, setState }: Step4OutputProps) {
  const formats = [
    {
      value: "csv",
      label: "CSV",
      icon: FileText,
      description: "Arquivo de texto separado por vírgulas",
    },
    {
      value: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      description: "Planilha XLSX com múltiplas abas",
    },
    {
      value: "pdf",
      label: "PDF",
      icon: FileText,
      description: "Documento formatado para impressão",
    },
    {
      value: "json",
      label: "JSON",
      icon: FileJson,
      description: "Formato estruturado para APIs",
    },
  ];

  const outputTypes = [
    {
      value: "simple",
      label: "Lista Simples",
      description: "Dados brutos formatados (~5s)",
      icon: Download,
    },
    {
      value: "complete",
      label: "Lista Completa",
      description: "Dados + relacionamentos + gráficos (~15s)",
      icon: FileSpreadsheet,
    },
    {
      value: "report",
      label: "Relatório Contextualizado",
      description: "Análise completa com insights IA (~60s)",
      icon: Sparkles,
      requiresTemplate: true,
    },
  ];

  const templates = [
    {
      value: "market",
      label: "Análise de Mercado",
      description: "Tendências, oportunidades, SWOT",
    },
    {
      value: "client",
      label: "Análise de Clientes",
      description: "Perfil, segmentação, potencial",
    },
    {
      value: "competitive",
      label: "Análise Competitiva",
      description: "Concorrentes, market share, posicionamento",
    },
    {
      value: "lead",
      label: "Análise de Leads",
      description: "Qualificação, conversão, priorização",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Escolha o Formato
        </h2>
        <p className="text-slate-600">
          Defina como deseja receber os dados exportados.
        </p>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título da Exportação</Label>
        <Input
          id="title"
          placeholder="Ex: Leads Qualificados - Embalagens SP"
          value={state.title}
          onChange={e => setState(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      {/* Formato */}
      <div className="space-y-3">
        <Label>Formato do Arquivo</Label>
        <RadioGroup
          value={state.format}
          onValueChange={(value: any) =>
            setState(prev => ({ ...prev, format: value }))
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {formats.map(format => {
              const Icon = format.icon;
              return (
                <label
                  key={format.value}
                  htmlFor={format.value}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    state.format === format.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value={format.value} id={format.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{format.label}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {format.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Tipo de Saída */}
      <div className="space-y-3">
        <Label>Tipo de Saída</Label>
        <RadioGroup
          value={state.outputType}
          onValueChange={(value: any) =>
            setState(prev => ({ ...prev, outputType: value }))
          }
        >
          <div className="space-y-3">
            {outputTypes.map(type => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  htmlFor={type.value}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    state.outputType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{type.label}</span>
                      {type.requiresTemplate && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Requer IA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{type.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Profundidade (se relatório) */}
      {state.outputType === "report" && (
        <div className="space-y-3">
          <Label>Profundidade da Análise</Label>
          <RadioGroup
            value={(state as any).depth || "standard"}
            onValueChange={(value: any) =>
              setState(prev => ({ ...prev, depth: value }) as any)
            }
          >
            <div className="grid grid-cols-3 gap-3">
              <label
                htmlFor="quick"
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  ((state as any).depth || "standard") === "quick"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="quick" id="quick" className="mb-2" />
                <div className="font-semibold mb-1">Rápida</div>
                <p className="text-xs text-slate-600">~30s, 2-3 páginas</p>
              </label>
              <label
                htmlFor="standard"
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  ((state as any).depth || "standard") === "standard"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem
                  value="standard"
                  id="standard"
                  className="mb-2"
                />
                <div className="font-semibold mb-1">Padrão</div>
                <p className="text-xs text-slate-600">~60s, 5-7 páginas</p>
              </label>
              <label
                htmlFor="deep"
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  ((state as any).depth || "standard") === "deep"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="deep" id="deep" className="mb-2" />
                <div className="font-semibold mb-1">Profunda</div>
                <p className="text-xs text-slate-600">~120s, 10-15 páginas</p>
              </label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Template (se relatório) */}
      {state.outputType === "report" && (
        <div className="space-y-3">
          <Label>Template de Análise</Label>
          <RadioGroup
            value={state.templateType}
            onValueChange={(value: any) =>
              setState(prev => ({ ...prev, templateType: value }))
            }
          >
            <div className="grid grid-cols-2 gap-3">
              {templates.map(template => (
                <label
                  key={template.value}
                  htmlFor={template.value}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    state.templateType === template.value
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value={template.value} id={template.value} />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{template.label}</div>
                    <p className="text-xs text-slate-600">
                      {template.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Preview */}
      <Card className="p-4 bg-slate-50">
        <h4 className="font-semibold text-slate-900 mb-3">
          Resumo da Exportação
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Título:</span>
            <span className="font-medium">{state.title || "Não definido"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tipo de Dados:</span>
            <span className="font-medium capitalize">{state.entityType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Campos:</span>
            <span className="font-medium">
              {state.selectedFields.length} selecionados
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Formato:</span>
            <span className="font-medium uppercase">{state.format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tipo:</span>
            <span className="font-medium">
              {outputTypes.find(t => t.value === state.outputType)?.label}
            </span>
          </div>
          {state.outputType === "report" && state.templateType && (
            <div className="flex justify-between">
              <span className="text-slate-600">Template:</span>
              <span className="font-medium">
                {templates.find(t => t.value === state.templateType)?.label}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Aviso sobre tempo */}
      {state.outputType === "report" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⏱️ Relatórios contextualizados levam ~60-90 segundos para gerar pois
            incluem análise profunda com IA.
          </p>
        </div>
      )}
    </div>
  );
}
