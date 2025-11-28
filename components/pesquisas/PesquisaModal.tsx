'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CSVUpload } from './CSVUpload';

interface PesquisaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; descricao: string; csvData: string[][] }) => void;
  isLoading?: boolean;
}

export function PesquisaModal({ isOpen, onClose, onSubmit, isLoading }: PesquisaModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [step, setStep] = useState<'info' | 'upload'>('info');

  const handleFileSelect = (file: File, data: string[][]) => {
    setSelectedFile(file);
    setCsvData(data);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setCsvData(null);
  };

  const handleNext = () => {
    if (step === 'info' && nome.trim()) {
      setStep('upload');
    }
  };

  const handleBack = () => {
    setStep('info');
  };

  const handleSubmit = () => {
    if (!nome.trim() || !csvData) return;
    onSubmit({ nome, descricao, csvData });
  };

  const handleClose = () => {
    if (!isLoading) {
      setNome('');
      setDescricao('');
      setSelectedFile(null);
      setCsvData(null);
      setStep('info');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Pesquisa</DialogTitle>
          <DialogDescription>
            {step === 'info'
              ? 'Passo 1/2: Informações básicas da pesquisa'
              : 'Passo 2/2: Importar clientes via CSV'}
          </DialogDescription>
        </DialogHeader>

        {step === 'info' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Pesquisa *
              </label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Expansão Sul 2024"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o objetivo desta pesquisa..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleNext}
                disabled={!nome.trim() || isLoading}
                className="flex-1"
              >
                Próximo: Importar CSV
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CSVUpload
              onFileSelect={handleFileSelect}
              onClear={handleClearFile}
              selectedFile={selectedFile}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!csvData || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Criando...' : 'Criar Pesquisa'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
