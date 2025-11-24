# Arquitetura Modular: DetailPopup.tsx

**Componente Original:** 925 linhas
**Estratégia:** Dividir em 10+ arquivos modulares

---

## 📊 Análise da Estrutura Atual

### Responsabilidades Identificadas

1. **Lógica de Dados (Queries & Mutations)**
   - 4 queries tRPC (history para cada tipo + produtos)
   - 3 mutations (validação para cada tipo)
   - Invalidação de cache

2. **Funções Helper**
   - `getTypeLabel()` - Label do tipo de entidade
   - `getStatusBadge()` - Badge de status de validação
   - `getLeadStageBadge()` - Badge de estágio do lead
   - `getChangeIcon()` - Ícone de mudança no histórico
   - `handleValidate()` - Handler de validação
   - `handleDiscard()` - Handler de descarte

3. **Seções de UI**
   - Header (com badges e informações principais)
   - Tab "Detalhes" (informações completas)
     - Informações Básicas
     - Contato
     - Localização + Mini Mapa
     - Produtos e Serviços
     - Informações Financeiras
     - Validação
     - Qualidade
     - Metadados
   - Tab "Histórico"
   - Tab "Produtos" (apenas clientes)
   - Footer com ações
   - Dialog de confirmação

---

## 🏗️ Proposta de Arquitetura Modular

### Estrutura de Diretórios

```
components/
├── detail-popup/
│   ├── DetailPopup.tsx                    # Componente principal (orquestrador)
│   ├── types.ts                           # Tipos e interfaces
│   ├── constants.ts                       # Constantes
│   ├── hooks/
│   │   ├── useDetailPopupData.ts         # Hook para queries
│   │   └── useDetailPopupActions.ts      # Hook para mutations
│   ├── utils/
│   │   ├── badges.tsx                    # Funções de badges
│   │   └── formatters.ts                 # Formatadores
│   ├── components/
│   │   ├── DetailPopupHeader.tsx         # Header
│   │   ├── DetailPopupFooter.tsx         # Footer
│   │   ├── DiscardDialog.tsx             # Dialog de confirmação
│   │   └── tabs/
│   │       ├── DetailsTab.tsx            # Tab de detalhes (orquestrador)
│   │       ├── HistoryTab.tsx            # Tab de histórico
│   │       ├── ProductsTab.tsx           # Tab de produtos
│   │       └── sections/
│   │           ├── BasicInfoSection.tsx
│   │           ├── ContactSection.tsx
│   │           ├── LocationSection.tsx
│   │           ├── ProductsSection.tsx
│   │           ├── FinancialSection.tsx
│   │           ├── ValidationSection.tsx
│   │           ├── QualitySection.tsx
│   │           └── MetadataSection.tsx
│   └── index.ts                          # Barrel export
```

---

## 📦 Detalhamento dos Arquivos

### 1. `types.ts` (~50 linhas)

```typescript
export type EntityType = 'cliente' | 'concorrente' | 'lead';

export interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: Entity;
  type: EntityType;
}

export interface Entity {
  id: number;
  nome?: string;
  empresa?: string;
  validationStatus?: string;
  // ... todos os campos tipados
}

export interface HistoryEntry {
  id: number;
  changeType: string;
  // ...
}

// Mais interfaces...
```

### 2. `constants.ts` (~100 linhas)

```typescript
export const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-4 h-4',
  // ...
} as const;

export const STATUS_CONFIG = {
  rich: {
    label: 'Rico',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  // ...
} as const;

export const LEAD_STAGES = {
  novo: { label: 'Novo', color: 'bg-blue-100...' },
  // ...
} as const;

// Todas as constantes extraídas
```

### 3. `hooks/useDetailPopupData.ts` (~80 linhas)

```typescript
export function useDetailPopupData(item: Entity, type: EntityType, isOpen: boolean) {
  const { data: history = [] } = trpc.clientes.history.useQuery(
    { id: item?.id },
    { enabled: isOpen && type === 'cliente' && !!item?.id }
  );

  // Todas as queries consolidadas

  return {
    history: getCurrentHistory(type, history, concorrenteHistory, leadHistory),
    produtos,
    isLoading,
  };
}
```

### 4. `hooks/useDetailPopupActions.ts` (~120 linhas)

```typescript
export function useDetailPopupActions(type: EntityType, onClose: () => void) {
  const utils = trpc.useUtils();

  const validateMutation = trpc.clientes.updateValidation.useMutation({
    // ...
  });

  // Todas as mutations

  const handleValidate = useCallback((id: number) => {
    // Lógica consolidada
  }, [type, validateMutation, ...]);

  const handleDiscard = useCallback((id: number) => {
    // Lógica consolidada
  }, [type, ...]);

  return {
    handleValidate,
    handleDiscard,
    isValidating,
    isDiscarding,
  };
}
```

### 5. `utils/badges.tsx` (~150 linhas)

```typescript
export function getStatusBadge(status: string): JSX.Element {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const Icon = config.icon;

  return (
    <Badge className={config.color}>
      <Icon className={ICON_SIZES.SMALL} />
      {config.label}
    </Badge>
  );
}

export function getLeadStageBadge(stage: string): JSX.Element {
  // ...
}

export function getChangeIcon(changeType: string): JSX.Element {
  // ...
}
```

