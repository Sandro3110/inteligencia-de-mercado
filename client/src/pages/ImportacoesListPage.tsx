import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Link } from 'wouter';

export default function ImportacoesListPage() {
  const [projetoId, setProjetoId] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const projetos = trpc.projetos.list.useQuery({ limit: 100 });
  const importacoes = trpc.importacao.list.useQuery({
    projetoId,
    status,
    limit: 50,
  });

  // Debug
  console.log('Importacoes query:', {
    isLoading: importacoes.isLoading,
    isError: importacoes.isError,
    data: importacoes.data,
    dataType: typeof importacoes.data,
    dataLength: Array.isArray(importacoes.data) ? importacoes.data.length : 'not array'
  });

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Importações</h1>
        <Link href="/importacao">
          <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Nova Importação
          </a>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select
          value={projetoId || ''}
          onChange={(e) => setProjetoId(e.target.value ? Number(e.target.value) : undefined)}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os projetos</option>
          {projetos.data?.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <select
          value={status || ''}
          onChange={(e) => setStatus(e.target.value || undefined)}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="processando">Processando</option>
          <option value="concluido">Concluído</option>
          <option value="falhou">Falhou</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Lista */}
      {importacoes.isLoading && <p>Carregando...</p>}

      {importacoes.data && importacoes.data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nenhuma importação encontrada</p>
          <Link href="/importacao">
            <a className="text-blue-600 hover:underline">Criar primeira importação</a>
          </Link>
        </div>
      )}

      {importacoes.data && importacoes.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Arquivo</th>
                <th className="border px-4 py-2 text-left">Projeto</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-right">Total</th>
                <th className="border px-4 py-2 text-right">Sucesso</th>
                <th className="border px-4 py-2 text-right">Erros</th>
                <th className="border px-4 py-2 text-right">Duplicadas</th>
                <th className="border px-4 py-2 text-left">Duração</th>
                <th className="border px-4 py-2 text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              {importacoes.data.map((imp: any) => (
                <tr key={imp.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    <div className="font-medium">{imp.nomeArquivo}</div>
                    <div className="text-xs text-gray-500">ID: {imp.id}</div>
                  </td>
                  <td className="border px-4 py-2 text-sm">{imp.projetoId}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(imp.status)}`}>
                      {imp.status}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-right">{imp.totalLinhas}</td>
                  <td className="border px-4 py-2 text-right text-green-600">
                    {imp.linhasSucesso || 0}
                  </td>
                  <td className="border px-4 py-2 text-right text-red-600">
                    {imp.linhasErro || 0}
                  </td>
                  <td className="border px-4 py-2 text-right text-yellow-600">
                    {imp.linhasDuplicadas || 0}
                  </td>
                  <td className="border px-4 py-2 text-sm">
                    {formatDuration(imp.durationSeconds)}
                  </td>
                  <td className="border px-4 py-2 text-sm">
                    {formatDate(imp.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
