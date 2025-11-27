'use client';

import { useState } from 'react';
import { Search, Filter, History, Save } from 'lucide-react';

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Busca Global
        </h1>
        <p className="text-gray-600">
          Busque por mercados, clientes, concorrentes e leads em todo o sistema
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros Avançados
        </button>

        <button
          onClick={() => setShowSaved(!showSaved)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showSaved
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Save className="w-5 h-5" />
          Filtros Salvos
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <History className="w-5 h-5" />
          Histórico
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mercados, clientes, concorrentes, leads..."
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Digite para buscar em todas as entidades do sistema
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Mercados</div>
          <div className="text-2xl font-bold text-gray-900">-</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Clientes</div>
          <div className="text-2xl font-bold text-blue-600">-</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Concorrentes</div>
          <div className="text-2xl font-bold text-red-600">-</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Leads</div>
          <div className="text-2xl font-bold text-green-600">-</div>
        </div>
      </div>
    </div>
  );
}
