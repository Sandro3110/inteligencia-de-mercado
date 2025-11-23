/**
 * Modal de validação de limites de exportação
 * Item 8 do módulo de exportação inteligente
 */

import { AlertTriangle, Filter, Layers, Split } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";

interface LimitValidationProps {
  open: boolean;
  onClose: () => void;
  estimatedSize: number; // em MB
  recordCount: number;
  onReduceFields: () => void;
  onAddFilters: () => void;
  onSplitBatches: () => void;
  onProceedAnyway: () => void;
}

export function LimitValidation({
  open,
  onClose,
  estimatedSize,
  recordCount,
  onReduceFields,
  onAddFilters,
  onSplitBatches,
  onProceedAnyway,
}: LimitValidationProps) {
  const isVeryLarge = estimatedSize > 100;
  const isLarge = estimatedSize > 50;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <DialogTitle>
                {isVeryLarge
                  ? "Arquivo Muito Grande Detectado"
                  : "Arquivo Grande Detectado"}
              </DialogTitle>
              <DialogDescription>
                A exportação pode demorar vários minutos e consumir recursos
                significativos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Estatísticas */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Tamanho Estimado</p>
              <p className="text-2xl font-bold text-slate-900">
                {estimatedSize.toFixed(1)} MB
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total de Registros</p>
              <p className="text-2xl font-bold text-slate-900">
                {recordCount.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          {isVeryLarge && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <Badge variant="destructive" className="text-xs">
                Acima do limite recomendado (100 MB)
              </Badge>
            </div>
          )}
        </div>

        {/* Opções de otimização */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">
            Opções para Reduzir o Tamanho:
          </h4>

          {/* Opção 1: Reduzir campos */}
          <button
            onClick={() => {
              onReduceFields();
              onClose();
            }}
            className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-1">
                  Reduzir Campos Selecionados
                </h5>
                <p className="text-xs text-slate-600">
                  Voltar ao passo 3 e selecionar apenas os campos essenciais.
                  Pode reduzir o tamanho em até 60%.
                </p>
              </div>
            </div>
          </button>

          {/* Opção 2: Adicionar filtros */}
          <button
            onClick={() => {
              onAddFilters();
              onClose();
            }}
            className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-1">
                  Adicionar Filtros
                </h5>
                <p className="text-xs text-slate-600">
                  Voltar ao passo 2 e adicionar filtros para reduzir o número de
                  registros. Recomendado para exportações focadas.
                </p>
              </div>
            </div>
          </button>

          {/* Opção 3: Dividir em lotes */}
          <button
            onClick={() => {
              onSplitBatches();
              onClose();
            }}
            className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Split className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-1">
                  Dividir em Lotes
                </h5>
                <p className="text-xs text-slate-600">
                  Gerar múltiplos arquivos menores automaticamente. Ideal para
                  exportações muito grandes.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer com ações */}
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={isVeryLarge ? "destructive" : "default"}
            onClick={() => {
              onProceedAnyway();
              onClose();
            }}
          >
            {isVeryLarge ? "Prosseguir Mesmo Assim" : "Continuar"}
          </Button>
        </DialogFooter>

        {/* Aviso final */}
        {isVeryLarge && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-800">
              <strong>⚠️ Atenção:</strong> Exportações acima de 100 MB podem
              falhar ou demorar mais de 5 minutos. Recomendamos fortemente usar
              uma das opções de otimização acima.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