### 6. `components/DetailPopupHeader.tsx` (~100 linhas)

```typescript
export function DetailPopupHeader({ item, type, onClose, produtos }: Props) {
  const typeLabel = useMemo(() => getTypeLabel(type), [type]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50...">
      {/* Todo o conteúdo do header */}
    </div>
  );
}
```

### 7. `components/tabs/sections/BasicInfoSection.tsx` (~80 linhas)

```typescript
export function BasicInfoSection({ item }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Informações básicas */}
    </div>
  );
}
```

### 8. `components/tabs/DetailsTab.tsx` (~150 linhas)

```typescript
export function DetailsTab({ item, type, produtos }: Props) {
  return (
    <TabsContent value="details" className="p-6 space-y-6 mt-0">
      <BasicInfoSection item={item} />
      <ContactSection item={item} />
      <LocationSection item={item} />
      {/* ... outras seções */}
    </TabsContent>
  );
}
```

### 9. `DetailPopup.tsx` (Principal - ~150 linhas)

```typescript
export function DetailPopup({ isOpen, onClose, item, type }: DetailPopupProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { history, produtos, isLoading } = useDetailPopupData(item, type, isOpen);
  const { handleValidate, handleDiscard } = useDetailPopupActions(type, onClose);

  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50..." onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center...">
        <div className="bg-white rounded-xl...">
          <DetailPopupHeader
            item={item}
            type={type}
            onClose={onClose}
            produtos={produtos}
          />

          <Tabs defaultValue="details">
            <TabsList>
              {/* Tabs triggers */}
            </TabsList>

            <ScrollArea>
              <DetailsTab item={item} type={type} produtos={produtos} />
              <HistoryTab history={history} />
              {type === 'cliente' && <ProductsTab produtos={produtos} />}
            </ScrollArea>
          </Tabs>

          <DetailPopupFooter
            item={item}
            type={type}
            onValidate={handleValidate}
            onDiscard={() => setShowDiscardDialog(true)}
          />
        </div>
      </div>

      <DiscardDialog
        isOpen={showDiscardDialog}
        onClose={() => setShowDiscardDialog(false)}
        onConfirm={() => handleDiscard(item.id)}
      />
    </>
  );
}
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto                | Antes            | Depois                        |
| ---------------------- | ---------------- | ----------------------------- |
| **Arquivos**           | 1 arquivo        | 18 arquivos                   |
| **Linhas por arquivo** | 925 linhas       | 50-150 linhas                 |
| **Responsabilidades**  | Todas misturadas | Separadas e claras            |
| **Testabilidade**      | Difícil          | Fácil (cada módulo isolado)   |
| **Reutilização**       | Impossível       | Alta (hooks, utils, sections) |
| **Manutenibilidade**   | Baixa            | Alta                          |
| **Type Safety**        | Tipo 'any'       | Interfaces completas          |

---

## 🎯 Benefícios da Modularização

1. **Separação de Responsabilidades**
   - Cada arquivo tem uma única responsabilidade
   - Fácil de entender e modificar

2. **Reutilização**
   - Hooks podem ser usados em outros componentes
   - Sections podem ser reutilizadas
   - Utils são compartilháveis

3. **Testabilidade**
   - Cada módulo pode ser testado isoladamente
   - Mocks mais simples

4. **Manutenibilidade**
   - Mudanças localizadas
   - Menos risco de quebrar outras partes

5. **Performance**
   - Componentes menores re-renderizam menos
   - Code splitting mais eficiente

6. **Colaboração**
   - Múltiplos desenvolvedores podem trabalhar simultaneamente
   - Menos conflitos de merge

---

## 🚀 Plano de Execução

### Fase 1: Preparação (1h)

- [ ] Criar estrutura de diretórios
- [ ] Criar `types.ts` com todas as interfaces
- [ ] Criar `constants.ts` com todas as constantes

### Fase 2: Extração de Lógica (2h)

- [ ] Criar hooks (`useDetailPopupData`, `useDetailPopupActions`)
- [ ] Criar utils (`badges.tsx`, `formatters.ts`)

### Fase 3: Componentização (3h)

- [ ] Criar seções (8 arquivos de sections)
- [ ] Criar tabs (3 arquivos de tabs)
- [ ] Criar header, footer e dialog

### Fase 4: Integração (1.5h)

- [ ] Refatorar componente principal
- [ ] Criar barrel exports
- [ ] Testar integração

### Fase 5: Refinamento (0.5h)

- [ ] Adicionar documentação JSDoc
- [ ] Revisar type safety
- [ ] Commit final

**Total Estimado:** 8 horas (vs 10h da abordagem monolítica)

---

## ✅ Vantagens desta Abordagem

1. ✅ **Mais rápido** - Trabalho paralelo em múltiplos arquivos
2. ✅ **Mais organizado** - Estrutura clara e lógica
3. ✅ **Mais manutenível** - Mudanças localizadas
4. ✅ **Mais testável** - Módulos isolados
5. ✅ **Mais reutilizável** - Componentes e hooks compartilháveis
6. ✅ **Melhor performance** - Code splitting otimizado

---

**Recomendação:** Seguir esta arquitetura modular para DetailPopup.tsx e aplicar o mesmo padrão aos outros componentes gigantes (MercadoAccordionCard, CompararMercadosModal, etc.).
