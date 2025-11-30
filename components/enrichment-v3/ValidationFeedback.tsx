'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  details?: string;
}

interface ValidationFeedbackProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Componente para exibir feedback de validação
 */
export function ValidationFeedback({ errors, warnings }: ValidationFeedbackProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Erros (impedem início) */}
      {errors.map((error, index) => (
        <Alert key={`error-${index}`} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error.message}</AlertTitle>
          {error.details && <AlertDescription>{error.details}</AlertDescription>}
        </Alert>
      ))}

      {/* Avisos (não impedem início) */}
      {warnings.map((warning, index) => (
        <Alert
          key={`warning-${index}`}
          variant="default"
          className="border-yellow-500 bg-yellow-50"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">{warning.message}</AlertTitle>
          {warning.details && (
            <AlertDescription className="text-yellow-700">{warning.details}</AlertDescription>
          )}
        </Alert>
      ))}
    </div>
  );
}
