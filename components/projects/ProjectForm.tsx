'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ProjectFormProps {
  initialData?: {
    nome: string;
    descricao: string;
    cor: string;
  };
  onSubmit: (data: { nome: string; descricao: string; cor: string; nomePesquisa?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // yellow
  '#6366f1', // indigo
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
];

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  // Usar refs para inputs não controlados (sem re-render)
  const nomeRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLTextAreaElement>(null);
  const nomePesquisaRef = useRef<HTMLInputElement>(null);

  // Apenas cor precisa de estado visual
  const [cor, setCor] = useState(initialData?.cor || '#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nome = nomeRef.current?.value || '';
    const descricao = descricaoRef.current?.value || '';
    const nomePesquisa = nomePesquisaRef.current?.value || '';

    onSubmit({
      nome,
      descricao,
      cor,
      nomePesquisa: nomePesquisa.trim() || nome,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Projeto *
        </label>
        <input
          ref={nomeRef}
          id="nome"
          type="text"
          defaultValue={initialData?.nome || ''}
          placeholder="Ex: Expansão Regional 2024"
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          ref={descricaoRef}
          id="descricao"
          defaultValue={initialData?.descricao || ''}
          placeholder="Descreva o objetivo deste projeto..."
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {!initialData && (
        <div>
          <label htmlFor="nomePesquisa" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Pesquisa Inicial
          </label>
          <input
            ref={nomePesquisaRef}
            id="nomePesquisa"
            type="text"
            defaultValue=""
            placeholder="Deixe vazio para usar o nome do projeto"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Uma pesquisa inicial será criada automaticamente com este nome
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Projeto</label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setCor(presetColor)}
              className={`w-8 h-8 rounded-full transition-all ${
                cor === presetColor ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: presetColor }}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Projeto'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
