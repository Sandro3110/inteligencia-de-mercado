'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface CleanEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  stats: {
    totalClientes: number;
    clientesEnriquecidos: number;
    leadsCount: number;
    concorrentesCount: number;
    produtosCount: number;
    mercadosCount: number;
  };
}

export function CleanEnrichmentModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  stats,
}: CleanEnrichmentModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toUpperCase() === 'LIMPAR';

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Limpar Todos os Dados Enriquecidos?
                </h2>
                <p className="text-sm text-gray-600 mt-1">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Esta ação irá remover permanentemente todos os dados enriquecidos desta pesquisa.
            </p>
          </div>

          {/* What will be removed */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Esta ação irá:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Cancelar o enriquecimento em andamento</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>
                  Remover <strong>{stats.leadsCount} leads</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>
                  Remover <strong>{stats.concorrentesCount} concorrentes</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>
                  Remover <strong>{stats.produtosCount || 0} produtos</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>
                  Remover <strong>{stats.mercadosCount} mercados</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>
                  Resetar <strong>{stats.clientesEnriquecidos} clientes enriquecidos</strong>
                </span>
              </div>
            </div>
          </div>

          {/* What will be preserved */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ Os dados originais dos clientes (nome, CNPJ) serão <strong>preservados</strong>
            </p>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Para confirmar, digite <strong className="text-red-600">LIMPAR</strong>:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
              placeholder="Digite LIMPAR para confirmar"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Sim, Limpar Tudo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
