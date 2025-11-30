# Proposta: Tabela Drill-Down Hierárquica

**Autor:** Manus AI  
**Data:** 30 de Novembro de 2025  
**Projeto:** IntelMarket - Inteligência de Mercado

---

## 1. Visão Geral

Esta proposta apresenta uma solução alternativa ao mapa geográfico: uma **tabela drill-down hierárquica** que organiza dados de Clientes, Leads e Concorrentes por localização geográfica (Região → Estado → Cidade).

### Objetivos

A tabela drill-down visa proporcionar uma visualização estruturada e navegável dos dados de inteligência de mercado, permitindo que o usuário explore informações de forma hierárquica e intuitiva, sem depender de coordenadas geográficas ou bibliotecas de mapas complexas.

---

## 2. Estrutura Hierárquica

### Níveis de Drill-Down

A tabela será organizada em três níveis hierárquicos:

| Nível               | Descrição                    | Exemplo                                         |
| ------------------- | ---------------------------- | ----------------------------------------------- |
| **Nível 1: Região** | Agrupamento macro-geográfico | Sul, Sudeste, Centro-Oeste, Nordeste, Norte     |
| **Nível 2: Estado** | Unidades federativas         | SP, RJ, MG, RS, etc.                            |
| **Nível 3: Cidade** | Municípios                   | São Paulo, Rio de Janeiro, Belo Horizonte, etc. |

### Mapeamento de Regiões

As regiões seguirão a divisão oficial do IBGE:

- **Norte:** AC, AM, AP, PA, RO, RR, TO
- **Nordeste:** AL, BA, CE, MA, PB, PE, PI, RN, SE
- **Centro-Oeste:** DF, GO, MS, MT
- **Sudeste:** ES, MG, RJ, SP
- **Sul:** PR, RS, SC

---

## 3. Abas de Entidades

Cada nível da hierarquia terá **três abas** para filtrar os dados por tipo de entidade:

### Aba 1: Clientes

Exibe clientes cadastrados no nível selecionado (Região, Estado ou Cidade).

**Colunas:**

- Nome
- CNPJ
- Setor
- Porte
- Cidade/UF
- Status de Enriquecimento
- Ações (Ver Detalhes)

### Aba 2: Leads

Exibe leads identificados no nível selecionado.

**Colunas:**

- Nome
- Setor
- Porte
- Qualidade (Alta, Média, Baixa)
- Cidade/UF
- Mercado de Origem
- Ações (Ver Detalhes, Converter para Cliente)

### Aba 3: Concorrentes

Exibe concorrentes mapeados no nível selecionado.

**Colunas:**

- Nome
- Setor
- Porte
- Cidade/UF
- Mercado de Origem
- Ações (Ver Detalhes)

---

## 4. Visualização: Tabela Drill-Down + Cards

### 4.1 Dois Modos de Visualização

A página oferecerá dois modos de visualização dos dados:

**Modo 1: Tabela Drill-Down (Padrão)**

- Visualização hierárquica (Região → Estado → Cidade)
- Expansão/colapso de níveis
- Totalizadores em cada nível

**Modo 2: Cards (Duplo Clique)**

- Ao dar **duplo clique** em uma cidade, abre visualização em cards
- Reutiliza os mesmos componentes da página de resultados (`DataTable`, `DetailModal`)
- Mantém consistência visual e comportamental
- Mudanças nos componentes refletem em ambas as páginas

### 4.2 Componentes Reutilizados

Para garantir consistência, vamos reutilizar os componentes existentes:

| Componente    | Localização                           | Uso                                         |
| ------------- | ------------------------------------- | ------------------------------------------- |
| `DataTable`   | `/components/results/DataTable.tsx`   | Exibir entidades em formato de tabela       |
| `DetailModal` | `/components/results/DetailModal.tsx` | Modal de detalhes ao clicar em uma entidade |
| `FilterBar`   | `/components/results/FilterBar.tsx`   | Barra de filtros (opcional)                 |

**Benefício:** Se você modificar o `DetailModal` ou `DataTable`, as mudanças serão aplicadas automaticamente tanto na página de resultados quanto na página de geoposição.

## 5. Funcionalidades

### 5.1 Expansão/Colapso

- **Região:** Clique para expandir e ver Estados
- **Estado:** Clique para expandir e ver Cidades
- **Cidade:** Nível final, mostra entidades diretamente

