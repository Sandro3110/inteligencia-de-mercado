'use client';

import { useState } from 'react';
import { Bell, Filter, History } from 'lucide-react';

export default function NotificationsPage() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Central de Notificações
        </h1>
        <p className="text-gray-600">
          Acompanhe todas as notificações e alertas do sistema em tempo real
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
          Filtros
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <History className="w-5 h-5" />
          Histórico
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Nenhuma notificação</p>
          <p className="text-sm">Você receberá notificações em tempo real aqui</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total de Notificações</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Não Lidas</div>
          <div className="text-2xl font-bold text-blue-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Hoje</div>
          <div className="text-2xl font-bold text-green-600">0</div>
        </div>
      </div>
    </div>
  );
}
