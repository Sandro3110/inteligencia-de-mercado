/**
 * Autocomplete inteligente para contexto de exportação
 * Item 10 do módulo de exportação inteligente
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, Users, Target, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  projectId?: number;
}

interface Suggestion {
  text: string;
  type: 'mercado' | 'cliente' | 'concorrente' | 'lead';
  icon: any;
  color: string;
}

export function SmartAutocomplete({ value, onChange, projectId }: SmartAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce para buscar sugestões
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, projectId]);

  const fetchSuggestions = async (query: string) => {
    // Buscar entidades que correspondem ao texto
    const results: Suggestion[] = [];

    // Simulação - em produção, usar tRPC query real
    if (query.toLowerCase().includes('embalagem')) {
      results.push({
        text: 'Embalagens Plásticas para Indústria Alimentícia',
        type: 'mercado',
        icon: Target,
        color: 'text-green-600'
      });
    }

    if (query.toLowerCase().includes('cliente')) {
      results.push({
        text: 'Clientes validados no mercado de Embalagens',
        type: 'cliente',
        icon: Users,
        color: 'text-blue-600'
      });
    }

    if (query.toLowerCase().includes('lead')) {
      results.push({
        text: 'Leads qualificados (score > 70)',
        type: 'lead',
        icon: TrendingUp,
        color: 'text-orange-600'
      });
    }

    setSuggestions(results);
    setShowDropdown(results.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setShowDropdown(false);
    setSelectedIndex(0);
  };

  return (
    <div className="relative">
      {/* Input principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Digite o contexto da exportação..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dropdown de sugestões */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 ${suggestion.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {suggestion.type}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Hint de atalhos */}
      {showDropdown && (
        <div className="absolute right-2 -bottom-6 text-xs text-slate-400">
          ↑↓ navegar • Enter selecionar • Esc fechar
        </div>
      )}
    </div>
  );
}
