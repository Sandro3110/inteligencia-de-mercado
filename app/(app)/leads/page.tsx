'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function LeadsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar leads (filtrados por projeto se houver seleção)
  const { data: leads, isLoading } = trpc.leads.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : {}
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Leads</h1>
        <p>Carregando leads...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus leads e oportunidades
        </p>
        
        {/* Indicador de filtro */}
        {selectedProjectId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              🔍 Filtrando por projeto selecionado globalmente
            </p>
          </div>
        )}
      </div>

      {leads && leads.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Setor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                      {lead.porte && (
                        <div className="text-xs text-gray-500">{lead.porte}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.cnpj || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : lead.cidade || lead.uf || '-'}
                      </div>
                      {lead.regiao && (
                        <div className="text-xs text-gray-500">{lead.regiao}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.setor || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.leadStage === 'novo' ? 'bg-blue-100 text-blue-800' :
                        lead.leadStage === 'qualificado' ? 'bg-green-100 text-green-800' :
                        lead.leadStage === 'contatado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.leadStage || 'novo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.email && (
                        <div className="text-xs">{lead.email}</div>
                      )}
                      {lead.telefone && (
                        <div className="text-xs">{lead.telefone}</div>
                      )}
                      {!lead.email && !lead.telefone && '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {leads.length} leads (limitado a 100 por página)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">
            {selectedProjectId 
              ? 'Nenhum lead encontrado para este projeto' 
              : 'Nenhum lead encontrado'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Importe ou crie leads para começar
          </p>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Debug - Reatividade:</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({
            selectedProjectId,
            totalLeads: leads?.length || 0,
            message: 'Esta página REAGE ao projeto selecionado no Dashboard'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