### 5.2 Totalizadores

Cada linha mostrará totalizadores das entidades:

```
Sul (245 clientes, 1.240 leads, 890 concorrentes)
  ├─ PR (120 clientes, 580 leads, 420 concorrentes)
  │   ├─ Curitiba (80 clientes, 320 leads, 250 concorrentes)
  │   └─ Londrina (40 clientes, 260 leads, 170 concorrentes)
  └─ RS (125 clientes, 660 leads, 470 concorrentes)
```

### 5.3 Filtros Globais

Acima da tabela, haverá filtros para:

- **Projeto:** Dropdown com projetos disponíveis
- **Pesquisa:** Dropdown com pesquisas do projeto selecionado
- **Setor:** Dropdown com setores disponíveis
- **Porte:** Dropdown com portes (Pequeno, Médio, Grande)
- **Qualidade (Leads):** Dropdown (Alta, Média, Baixa)

### 5.4 Busca

Campo de busca para filtrar por nome de cidade, estado ou entidade.

### 5.5 Exportação

Botão para exportar dados visíveis para:

- **Excel (.xlsx):** Tabela completa com hierarquia
- **CSV:** Dados planificados

---

### 5.6 Duplo Clique para Cards

Ao dar **duplo clique** em uma cidade:

1. Abre modal/página com visualização em cards
2. Exibe entidades da cidade selecionada usando `DataTable`
3. Permite clicar em uma entidade para abrir `DetailModal`
4. Botão "Voltar" retorna para a tabela drill-down

**Fluxo:**

```
Tabela Drill-Down
  └─ Duplo clique em "Curitiba"
      └─ Abre Cards de Curitiba
          └─ Clique em "Empresa A"
              └─ Abre DetailModal com informações completas
```

## 6. Interface Visual

