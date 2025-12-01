'use client';

import { Filter, Download } from 'lucide-react';

interface FiltersHeaderProps {
  title: string;
  icon: React.ReactNode;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
}

export function FiltersHeader({
  title,
  icon,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onExportExcel,
  onExportCSV,
}: FiltersHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Filtros Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white'
                : hasActiveFilters
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">•</span>
            )}
          </button>

          {/* Export Buttons */}
          {(onExportExcel || onExportCSV) && (
            <div className="flex items-center gap-2">
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              )}
              {onExportCSV && (
                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
