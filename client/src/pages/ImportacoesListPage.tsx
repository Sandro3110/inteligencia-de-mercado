import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Importacao {
  id: number;
  projetoId: number;
  projetoNome: string;
  pesquisaId: number;
  pesquisaNome: string;
  nomeArquivo: string;
  tipoArquivo: string;
  totalLinhas: number;
  linhasProcessadas: number;
  linhasSucesso: number;
  linhasErro: number;
  linhasDuplicadas: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  createdBy: number;
}

export default function ImportacoesListPage() {
  const [importacoes, setImportacoes] = useState<Importacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImportacoes() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/trpc/importacao.list');
        const data = await response.json();
        
        if (data.result && data.result.data) {
          setImportacoes(data.result.data);
        }
      } catch (err) {
        setError('Erro ao carregar importações');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImportacoes();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-gray-100 text-gray-800',
      processando: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      falhou: 'bg-red-100 text-red-800',
      cancelado: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getTaxaSucesso = (imp: Importacao) => {
    if (imp.totalLinhas === 0) return 0;
    return Math.round((imp.linhasSucesso / imp.totalLinhas) * 100);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Importações</h1>
          <p className="text-gray-600 mt-1">Visualize todas as importações de dados realizadas</p>
        </div>
        <Link href="/importacao">
          <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Nova Importação
          </a>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando importações...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && importacoes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nenhuma importação encontrada</p>
          <Link href="/importacao">
            <a className="text-blue-600 hover:underline">Criar primeira importação</a>
          </Link>
        </div>
      )}

      {/* Lista de Importações */}
      {!isLoading && !error && importacoes.length > 0 && (
        <div className="grid gap-4">
          {importacoes.map((imp) => (
            <div key={imp.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{imp.nomeArquivo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(imp.status)}`}>
                      {imp.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Projeto:</span> {imp.projetoNome || `ID ${imp.projetoId}`}
                    </p>
                    <p>
                      <span className="font-medium">Pesquisa:</span> {imp.pesquisaNome || `ID ${imp.pesquisaId}`}
                    </p>
                    <p>
                      <span className="font-medium">Data:</span> {formatDate(imp.createdAt)}
                    </p>
                    {imp.durationSeconds && (
                      <p>
                        <span className="font-medium">Duração:</span> {formatDuration(imp.durationSeconds)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{imp.totalLinhas}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{imp.linhasSucesso}</div>
                    <div className="text-xs text-gray-500">Sucesso</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{imp.linhasErro}</div>
                    <div className="text-xs text-gray-500">Erros</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{imp.linhasDuplicadas}</div>
                    <div className="text-xs text-gray-500">Duplicadas</div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Taxa de Sucesso</span>
                  <span className="font-semibold">{getTaxaSucesso(imp)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${getTaxaSucesso(imp)}%` }}
                  />
                </div>
              </div>

              {/* Indicador de Erros */}
              {imp.linhasErro > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ <span className="font-medium">{imp.linhasErro} linhas com erro</span>
                    {' - '}
                    Verifique os detalhes da importação para mais informações
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
