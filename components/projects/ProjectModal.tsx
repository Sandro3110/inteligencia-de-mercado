'use client';

import { ProjectForm } from './ProjectForm';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; descricao: string; cor: string; nomePesquisa?: string }) => void;
  initialData?: {
    nome: string;
    descricao: string;
    cor: string;
  };
  isLoading?: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-[500px] mx-4 bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData
              ? 'Atualize as informações do projeto'
              : 'Crie um novo projeto para organizar suas pesquisas'}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Form */}
        <ProjectForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
