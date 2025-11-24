/**
 * Interface de Pré-Pesquisa com IA
 * Fase 42.1 - Integração completa ao Step 5
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
// import type { ResearchWizardData } from './AllSteps';
type ResearchWizardData = any;

interface PreResearchInterfaceProps {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

interface EntityResult {
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

export default function PreResearchInterface({
  data,
  updateData,
}: PreResearchInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState<"mercado" | "cliente">("mercado");
  const [results, setResults] = useState<EntityResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const executeMutation = trpc.preResearch.execute.useMutation({
    onSuccess: result => {
      if (result.success && result.entidades.length > 0) {
        setResults(result.entidades.map(e => ({ ...e, selected: true })));
        setShowResults(true);
      }
    },
  });

  const handleExecute = () => {
    if (!prompt.trim()) return;

    executeMutation.mutate({
      prompt: prompt.trim(),
      tipo,
      quantidade: 10,
      projectId: data.projectId,
    });
  };

  const toggleSelection = (index: number) => {
    setResults(prev =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleAddSelected = () => {
    const selected = results.filter(r => r.selected);

    if (tipo === "mercado") {
      const newMercados = selected.map(s => ({
        nome: s.nome,
        segmentacao: (s.segmentacao || "B2B") as
          | "B2B"
          | "B2C"
          | "B2B2C"
          | "B2G",
      }));

      updateData({
        mercados: [...data.mercados, ...newMercados],
      });
    } else {
      const newClientes = selected.map(s => ({
        nome: s.nome,
        razaoSocial: s.razaoSocial,
        cnpj: s.cnpj,
        site: s.site,
        email: s.email,
        telefone: s.telefone,
        cidade: s.cidade,
        uf: s.uf,
        porte: s.porte as "MEI" | "ME" | "EPP" | "Médio" | "Grande" | undefined,
      }));

      updateData({
        clientes: [...(data.clientes || []), ...newClientes],
      });
    }

    // Limpar resultados
    setShowResults(false);
    setResults([]);
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Pré-Pesquisa com IA
          </CardTitle>
          <CardDescription>
            Descreva em linguagem natural o que você procura e a IA buscará os
            dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Tipo */}
          <div className="flex gap-2">
            <Button
              variant={tipo === "mercado" ? "default" : "outline"}
              onClick={() => setTipo("mercado")}
              className="flex-1"
            >
              Buscar Mercados
            </Button>
            <Button
              variant={tipo === "cliente" ? "default" : "outline"}
              onClick={() => setTipo("cliente")}
              className="flex-1"
            >
              Buscar Clientes
            </Button>
          </div>

          {/* Campo de Prompt */}
          <div>
            <Textarea
              placeholder={
                tipo === "mercado"
                  ? 'Ex: "Empresas de tecnologia no setor de saúde" ou "Mercados B2B de software"'
                  : 'Ex: "Hospitais em São Paulo com mais de 100 leitos" ou "Clínicas de estética em Curitiba"'
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Botão Executar */}
          <Button
            onClick={handleExecute}
            disabled={!prompt.trim() || executeMutation.isPending}
            className="w-full"
            size="lg"
          >
            {executeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Pesquisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Executar Pré-Pesquisa
              </>
            )}
          </Button>

          {/* Erro */}
          {executeMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Erro ao executar pré-pesquisa. Tente novamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Resultados Encontrados ({results.filter(r => r.selected).length}{" "}
                selecionados)
              </span>
              <Button
                onClick={handleAddSelected}
                disabled={results.filter(r => r.selected).length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Selecionados
              </Button>
            </CardTitle>
            <CardDescription>
              Revise os resultados e selecione quais deseja adicionar ao wizard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`
                  p-4 cursor-pointer transition-all
                  ${result.selected ? "border-2 border-blue-500 bg-blue-50" : "hover:border-gray-400"}
                `}
                onClick={() => toggleSelection(index)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={result.selected}
                    onCheckedChange={() => toggleSelection(index)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{result.nome}</h4>
                      {result.segmentacao && (
                        <Badge variant="outline">{result.segmentacao}</Badge>
                      )}
                    </div>

                    {result.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {result.descricao}
                      </p>
                    )}

                    {tipo === "cliente" && (
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {result.razaoSocial && (
                          <div>Razão Social: {result.razaoSocial}</div>
                        )}
                        {result.cnpj && <div>CNPJ: {result.cnpj}</div>}
                        {result.site && <div>Site: {result.site}</div>}
                        {result.email && <div>Email: {result.email}</div>}
                        {result.telefone && (
                          <div>Telefone: {result.telefone}</div>
                        )}
                        {result.cidade && result.uf && (
                          <div>
                            Localização: {result.cidade}/{result.uf}
                          </div>
                        )}
                        {result.porte && <div>Porte: {result.porte}</div>}
                      </div>
                    )}

                    {tipo === "mercado" && result.categoria && (
                      <div className="text-sm text-muted-foreground">
                        Categoria: {result.categoria}
                      </div>
                    )}
                  </div>

                  {result.selected && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dados Já Adicionados */}
      {data.mercados.length > 0 && (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>
            <strong>{data.mercados.length} mercado(s)</strong> já adicionado(s)
            ao wizard
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
