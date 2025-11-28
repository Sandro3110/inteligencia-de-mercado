'use client';

import { Eye, Edit, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: number;
    nome: string;
    descricao: string | null;
    status: string;
    pesquisasCount: number;
    leadsCount: number;
    clientesCount: number;
  };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    active: 'Ativo',
    paused: 'Pausado',
    archived: 'Arquivado',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">{project.nome}</h3>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[project.status as keyof typeof statusColors] || statusColors.active
          }`}
        >
          {statusLabels[project.status as keyof typeof statusLabels] || 'Ativo'}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {project.descricao || 'Sem descrição'}
      </p>

      <div className="flex gap-4 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{project.pesquisasCount}</span>
          <span>pesquisas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">{project.leadsCount}</span>
          <span>leads</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">{project.clientesCount}</span>
          <span>clientes</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(project.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(project.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
