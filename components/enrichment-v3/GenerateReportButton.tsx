'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GenerateReportButtonProps {
  pesquisaId: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Botão para gerar relatório PDF com validação
 */
export function GenerateReportButton({ pesquisaId, size = 'md' }: GenerateReportButtonProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const validateMutation = trpc.reportsEnhanced.validate.useMutation();
  const generateMutation = trpc.reportsEnhanced.generateEnhancedReport.useMutation();

  const handleClick = async () => {
    setIsValidating(true);

    try {
      const validation = await validateMutation.mutateAsync({ pesquisaId });

      if (!validation.canGenerate) {
        toast.error(validation.warning || 'Não é possível gerar relatório');
        setIsValidating(false);
        return;
      }

      // Se tem aviso (em andamento), mostrar
      if (validation.warning) {
        toast.warning(validation.warning);
      }

      setIsValidating(false);
      setIsGenerating(true);

      // Gerar relatório
      const result = await generateMutation.mutateAsync({ pesquisaId });

      setReportData(result);
      setShowModal(true);
      setIsGenerating(false);

      toast.success(`Relatório gerado! ${result.metadata.tokens} tokens`);
    } catch (error: any) {
      setIsValidating(false);
      setIsGenerating(false);
      toast.error(error.message || 'Erro ao gerar relatório');
    }
  };

  const isLoading = isValidating || isGenerating;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        size={size}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isValidating ? 'Validando...' : 'Gerando...'}
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </>
        )}
      </Button>

      {/* Modal com relatório */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório de Inteligência de Mercado</DialogTitle>
            <DialogDescription>
              Análise gerada por IA - {reportData?.metadata?.model}
            </DialogDescription>
          </DialogHeader>

          {reportData && (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{reportData.analiseIA}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
