'use client';

import { useState } from 'react';
import { Zap, Clock, TrendingUp, Package, Users, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ValidationFeedback } from './ValidationFeedback';

interface EnrichConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pesquisaNome: string;
  totalClientes: number;
  isLoading?: boolean;
  validation?: {
    isValid: boolean;
    errors: Array<{ type: 'error' | 'warning'; message: string; details?: string }>;
    warnings: Array<{ type: 'error' | 'warning'; message: string; details?: string }>;
  };
}

/**
 * Modal de confirmação de enriquecimento com expectativas
 */
export function EnrichConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  pesquisaNome,
  totalClientes,
  isLoading = false,
  validation,
}: EnrichConfirmModalProps) {
  // Calcular expectativas
  const expectativas = {
    mercados: Math.min(Math.ceil(totalClientes * 0.015), 15), // ~1-2 mercados por 100 clientes, max 15
    produtos: totalClientes * 3, // 3 produtos por cliente
    concorrentes: Math.min(Math.ceil(totalClientes * 0.3), 250), // ~30% dos clientes, max 250
    leads: Math.min(Math.ceil(totalClientes * 0.15), 150), // ~15% dos clientes, max 150
  };

  // Calcular tempo estimado (2-3 segundos por cliente)
  const tempoMinutos = Math.ceil((totalClientes * 2.5) / 60);
  const tempoMaxMinutos = Math.ceil((totalClientes * 3.5) / 60);

  const hasErrors = validation && validation.errors.length > 0;
  const hasWarnings = validation && validation.warnings.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-purple-600" />
            Confirmar Enriquecimento
          </DialogTitle>
          <DialogDescription>
            Revise as informações antes de iniciar o enriquecimento da pesquisa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Validações */}
          {validation && (hasErrors || hasWarnings) && (
            <ValidationFeedback errors={validation.errors} warnings={validation.warnings} />
          )}

          {/* Resumo */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="font-semibold mb-3">📋 Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pesquisa:</span>
                <span className="font-medium">{pesquisaNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de clientes:</span>
                <span className="font-medium">{totalClientes}</span>
              </div>
            </div>
          </div>

          {/* Expectativas */}
          <div className="rounded-lg border bg-blue-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Expectativa de Geração
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Mercados:</span>
                <span className="font-medium">~{expectativas.mercados}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Produtos:</span>
                <span className="font-medium">~{expectativas.produtos}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">Concorrentes:</span>
                <span className="font-medium">~{expectativas.concorrentes}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Leads:</span>
                <span className="font-medium">~{expectativas.leads}</span>
              </div>
            </div>
          </div>

          {/* Tempo Estimado */}
          <div className="rounded-lg border bg-purple-50 p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Tempo Estimado
            </h3>
            <p className="text-sm text-gray-700">
              ~{tempoMinutos}-{tempoMaxMinutos} minutos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              O processamento ocorre em background. Você pode fechar a página e será notificado ao
              concluir.
            </p>
          </div>

          {/* Informações Importantes */}
          <div className="rounded-lg border bg-yellow-50 p-4">
            <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Informações Importantes</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>O enriquecimento utiliza IA e consome créditos da API OpenAI</li>
              <li>Os dados são salvos incrementalmente (não há perda em caso de interrupção)</li>
              <li>Você pode pausar e retomar o processo a qualquer momento</li>
              <li>Notificações serão enviadas a cada 15 minutos e ao concluir</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={hasErrors || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Iniciando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Confirmar e Iniciar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
