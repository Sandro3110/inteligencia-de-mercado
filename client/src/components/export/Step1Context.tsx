import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportState } from "@/pages/ExportWizard";
import { Lightbulb, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Step1ContextProps {
  state: ExportState;
  setState: React.Dispatch<React.SetStateAction<ExportState>>;
}

export default function Step1Context({ state, setState }: Step1ContextProps) {
  const { data: projects } = trpc.projects.list.useQuery();

  const examples = [
    "Quero leads de alta qualidade no setor de embalagens em São Paulo",
    "Exportar todos os clientes validados do projeto Embalagens",
    "Buscar concorrentes de médio porte na região Sul com score acima de 80",
    "Listar mercados recentes (últimos 30 dias) em MG e SP",
    "Produtos de clientes B2B com faturamento acima de 5 milhões"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          O que você deseja exportar?
        </h2>
        <p className="text-slate-600">
          Descreva em linguagem natural o que você precisa. Nossa IA vai interpretar e criar os filtros automaticamente.
        </p>
      </div>

      {/* Projeto */}
      <div className="space-y-2">
        <Label htmlFor="project">Projeto (opcional)</Label>
        <Select
          value={state.projectId}
          onValueChange={(value) => setState(prev => ({ ...prev, projectId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Entidade */}
      <div className="space-y-2">
        <Label htmlFor="entityType">Tipo de Dados</Label>
        <Select
          value={state.entityType}
          onValueChange={(value: any) => setState(prev => ({ ...prev, entityType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mercados">Mercados</SelectItem>
            <SelectItem value="clientes">Clientes</SelectItem>
            <SelectItem value="concorrentes">Concorrentes</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="produtos">Produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contexto em linguagem natural */}
      <div className="space-y-2">
        <Label htmlFor="context">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Descreva o que você precisa (opcional)
          </div>
        </Label>
        <Textarea
          id="context"
          placeholder="Ex: Quero leads de alta qualidade no setor de embalagens em São Paulo..."
          value={state.context}
          onChange={(e) => setState(prev => ({ ...prev, context: e.target.value }))}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-slate-500">
          Nossa IA vai extrair automaticamente: geografia, qualidade, porte, segmentação e período.
        </p>
      </div>

      {/* Exemplos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Exemplos de contextos</h3>
            <p className="text-sm text-blue-700 mb-2">
              Clique em um exemplo para usar como base:
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setState(prev => ({ ...prev, context: example }))}
              className="w-full text-left text-sm bg-white hover:bg-blue-100 border border-blue-200 rounded px-3 py-2 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 mb-2">Como funciona?</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• <strong>Geografia:</strong> Estados (SP, MG), cidades, regiões (Sudeste, Sul)</li>
          <li>• <strong>Qualidade:</strong> "Alta qualidade" = score ≥ 80, "validados", "pendentes"</li>
          <li>• <strong>Porte:</strong> Micro, pequena, média, grande empresa</li>
          <li>• <strong>Temporal:</strong> "Recente" = últimos 30 dias, "este mês", "último trimestre"</li>
          <li>• <strong>Segmentação:</strong> B2B, B2C, CNAE específico</li>
        </ul>
      </div>
    </div>
  );
}
