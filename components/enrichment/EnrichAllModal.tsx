'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap } from 'lucide-react';

interface Pesquisa {
  id: number;
  nome: string;
  totalClientes: number;
}

interface EnrichAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pesquisas: Pesquisa[];
  isLoading?: boolean;
}

export function EnrichAllModal({
  isOpen,
  onClose,
  onConfirm,
  pesquisas,
  isLoading = false,
}: EnrichAllModalProps) {
  const totalClientes = pesquisas.reduce((sum, p) => sum + (p.totalClientes || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Enriquecer Todas as Pesquisas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Atenção</p>
              <p>
                Esta ação irá enriquecer <strong>{pesquisas.length} pesquisas</strong> com um total
                de <strong>{totalClientes} clientes</strong>. O processamento será feito em
                background e pode levar alguns minutos.
              </p>
            </div>
          </div>

          {/* Lista de pesquisas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pesquisas que serão enriquecidas:</h4>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-700">Pesquisa</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-700">Clientes</th>
                  </tr>
                </thead>
                <tbody>
                  {pesquisas.map((pesquisa) => (
                    <tr key={pesquisa.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2 text-gray-900">{pesquisa.nome}</td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {pesquisa.totalClientes || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• As pesquisas serão processadas em paralelo</li>
              <li>• Você pode fechar esta janela e continuar trabalhando</li>
              <li>• Você será notificado quando o processamento for concluído</li>
              <li>• O progresso pode ser acompanhado na página de cada pesquisa</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Confirmar Enriquecimento
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
