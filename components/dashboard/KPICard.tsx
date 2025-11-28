'use client';

import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  onClick?: () => void;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'indigo' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  red: 'bg-red-50 text-red-600',
};

export function KPICard({ title, value, icon: Icon, onClick, color = 'blue' }: KPICardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString('pt-BR')}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
