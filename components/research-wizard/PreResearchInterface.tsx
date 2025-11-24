'use client';

/**
 * Interface de Pré-Pesquisa com IA
 * Fase 42.1 - Integração completa ao Step 5
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPE = {
  MARKET: 'mercado',
  CLIENT: 'cliente',
} as const;

const SEGMENTATION_TYPES = ['B2B', 'B2C', 'B2B2C', 'B2G'] as const;
const COMPANY_SIZES = ['MEI', 'ME', 'EPP', 'Médio', 'Grande'] as const;

const PLACEHOLDERS = {
  MARKET:
    'Ex: "Empresas de tecnologia no setor de saúde" ou "Mercados B2B de software"',
  CLIENT:
    'Ex: "Hospitais em São Paulo com mais de 100 leitos" ou "Clínicas de estética em Curitiba"',
} as const;

const DEFAULT_QUANTITY = 10;

const MESSAGES = {
  ERROR: 'Erro ao executar pré-pesquisa. Tente novamente.',
  DESCRIPTION:
    'Descreva em linguagem natural o que você procura e a IA buscará os dados',
  REVIEW: 'Revise os resultados e selecione quais deseja adicionar ao wizard',
} as const;

// ============================================================================
// TYPES
// ============================================================================

type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];
type SegmentationType = (typeof SEGMENTATION_TYPES)[number];
type CompanySize = (typeof COMPANY_SIZES)[number];

interface Market {
  nome: string;
  segmentacao: SegmentationType;
}

interface Client {
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  site?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  porte?: CompanySize;
}

interface ResearchWizardData {
  projectId?: string;
  mercados: Market[];
  clientes?: Client[];
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

interface PreResearchInterfaceProps {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

interface PreResearchResult {
  success: boolean;
  entidades: EntityResult[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isValidSegmentation(value: string): value is SegmentationType {
  return SEGMENTATION_TYPES.includes(value as SegmentationType);
}

function isValidCompanySize(value: string): value is CompanySize {
  return COMPANY_SIZES.includes(value as CompanySize);
}

function mapToMarket(entity: EntityResult): Market {
  const segmentacao = entity.segmentacao || 'B2B';
  return {
    nome: entity.nome,
    segmentacao: isValidSegmentation(segmentacao) ? segmentacao : 'B2B',
  };
}

function mapToClient(entity: EntityResult): Client {
  return {
    nome: entity.nome,
    razaoSocial: entity.razaoSocial,
    cnpj: entity.cnpj,
    site: entity.site,
    email: entity.email,
    telefone: entity.telefone,
    cidade: entity.cidade,
    uf: entity.uf,
    porte: entity.porte && isValidCompanySize(entity.porte) 
      ? entity.porte 
      : undefined,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PreResearchInterface({
  data,
  updateData,
}: PreResearchInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [tipo, setTipo] = useState<EntityType>(ENTITY_TYPE.MARKET);
  const [results, setResults] = useState<EntityResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const executeMutation = trpc.preResearch.execute.useMutation({
    onSuccess: (result: PreResearchResult) => {
      if (result.success && result.entidades.length > 0) {
        setResults(result.entidades.map((e) => ({ ...e, selected: true })));
        setShowResults(true);
      }
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedCount = useMemo(
    () => results.filter((r) => r.selected).length,
    [results]
  );

  const hasSelectedResults = useMemo(() => selectedCount > 0, [selectedCount]);

  const currentPlaceholder = useMemo(
    () =>
      tipo === ENTITY_TYPE.MARKET ? PLACEHOLDERS.MARKET : PLACEHOLDERS.CLIENT,
    [tipo]
  );

  const isMarketType = useMemo(
    () => tipo === ENTITY_TYPE.MARKET,
    [tipo]
  );

  const hasAddedMarkets = useMemo(
    () => data.mercados.length > 0,
    [data.mercados.length]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExecute = useCallback(() => {
    if (!prompt.trim()) return;

    executeMutation.mutate({
      prompt: prompt.trim(),
      tipo,
      quantidade: DEFAULT_QUANTITY,
      projectId: data.projectId,
    });
  }, [prompt, tipo, data.projectId, executeMutation]);

  const toggleSelection = useCallback((index: number) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  }, []);

  const handleAddSelected = useCallback(() => {
    const selected = results.filter((r) => r.selected);

    if (tipo === ENTITY_TYPE.MARKET) {
      const newMercados = selected.map(mapToMarket);
      updateData({
        mercados: [...data.mercados, ...newMercados],
      });
    } else {
      const newClientes = selected.map(mapToClient);
      updateData({
        clientes: [...(data.clientes || []), ...newClientes],
      });
    }

    // Limpar resultados
    setShowResults(false);
    setResults([]);
    setPrompt('');
  }, [results, tipo, data.mercados, data.clientes, updateData]);

  const handleSetTipoMercado = useCallback(() => {
    setTipo(ENTITY_TYPE.MARKET);
  }, []);

  const handleSetTipoCliente = useCallback(() => {
    setTipo(ENTITY_TYPE.CLIENT);
  }, []);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Pré-Pesquisa com IA
          </CardTitle>
          <CardDescription>{MESSAGES.DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Tipo */}
          <div className="flex gap-2">
            <Button
              variant={tipo === ENTITY_TYPE.MARKET ? 'default' : 'outline'}
              onClick={handleSetTipoMercado}
              className="flex-1"
            >
              Buscar Mercados
            </Button>
            <Button
              variant={tipo === ENTITY_TYPE.CLIENT ? 'default' : 'outline'}
              onClick={handleSetTipoCliente}
              className="flex-1"
            >
              Buscar Clientes
            </Button>
          </div>

          {/* Campo de Prompt */}
          <div>
            <Textarea
              placeholder={currentPlaceholder}
              value={prompt}
              onChange={handlePromptChange}
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
              <AlertDescription>{MESSAGES.ERROR}</AlertDescription>
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
                Resultados Encontrados ({selectedCount} selecionados)
              </span>
              <Button
                onClick={handleAddSelected}
                disabled={!hasSelectedResults}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Selecionados
              </Button>
            </CardTitle>
            <CardDescription>{MESSAGES.REVIEW}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`
                  p-4 cursor-pointer transition-all
                  ${result.selected ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-400'}
                `}
                onClick={() => toggleSelection(index)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={result.selected}
                    onCheckedChange={() => toggleSelection(index)}
                    onClick={(e) => e.stopPropagation()}
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

                    {!isMarketType && (
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

                    {isMarketType && result.categoria && (
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
      {hasAddedMarkets && (
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
