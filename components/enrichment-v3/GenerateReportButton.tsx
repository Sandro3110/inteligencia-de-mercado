'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { FeedbackModal, FeedbackType } from '@/components/ui/FeedbackModal';
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
  console.log('🔵 [DEBUG] GenerateReportButton renderizado com pesquisaId:', pesquisaId);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Estado do FeedbackModal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const validateMutation = trpc.reportsEnhanced.validate.useMutation();
  const generateMutation = trpc.reportsEnhanced.generateEnhancedReport.useMutation();

  console.log('🔵 [DEBUG] Mutations definidas:', {
    validateMutation: !!validateMutation,
    generateMutation: !!generateMutation,
  });

  const handleClick = async () => {
    console.log('🔵 [DEBUG] Botão clicado! pesquisaId:', pesquisaId);
    setIsValidating(true);
    console.log('🔵 [DEBUG] Estado isValidating definido como true');

    try {
      console.log('🔵 [DEBUG] Chamando validateMutation.mutateAsync...');
      const validation = await validateMutation.mutateAsync({ pesquisaId });
      console.log('🔵 [DEBUG] Validação recebida:', validation);

      if (!validation.canGenerate) {
        console.log('⚠️ [DEBUG] Validação falhou! canGenerate=false');
        setFeedbackType('error');
        setFeedbackTitle('Não é possível gerar relatório');
        setFeedbackMessage(
          validation.warning || 'Verifique se há dados suficientes para gerar o relatório.'
        );
        setShowFeedback(true);
        setIsValidating(false);
        return;
      }

      // Se tem aviso (em andamento), mostrar
      if (validation.warning) {
        setFeedbackType('warning');
        setFeedbackTitle('Enriquecimento em andamento');
        setFeedbackMessage(validation.warning);
        setShowFeedback(true);
      }

      setIsValidating(false);
      setIsGenerating(true);

      // Gerar relatório
      console.log('🔵 [DEBUG] Chamando generateMutation.mutateAsync...');
      const result = await generateMutation.mutateAsync({ pesquisaId });
      console.log('🔵 [DEBUG] Relatório gerado:', result);

      setIsGenerating(false);

      // Baixar PDF
      const pdfBlob = new Blob([Uint8Array.from(atob(result.pdf), (c) => c.charCodeAt(0))], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackType('success');
      setFeedbackTitle('Relatório gerado com sucesso!');
      setFeedbackMessage(
        `PDF baixado com sucesso! Análise gerada com ${result.metadata.tokens} tokens usando ${result.metadata.model}.`
      );
      setShowFeedback(true);
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro capturado:', error);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
      setIsValidating(false);
      setIsGenerating(false);
      setFeedbackType('error');
      setFeedbackTitle('Erro ao gerar relatório');
      setFeedbackMessage(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
      setShowFeedback(true);
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

      {/* Modal de Feedback */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
      />

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
