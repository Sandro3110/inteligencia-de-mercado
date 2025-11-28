'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { Zap, Play, Clock, Users, TrendingUp, MapPin } from 'lucide-react';

export default function EnrichmentPage() {
  const { selectedProjectId } = useApp();

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione um Projeto</h2>
          <p className="text-gray-600">
            Escolha um projeto no seletor global para gerenciar enriquecimentos
          </p>
        </div>
      </div>
    );
  }

  // TODO: Implementar integração com API de enriquecimento real

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enriquecimento</h1>
          <p className="text-gray-600">Gerencie jobs de enriquecimento de dados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Play className="w-5 h-5" />
          Novo Job
        </button>
      </div>

      {/* Funcionalidade em Desenvolvimento */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <Zap className="w-20 h-20 mx-auto mb-6 text-blue-500" />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enriquecimento de Dados</h2>

          <p className="text-lg text-gray-600 mb-8">
            Esta funcionalidade permite enriquecer automaticamente seus dados de clientes e leads
            com informações adicionais.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Em Desenvolvimento</h3>
                <p className="text-blue-800">
                  A integração com APIs de enriquecimento de dados está sendo desenvolvida e estará
                  disponível em breve.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Dados de Empresa</h4>
              <p className="text-sm text-gray-600">
                CNPJ, razão social, endereço, telefone, email e mais
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Dados Financeiros</h4>
              <p className="text-sm text-gray-600">
                Faturamento, número de funcionários, porte da empresa
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Localização</h4>
              <p className="text-sm text-gray-600">
                Coordenadas geográficas, região, estado, cidade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
