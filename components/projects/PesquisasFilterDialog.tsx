'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Download, FileText } from 'lucide-react';

interface Pesquisa {
  id: number;
  nome: string;
  totalClientes: number;
  leadsCount: number;
  mercadosCount: number;
  concorrentesCount: number;
}

interface PesquisasFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number; // Não usado por enquanto
  pesquisas: Pesquisa[];
  mode: 'report' | 'export';
  onConfirm: (pesquisaIds: number[]) => void;
  isLoading?: boolean;
}

export function PesquisasFilterDialog({
  isOpen,
  onClose,
  projectId: _projectId,
  pesquisas,
  mode,
  onConfirm,
  isLoading = false,
}: PesquisasFilterDialogProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Calcular total de registros (useMemo ao invés de useEffect)
  const totalRecords = useMemo(() => {
    const selected = pesquisas.filter((p) => selectedIds.includes(p.id));
    return selected.reduce(
      (sum, p) =>
        sum +
        (p.totalClientes || 0) +
        (p.leadsCount || 0) +
        (p.mercadosCount || 0) +
        (p.concorrentesCount || 0),
      0
    );
  }, [selectedIds, pesquisas]);

  // Selecionar todas por padrão ao abrir
  useEffect(() => {
    if (isOpen && pesquisas.length > 0 && selectedIds.length === 0) {
      // Usar setTimeout para evitar setState em render
      const timer = setTimeout(() => {
        setSelectedIds(pesquisas.map((p) => p.id));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, pesquisas]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pesquisas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pesquisas.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    onConfirm(selectedIds);
  };

  const isOverLimit = mode === 'report' && totalRecords > 10000;
  const canConfirm = selectedIds.length > 0 && !isLoading; // Permitir mesmo com > 10k (backend gera múltiplos PDFs)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'report' ? (
              <>
                <FileText className="w-5 h-5" />
                Selecionar Pesquisas para Relatório
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Selecionar Pesquisas para Exportação
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Resumo */}
          <div
            className={`p-4 rounded-lg border ${isOverLimit ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <div className="flex items-start gap-3">
              {isOverLimit ? (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">
                  {selectedIds.length} de {pesquisas.length} pesquisas selecionadas
                </div>
                <div className="text-sm text-gray-700">
                  Total de registros:{' '}
                  <span className="font-semibold">{totalRecords.toLocaleString('pt-BR')}</span>
                </div>
                {mode === 'report' && (
                  <div className="text-xs text-gray-600 mt-1">
                    {isOverLimit ? (
                      <span className="text-amber-600 font-medium">
                        ℹ️ Serão gerados múltiplos PDFs em um arquivo ZIP (1 PDF por pesquisa).
                      </span>
                    ) : (
                      <span className="text-green-600">✓ Será gerado 1 PDF consolidado.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão Selecionar Todas */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              id="select-all"
              checked={selectedIds.length === pesquisas.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Selecionar todas
            </label>
          </div>

          {/* Lista de Pesquisas */}
          <div className="space-y-2">
            {pesquisas.map((pesquisa) => {
              const recordCount =
                (pesquisa.totalClientes || 0) +
                (pesquisa.leadsCount || 0) +
                (pesquisa.mercadosCount || 0) +
                (pesquisa.concorrentesCount || 0);

              return (
                <div
                  key={pesquisa.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    selectedIds.includes(pesquisa.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Checkbox
                    id={`pesquisa-${pesquisa.id}`}
                    checked={selectedIds.includes(pesquisa.id)}
                    onCheckedChange={() => handleToggle(pesquisa.id)}
                    className="mt-1"
                  />
                  <label htmlFor={`pesquisa-${pesquisa.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium text-sm mb-1">{pesquisa.nome}</div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>Total: {recordCount.toLocaleString('pt-BR')} registros</div>
                      <div className="flex gap-3">
                        <span>Clientes: {pesquisa.totalClientes || 0}</span>
                        <span>Leads: {pesquisa.leadsCount || 0}</span>
                        <span>Mercados: {pesquisa.mercadosCount || 0}</span>
                        <span>Concorrentes: {pesquisa.concorrentesCount || 0}</span>
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {isLoading ? (
              'Processando...'
            ) : mode === 'report' ? (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
