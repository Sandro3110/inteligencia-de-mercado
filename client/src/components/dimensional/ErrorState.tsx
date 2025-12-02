/**
 * ErrorState - Estados de erro
 * Alert, Toast, Empty State
 * 100% Funcional
 */

import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCw, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// ============================================================================
// ERROR ALERT
// ============================================================================

interface ErrorAlertProps {
  titulo?: string;
  mensagem: string;
  tipo?: 'error' | 'warning' | 'info';
  onTentarNovamente?: () => void;
  className?: string;
}

export function ErrorAlert({
  titulo,
  mensagem,
  tipo = 'error',
  onTentarNovamente,
  className
}: ErrorAlertProps) {
  const configs = {
    error: {
      icon: XCircle,
      titulo: titulo || 'Erro',
      variant: 'destructive' as const
    },
    warning: {
      icon: AlertTriangle,
      titulo: titulo || 'Atenção',
      variant: 'default' as const
    },
    info: {
      icon: Info,
      titulo: titulo || 'Informação',
      variant: 'default' as const
    }
  };

  const config = configs[tipo];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.titulo}</AlertTitle>
      <AlertDescription className="mt-2">
        {mensagem}
        {onTentarNovamente && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onTentarNovamente}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icone?: React.ReactNode;
  titulo: string;
  descricao?: string;
  acao?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
  className
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      {icone || <Search className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      {descricao && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {descricao}
        </p>
      )}
      {acao && (
        <Button onClick={acao.onClick}>
          {acao.label}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY FALLBACK
// ============================================================================

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Algo deu errado</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// ============================================================================
// NO RESULTS
// ============================================================================

interface NoResultsProps {
  query?: string;
  sugestoes?: string[];
  onLimparFiltros?: () => void;
  className?: string;
}

export function NoResults({
  query,
  sugestoes,
  onLimparFiltros,
  className
}: NoResultsProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Nenhum resultado encontrado
      </h3>
      {query && (
        <p className="text-sm text-muted-foreground mb-4">
          Não encontramos resultados para "{query}"
        </p>
      )}
      {sugestoes && sugestoes.length > 0 && (
        <div className="bg-muted rounded-lg p-4 mb-4 max-w-md">
          <p className="text-sm font-medium mb-2">Sugestões:</p>
          <ul className="text-sm text-left space-y-1">
            {sugestoes.map((sugestao, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{sugestao}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {onLimparFiltros && (
        <Button variant="outline" onClick={onLimparFiltros}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// CONNECTION ERROR
// ============================================================================

interface ConnectionErrorProps {
  onTentarNovamente: () => void;
  className?: string;
}

export function ConnectionError({
  onTentarNovamente,
  className
}: ConnectionErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Erro de conexão
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
      </p>
      <Button onClick={onTentarNovamente}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ============================================================================
// PERMISSION ERROR
// ============================================================================

interface PermissionErrorProps {
  recurso?: string;
  className?: string;
}

export function PermissionError({
  recurso = 'este recurso',
  className
}: PermissionErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Acesso negado
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Você não tem permissão para acessar {recurso}. Entre em contato com o administrador se precisar de acesso.
      </p>
    </div>
  );
}
