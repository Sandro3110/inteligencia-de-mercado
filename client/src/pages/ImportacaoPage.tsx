import { useState } from 'react';
import { trpc } from '../lib/trpc';

export default function ImportacaoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [projetoId, setProjetoId] = useState<number>(0);
  const [pesquisaId, setPesquisaId] = useState<number>(0);

  const projetos = trpc.projetos.list.useQuery({ limit: 100 });
  const pesquisas = trpc.pesquisas.list.useQuery({ projetoId, limit: 100 }, { enabled: projetoId > 0 });
  const createImportacao = trpc.importacao.create.useMutation();

  const handleUpload = async () => {
    if (!file || !projetoId || !pesquisaId) {
      alert('Selecione projeto, pesquisa e arquivo');
      return;
    }

    // TODO: Implementar upload e processamento
    console.log('Upload:', { file, projetoId, pesquisaId });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Importar Entidades</h1>

      <div className="space-y-4 max-w-2xl">
        {/* Projeto */}
        <div>
          <label className="block text-sm font-medium mb-2">Projeto</label>
          <select
            value={projetoId}
            onChange={(e) => setProjetoId(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value={0}>Selecione um projeto</option>
            {projetos.data?.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Pesquisa */}
        {projetoId > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Pesquisa</label>
            <select
              value={pesquisaId}
              onChange={(e) => setPesquisaId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={0}>Selecione uma pesquisa</option>
              {pesquisas.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Arquivo (CSV ou Excel)</label>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Botão */}
        <button
          onClick={handleUpload}
          disabled={!file || !projetoId || !pesquisaId}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Importar
        </button>
      </div>

      {/* Lista de importações */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Importações Recentes</h2>
        <p className="text-gray-500">Em desenvolvimento...</p>
      </div>
    </div>
  );
}
