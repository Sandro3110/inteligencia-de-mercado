import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AsyncButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * Função assíncrona a ser executada ao clicar
   */
  onClick: () => Promise<void>;

  /**
   * Texto a ser exibido durante o loading
   * @default "Processando..."
   */
  loadingText?: string;

  /**
   * Ícone a ser exibido quando NÃO está em loading
   */
  icon?: React.ReactNode;

  /**
   * Se true, mostra apenas o spinner sem texto durante loading
   * @default false
   */
  iconOnly?: boolean;
}

/**
 * Botão com gerenciamento automático de estado de loading
 *
 * @example
 * ```tsx
 * <AsyncButton
 *   onClick={async () => {
 *     await fetch('/api/save', { method: 'POST' });
 *   }}
 *   loadingText="Salvando..."
 *   icon={<Save className="mr-2 h-4 w-4" />}
 * >
 *   Salvar
 * </AsyncButton>
 * ```
 */
export function AsyncButton({
  onClick,
  loadingText = 'Processando...',
  icon,
  iconOnly = false,
  children,
  disabled,
  className,
  ...props
}: AsyncButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      {...props}
      className={cn(className)}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn('h-4 w-4 animate-spin', !iconOnly && 'mr-2')} />
          {!iconOnly && loadingText}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Button>
  );
}