### Layout Proposto

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Visão Hierárquica                                       │
├─────────────────────────────────────────────────────────────┤
│  Filtros:                                                   │
│  [Projeto ▼] [Pesquisa ▼] [Setor ▼] [Porte ▼] [🔍 Buscar] │
├─────────────────────────────────────────────────────────────┤
│  Abas: [👥 Clientes] [🎯 Leads] [📈 Concorrentes]          │
├─────────────────────────────────────────────────────────────┤
│  ▼ Sul (245 clientes)                                       │
│    ▼ PR (120 clientes)                                      │
│      ▶ Curitiba (80 clientes)                               │
│      ▶ Londrina (40 clientes)                               │
│    ▶ RS (125 clientes)                                      │
│  ▶ Sudeste (1.240 clientes)                                 │
│  ▶ Centro-Oeste (320 clientes)                              │
│  ▶ Nordeste (580 clientes)                                  │
│  ▶ Norte (145 clientes)                                     │
├─────────────────────────────────────────────────────────────┤
│  Total: 2.530 clientes                    [📥 Exportar]    │
└─────────────────────────────────────────────────────────────┘
```

### Cores e Ícones

- **Clientes:** Azul (#3B82F6) com ícone 👥
- **Leads:** Verde/Amarelo/Cinza (#10B981/#F59E0B/#6B7280) com ícone 🎯
- **Concorrentes:** Vermelho (#EF4444) com ícone 📈

---

## 7. Arquitetura Técnica

### 7.1 API

**Endpoint:** `trpc.map.getHierarchicalData`

**Input:**

```typescript
{
  projectId?: number;
  pesquisaId?: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  filters?: {
    setor?: string;
    porte?: string;
    qualidade?: string;
  };
}
```

**Output:**

```typescript
{
  regions: [
    {
      name: 'Sul',
      states: [
        {
          uf: 'PR',
          cities: [
            {
              name: 'Curitiba',
              entities: [
                { id: 1, nome: 'Empresa A', ... },
                { id: 2, nome: 'Empresa B', ... }
              ],
              totals: { clientes: 80, leads: 320, concorrentes: 250 }
            }
          ],
          totals: { clientes: 120, leads: 580, concorrentes: 420 }
        }
      ],
      totals: { clientes: 245, leads: 1240, concorrentes: 890 }
    }
  ],
  grandTotals: { clientes: 2530, leads: 5420, concorrentes: 3890 }
}
```

### 7.2 Componentes

**Estrutura de Componentes:**

```
DrillDownTable/
├─ DrillDownTable.tsx          # Componente principal
├─ RegionRow.tsx               # Linha de região (nível 1)
├─ StateRow.tsx                # Linha de estado (nível 2)
├─ CityRow.tsx                 # Linha de cidade (nível 3)
├─ EntityTable.tsx             # Tabela de entidades
├─ EntityDetailModal.tsx       # Modal de detalhes
└─ ExportButton.tsx            # Botão de exportação
```

### 7.3 Estado

```typescript
const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
const [expandedStates, setExpandedStates] = useState<string[]>([]);
const [expandedCities, setExpandedCities] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState<'clientes' | 'leads' | 'concorrentes'>('clientes');
const [filters, setFilters] = useState({ ... });
```

---

## 8. Vantagens

### Comparação com Mapa

| Aspecto                   | Mapa Geográfico             | Tabela Drill-Down          |
| ------------------------- | --------------------------- | -------------------------- |
| **Dependências**          | Google Maps API, Leaflet    | Nenhuma biblioteca externa |
| **Performance**           | Lenta com muitos marcadores | Rápida, paginação nativa   |
| **Dados sem coordenadas** | Não exibe                   | Exibe normalmente          |
| **Navegação**             | Zoom, pan, cliques          | Expansão hierárquica       |
| **Exportação**            | Complexa                    | Simples (Excel, CSV)       |
| **Manutenção**            | Alta complexidade           | Baixa complexidade         |
| **Responsividade**        | Difícil em mobile           | Nativa em mobile           |

### Benefícios

1. **Sem dependência de coordenadas:** Funciona mesmo se latitude/longitude estiverem vazias
2. **Performance superior:** Não precisa renderizar milhares de marcadores
3. **Navegação intuitiva:** Estrutura familiar de árvore
4. **Exportação fácil:** Dados já estruturados para Excel/CSV
5. **Manutenção simples:** Código React puro, sem bibliotecas externas
6. **Mobile-friendly:** Tabelas responsivas funcionam bem em dispositivos móveis

---

## 9. Implementação

### Fase 1: API (1-2 horas)

1. Criar endpoint `getHierarchicalData` no router `map.ts`
2. Implementar query SQL com agrupamento por região/estado/cidade
3. Calcular totalizadores em cada nível
4. Adicionar filtros (projeto, pesquisa, setor, porte, qualidade)

### Fase 2: Componentes (2-3 horas)

1. Criar componente `DrillDownTable`
2. Implementar linhas hierárquicas (RegionRow, StateRow, CityRow)
3. Adicionar lógica de expansão/colapso
4. Implementar abas de entidades
5. Adicionar filtros globais

### Fase 3: Integração (30 minutos)

1. Substituir componente do mapa na página `/map`
2. Manter sidebar com estatísticas
3. Adicionar modal de detalhes de entidade

### Fase 4: Exportação (1 hora)

1. Implementar exportação para Excel
2. Implementar exportação para CSV
3. Adicionar botão de download

---

## 10. Checklist de Implementação

- [ ] Criar API `getHierarchicalData`
- [ ] Implementar query SQL com agrupamento
- [ ] Calcular totalizadores
- [ ] Criar componente `DrillDownTable`
- [ ] Implementar `RegionRow`
- [ ] Implementar `StateRow`
- [ ] Implementar `CityRow`
- [ ] Implementar `EntityTable`
- [ ] Adicionar lógica de expansão/colapso
- [ ] Implementar abas de entidades
- [ ] Adicionar filtros globais
- [ ] Implementar busca
- [ ] Criar modal de detalhes
- [ ] Implementar exportação Excel
- [ ] Implementar exportação CSV
- [ ] Integrar com página `/map`
- [ ] Remover componentes do mapa antigo
- [ ] Testar com dados reais
- [ ] Validar performance
- [ ] Testar responsividade mobile

---

## 11. Conclusão

A tabela drill-down hierárquica oferece uma solução robusta, performática e fácil de manter para visualizar dados de inteligência de mercado. Ao substituir o mapa geográfico por uma estrutura hierárquica, eliminamos dependências complexas e problemas de coordenadas, proporcionando uma experiência de usuário superior.

**Tempo estimado de implementação:** 4-6 horas

**Recomendação:** Implementar imediatamente para substituir o mapa problemático.

---

**Documento criado por Manus AI**
