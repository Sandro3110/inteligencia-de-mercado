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

interface Projeto {
  id: number;
  nome: string;
}

export default function ImportacoesListPage() {
  const [importacoes, setImportacoes] = useState<Importacao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [projetoIdFiltro, setProjetoIdFiltro] = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Carregar projetos
  useEffect(() => {
    async function fetchProjetos() {
      try {
        const response = await fetch('/api/trpc/projetos.list?input={"limit":100}');
        const data = await response.json();
        if (data.result && data.result.data && data.result.data.projetos) {
          setProjetos(data.result.data.projetos);
        }
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
      }
    }
    fetchProjetos();
  }, []);

  // Carregar importações
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

  // Aplicar filtros
  const importacoesFiltradas = importacoes.filter((imp) => {
    if (projetoIdFiltro && imp.projetoId !== projetoIdFiltro) return false;
    if (statusFiltro && imp.status !== statusFiltro) return false;
    return true;
  });

  // Aplicar paginação
  const totalPaginas = Math.ceil(importacoesFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const importacoesPaginadas = importacoesFiltradas.slice(indiceInicio, indiceFim);

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

      {/* Filtros e Estatísticas */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por Projeto */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Projeto
            </label>
            <select
              value={projetoIdFiltro || ''}
              onChange={(e) => {
                setProjetoIdFiltro(e.target.value ? Number(e.target.value) : null);
                setPaginaAtual(1);
              }}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os projetos</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Status
            </label>
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="processando">Processando</option>
              <option value="concluido">Concluído</option>
              <option value="falhou">Falhou</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Estatísticas */}
          <div className="flex gap-6 ml-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{importacoesFiltradas.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {importacoesFiltradas.filter(i => i.status === 'concluido').length}
              </div>
              <div className="text-xs text-gray-500">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {importacoesFiltradas.filter(i => i.status === 'falhou').length}
              </div>
              <div className="text-xs text-gray-500">Falhadas</div>
            </div>
          </div>
        </div>
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
      {!isLoading && !error && importacoesFiltradas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">
            {projetoIdFiltro || statusFiltro 
              ? 'Nenhuma importação encontrada com os filtros aplicados'
              : 'Nenhuma importação encontrada'}
          </p>
          <Link href="/importacao">
            <a className="text-blue-600 hover:underline">Criar primeira importação</a>
          </Link>
        </div>
      )}

      {/* Lista de Importações */}
      {!isLoading && !error && importacoesPaginadas.length > 0 && (
        <>
          <div className="grid gap-4">
            {importacoesPaginadas.map((imp) => (
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

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaAtual(pagina)}
                    className={`px-3 py-2 border rounded ${
                      pagina === paginaAtual
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          )}

          {/* Info de Paginação */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {indiceInicio + 1} a {Math.min(indiceFim, importacoesFiltradas.length)} de {importacoesFiltradas.length} importações
          </div>
        </>
      )}
    </div>
  );
}
