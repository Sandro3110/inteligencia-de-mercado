'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Users, Search, Filter, List, Columns } from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';

export default function LeadsPage() {
  const { selectedProjectId } = useProject();
  const [search, setSearch] = useState('');
  const [leadStage, setLeadStage] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<string>('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  
  // Buscar leads com filtros
  const { data: leadsData, isLoading } = trpc.leads.list.useQuery({
    projectId: selectedProjectId || undefined,
    validationStatus: validationStatus || undefined,
  });

  const leads = (leadsData as any)?.items || [];
  const total = (leadsData as any)?.total || 0;

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Leads</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar leads, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads</h1>
          <p className="text-gray-600">Gerencie leads e oportunidades de negócio</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              view === 'kanban'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Columns className="w-4 h-4" />
            Kanban
          </button>
        </div>
      </div>

      {/* Filtros (apenas em modo lista) */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, CNPJ ou email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Estágio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estágio
              </label>
              <select
                value={leadStage}
                onChange={(e) => setLeadStage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="contato">Contato</option>
                <option value="qualificado">Qualificado</option>
                <option value="proposta">Proposta</option>
                <option value="negociacao">Negociação</option>
                <option value="ganho">Ganho</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>

            {/* Status de Validação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Validação
              </label>
              <select
                value={validationStatus}
                onChange={(e) => setValidationStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="validado">Validado</option>
                <option value="invalido">Inválido</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {total} lead{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
            {(search || leadStage || validationStatus) && (
              <button
                onClick={() => {
                  setSearch('');
                  setLeadStage('');
                  setValidationStatus('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando leads...</p>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard mercadoId={selectedProjectId || 0} leads={leads} />
      ) : leads.length > 0 ? (
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
                    Cidade/UF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estágio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                      {lead.setor && (
                        <div className="text-xs text-gray-500">{lead.setor}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lead.cnpj || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.leadStage === 'ganho' ? 'bg-green-100 text-green-800' :
                        lead.leadStage === 'perdido' ? 'bg-red-100 text-red-800' :
                        lead.leadStage === 'qualificado' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.leadStage || 'novo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.validationStatus === 'validado' ? 'bg-green-100 text-green-800' :
                        lead.validationStatus === 'invalido' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lead.validationStatus || 'pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {lead.email && (
                        <div className="text-xs">{lead.email}</div>
                      )}
                      {lead.telefone && (
                        <div className="text-xs text-gray-500">{lead.telefone}</div>
                      )}
                      {!lead.email && !lead.telefone && '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-lg font-medium">Nenhum lead encontrado</p>
          <p className="text-gray-500 text-sm mt-2">
            {search || leadStage || validationStatus
              ? 'Tente ajustar os filtros'
              : 'Crie um novo lead para começar'}
          </p>
        </div>
      )}
    </div>
  );
}
