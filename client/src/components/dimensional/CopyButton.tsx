/**
 * CopyButton - Botão universal de cópia
 * Suporta: texto, markdown, JSON, CSV
 * 100% Funcional
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { FormatoCopia } from '@/shared/types/dimensional';

interface CopyButtonProps {
  dados: any;
  formatos?: FormatoCopia[];
  formatoPadrao?: FormatoCopia;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({
  dados,
  formatos = ['texto', 'markdown', 'json', 'csv'],
  formatoPadrao = 'texto',
  label,
  variant = 'outline',
  size = 'sm',
  className
}: CopyButtonProps) {
  const [copiado, setCopiado] = useState(false);
  const { toast } = useToast();

  const copiar = async (formato: FormatoCopia) => {
    try {
      let conteudo: string;

      switch (formato) {
        case 'texto':
          conteudo = formatarTexto(dados);
          break;
        case 'markdown':
          conteudo = formatarMarkdown(dados);
          break;
        case 'json':
          conteudo = JSON.stringify(dados, null, 2);
          break;
        case 'csv':
          conteudo = formatarCSV(dados);
          break;
        default:
          conteudo = String(dados);
      }

      await navigator.clipboard.writeText(conteudo);

      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);

      toast({
        title: 'Copiado!',
        description: `Conteúdo copiado como ${formato.toUpperCase()}`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o conteúdo',
        variant: 'destructive'
      });
    }
  };

  // Se tem apenas um formato, mostrar botão simples
  if (formatos.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => copiar(formatos[0])}
      >
        {copiado ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {label || 'Copiado'}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            {label || 'Copiar'}
          </>
        )}
      </Button>
    );
  }

  // Se tem múltiplos formatos, mostrar dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {copiado ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              {label || 'Copiar'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formatos.map(formato => (
          <DropdownMenuItem
            key={formato}
            onClick={() => copiar(formato)}
          >
            Copiar como {formato.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// HELPERS DE FORMATAÇÃO
// ============================================================================

function formatarTexto(dados: any): string {
  if (typeof dados === 'string') return dados;
  if (typeof dados === 'number') return dados.toString();
  if (typeof dados === 'boolean') return dados ? 'Sim' : 'Não';
  if (dados === null || dados === undefined) return 'N/A';

  if (Array.isArray(dados)) {
    return dados.map((item, index) => {
      if (typeof item === 'object') {
        return `${index + 1}. ${Object.values(item).join(' - ')}`;
      }
      return `${index + 1}. ${item}`;
    }).join('\n');
  }

  if (typeof dados === 'object') {
    return Object.entries(dados)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  return String(dados);
}

function formatarMarkdown(dados: any): string {
  if (typeof dados === 'string' || typeof dados === 'number' || typeof dados === 'boolean') {
    return String(dados);
  }

  if (dados === null || dados === undefined) return 'N/A';

  if (Array.isArray(dados)) {
    if (dados.length > 0 && typeof dados[0] === 'object') {
      const keys = Object.keys(dados[0]);
      let md = `| ${keys.join(' | ')} |\n`;
      md += `| ${keys.map(() => '---').join(' | ')} |\n`;
      dados.forEach(item => {
        const valores = keys.map(key => item[key] || 'N/A');
        md += `| ${valores.join(' | ')} |\n`;
      });
      return md;
    }
    return dados.map(item => `- ${item}`).join('\n');
  }

  if (typeof dados === 'object') {
    return Object.entries(dados)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n\n');
  }

  return String(dados);
}

function formatarCSV(dados: any): string {
  if (!Array.isArray(dados)) {
    dados = [dados];
  }

  if (dados.length === 0) return '';

  if (typeof dados[0] === 'object') {
    const keys = Object.keys(dados[0]);
    const linhas: string[] = [];
    linhas.push(keys.map(k => `"${k}"`).join(';'));
    dados.forEach(item => {
      const valores = keys.map(key => {
        const valor = item[key];
        if (valor === null || valor === undefined) return '""';
        return `"${String(valor).replace(/"/g, '""')}"`;
      });
      linhas.push(valores.join(';'));
    });
    return '\uFEFF' + linhas.join('\n');
  }

  return '\uFEFF' + dados.map(item => `"${item}"`).join('\n');
}
