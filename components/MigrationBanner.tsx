'use client';

import { useState } from 'react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MigrationBannerProps {
  newUrl: string;
  featureName: string;
}

/**
 * Banner de aviso sobre migração para nova versão
 * Mostra aviso sobre nova funcionalidade e permite redirecionar
 */
export function MigrationBanner({ newUrl, featureName }: MigrationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Nova Versão Disponível! 🎉</h3>
            <p className="text-sm text-blue-800 mb-3">
              Implementamos uma nova experiência de análise de {featureName} com drill-down em 3
              níveis, exportação avançada (Excel com múltiplas abas) e performance otimizada.
              Experimente agora!
            </p>
            <div className="flex items-center gap-3">
              <Link href={newUrl}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Usar Nova Versão
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Continuar usando versão antiga
              </Button>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
