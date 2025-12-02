import { useState } from 'react';
import { trpc } from '../lib/trpc';

export default function EntidadesListPage() {
  const [busca, setBusca] = useState('');
  const entidades = trpc.entidades.list.useQuery({ busca, limit: 50 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Entidades</h1>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-md border rounded px-4 py-2"
        />
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {entidades.isLoading && <p>Carregando...</p>}
        {entidades.data?.map((ent: any) => (
          <div key={ent.id} className="border rounded p-4 hover:bg-gray-50">
            <h3 className="font-semibold">{ent.nome}</h3>
            {ent.cnpj && <p className="text-sm text-gray-600">CNPJ: {ent.cnpj}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
