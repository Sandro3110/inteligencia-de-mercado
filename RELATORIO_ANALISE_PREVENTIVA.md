# Relatório de Análise Preventiva

**Total de arquivos:** 91
**Arquivos com problemas:** 20
**Total de problemas:** 81


## client/src/components/BrowseInline.tsx

- **Linha 112**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 116**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 121**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 123**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 32**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/components/EditEntidadeDialog.tsx

- **Linha 87**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 88**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 89**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 90**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 91**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 92**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 93**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 94**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 95**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 96**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 51**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc
- **Linha 11**: Interface Entidade local (deve usar canônica)
  - Correção: import { Entidade } from '@shared/types/entidade';

## client/src/components/EditMercadoDialog.tsx

- **Linha 119**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc

## client/src/components/EditProdutoDialog.tsx

- **Linha 77**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 87**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 101**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 111**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 151**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 159**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 14**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';
- **Linha 130**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 131**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 132**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 133**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 134**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined
- **Linha 146**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc

## client/src/components/EntidadeDetailsSheet.tsx

- **Linha 407**: Propriedade 'enriquecido' (deve ser 'enriquecido_em')
  - Correção: Usar entidade.enriquecido_em
- **Linha 491**: Propriedade 'origem_dados' (deve ser 'origem_data')
  - Correção: Usar .origem_data
- **Linha 306**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...
- **Linha 308**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...
- **Linha 310**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...

## client/src/components/ProdutoDetailsSheet.tsx

- **Linha 84**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 88**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 33**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/components/dimensional/CopyButton.tsx

- **Linha 67**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 73**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 16**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/components/dimensional/ExportButton.tsx

- **Linha 65**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 71**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 16**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/pages/AnaliseMercado.tsx

- **Linha 40**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc
- **Linha 45**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc
- **Linha 47**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc

## client/src/pages/DesktopTurboPage.tsx

- **Linha 152**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 202**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 212**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 45**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';
- **Linha 285**: Acesso incorreto a dados paginados (.projetos em vez de .data)
  - Correção: Usar .data para acessar array de resultados
- **Linha 304**: Acesso incorreto a dados paginados (.projetos em vez de .data)
  - Correção: Usar .data para acessar array de resultados

## client/src/pages/DetalhesEntidade.tsx

- **Linha 54**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc
- **Linha 58**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc
- **Linha 62**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc

## client/src/pages/DocumentacaoPage.tsx

- **Linha 31**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 38**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 49**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 156**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 163**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 4**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/pages/EnriquecimentoPage.tsx

- **Linha 19**: Interface Entidade local (deve usar canônica)
  - Correção: import { Entidade } from '@shared/types/entidade';

## client/src/pages/EntidadesListPage.tsx

- **Linha 130**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 40**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';
- **Linha 357**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...
- **Linha 451**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...
- **Linha 453**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...

## client/src/pages/EntidadesPage.tsx

- **Linha 44**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 74**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 104**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 11**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/pages/ImportacaoPage.tsx

- **Linha 203**: Uso de || null (deve ser || undefined para Zod)
  - Correção: Usar || undefined

## client/src/pages/MercadosPage.tsx

- **Linha 62**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 91**: Toast com sintaxe shadcn/ui (deve usar sonner)
  - Correção: Usar toast.success('mensagem') do sonner
- **Linha 12**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';
- **Linha 30**: Router singular (deve ser plural)
  - Correção: Usar trpc.entidades., trpc.projetos., etc

## client/src/pages/ProdutosListPage.tsx

- **Linha 36**: Import de useToast (deve usar sonner)
  - Correção: import { toast } from 'sonner';

## client/src/pages/pesquisas/PesquisasPage.tsx

- **Linha 308**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...

## client/src/pages/projetos/ProjetosPage.tsx

- **Linha 287**: Comparação numérica sem null check
  - Correção: Adicionar verificação: value != null ? value >= X : ...
