'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  type: FeedbackType;
  title: string;
  message: string;
}

/**
 * FeedbackModal - Modal de feedback visual
 *
 * Substitui toasts pequenos por modal centralizado e destacado
 */
export function FeedbackModal({ open, onClose, type, title, message }: FeedbackModalProps) {
  // Configurações por tipo
  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const { icon: Icon, iconColor, bgColor, borderColor, buttonColor } = config[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          {/* Ícone grande */}
          <div className={`rounded-full ${bgColor} p-4 border-2 ${borderColor}`}>
            <Icon className={`h-12 w-12 ${iconColor}`} />
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

          {/* Mensagem */}
          <p className="text-gray-600 text-base max-w-sm">{message}</p>

          {/* Botão OK */}
          <Button onClick={onClose} className={`w-full ${buttonColor} text-white mt-4`} size="lg">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
