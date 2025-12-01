'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyTableToClipboard, type ClipboardColumn } from '@/lib/clipboard';

interface CopyButtonProps {
  data: Record<string, any>[];
  columns: ClipboardColumn[];
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Botão para copiar dados de tabela para clipboard
 * Formato TSV (Tab-Separated Values) compatível com Excel, Google Sheets, etc.
 */
export function CopyButton({
  data,
  columns,
  label = 'Copiar',
  variant = 'outline',
  size = 'default',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    if (data.length === 0) {
      toast.error('Nenhum dado para copiar');
      return;
    }

    try {
      setIsLoading(true);
      await copyTableToClipboard(data, columns);

      setCopied(true);
      toast.success(
        `${data.length} registro${data.length !== 1 ? 's' : ''} copiado${data.length !== 1 ? 's' : ''}!`,
        {
          description: 'Cole os dados em Excel, Google Sheets ou qualquer editor',
        }
      );

      // Resetar ícone após 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar dados:', error);
      toast.error('Erro ao copiar dados', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={data.length === 0 || isLoading}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
