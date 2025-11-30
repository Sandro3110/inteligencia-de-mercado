# Implementação da Funcionalidade de Geoposição

## 📋 Resumo

Substituição completa da visualização de mapa por uma **tabela hierárquica de drill-down** com estrutura Região → Estado → Cidade, conforme proposta aprovada.

## ✅ Arquivos Criados/Modificados

### 1. Backend (API Layer)

#### `/server/routers/map-hierarchical.ts` (NOVO)

Router tRPC com dois endpoints principais:

**`getHierarchicalData`**

- Retorna dados organizados hierarquicamente (Região → Estado → Cidade)
- Parâmetros:
  - `projectId`: number | null
  - `pesquisaId`: number | null
  - `entityType`: 'clientes' | 'leads' | 'concorrentes'
  - `filters`: { setor, porte, qualidade }
- Retorna:
  ```typescript
  {
    regions: RegionData[],
    grandTotals: EntityCount
  }
  ```

**`getCityEntities`**

- Busca entidades específicas de uma cidade com paginação
- Parâmetros:
  - `cidade`: string
  - `uf`: string
  - `entityType`: 'clientes' | 'leads' | 'concorrentes'
  - `projectId`, `pesquisaId`
  - `page`, `pageSize`
- Retorna lista paginada de entidades

**Características:**

- Mapeamento correto de UF para Região (IBGE)
- Ordem de regiões: Sul → Sudeste → Centro-Oeste → Nordeste → Norte
- Suporte completo a filtros
- Queries otimizadas com Drizzle ORM

#### `/server/routers.ts` (MODIFICADO)

- Adicionado import do `mapHierarchicalRouter`
- Registrado no `appRouter` como `mapHierarchical`

### 2. Frontend (Componentes)

#### `/components/map/GeoTable.tsx` (NOVO)

Componente principal da tabela hierárquica:

**Funcionalidades:**

- ✅ Estrutura hierárquica de 3 níveis (Região → Estado → Cidade)
- ✅ Expand/collapse em cada nível
- ✅ Visual diferenciado por tipo de entidade:
  - Clientes: Azul 🏢
  - Leads: Verde 🎯
  - Concorrentes: Vermelho 👥
- ✅ Totalizadores em cada nível
- ✅ Duplo clique nas cidades abre modal com lista de entidades
- ✅ Loading states e error handling
- ✅ Empty state quando não há dados

**Props:**

```typescript
{
  projectId?: number;
  pesquisaId?: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  filters?: { setor, porte, qualidade };
  onCityClick?: (cidade: string, uf: string) => void;
}
```

#### `/components/map/EntityDetailCard.tsx` (NOVO)

Modal para exibir detalhes completos de uma entidade:

**Seções:**

- Localização (cidade, UF, coordenadas)
- Informações de contato (email, telefone, site)
- Informações adicionais (CNPJ, setor, porte, qualidade)
- Visual adaptado ao tipo de entidade

#### `/components/ErrorBoundary.tsx` (NOVO)

Componente para capturar e exibir erros da aplicação de forma amigável.

### 3. Página Principal

#### `/app/(app)/map/page.tsx` (REESCRITO)

Nova página de Geoposição com:

**Estrutura:**

1. **Header**
   - Título "Geoposição"
   - Botão de filtros
   - Botões de exportação (Excel, CSV)

2. **Painel de Filtros** (expansível)
   - Projeto (dropdown)
   - Pesquisa (dropdown, habilitado após selecionar projeto)
   - Setor (dropdown)
   - Porte (dropdown)
   - Qualidade (dropdown)
   - Botão "Limpar Filtros"

3. **Tabs**
   - Clientes (azul)
   - Leads (verde)
   - Concorrentes (vermelho)

4. **Área de Conteúdo**
   - Componente GeoTable
   - Atualiza automaticamente ao trocar tabs ou filtros

5. **Modais**
   - Modal de lista de entidades da cidade (duplo clique)
   - Modal de detalhes da entidade (duplo clique na lista)

**Funcionalidades:**

- ✅ Filtros globais aplicados a todos os níveis
- ✅ Troca de tabs sem perder filtros
- ✅ Integração com API tRPC
- ✅ Loading states
- ✅ Error handling
- ⏳ Exportação (preparado, mas não implementado - mostra toast)

## 🔄 Fluxo de Uso

1. **Acesso:** Menu lateral → "Geoposição"
2. **Filtrar:** Clicar em "Filtros" e selecionar critérios desejados
3. **Navegar:** Clicar nas regiões e estados para expandir
4. **Ver Detalhes:** Duplo clique em uma cidade para ver lista de entidades
5. **Ver Entidade:** Duplo clique em uma entidade para ver detalhes completos
6. **Trocar Tipo:** Usar tabs (Clientes/Leads/Concorrentes) para alternar visualização
7. **Exportar:** (Futuro) Clicar em Excel ou CSV para exportar dados

## 📊 Estrutura de Dados

### Hierarquia

```
Região (ex: Sul)
  └─ Estado (ex: SC)
      └─ Cidade (ex: Florianópolis)
          └─ Entidades (clientes/leads/concorrentes)
```

### Totalizadores

Cada nível exibe:

- Região: Total de entidades de todos os estados
- Estado: Total de entidades de todas as cidades
- Cidade: Total de entidades específicas

### Mapeamento de Regiões (IBGE)

- **Norte:** AC, AM, AP, PA, RO, RR, TO
- **Nordeste:** AL, BA, CE, MA, PB, PE, PI, RN, SE
- **Centro-Oeste:** DF, GO, MS, MT
- **Sudeste:** ES, MG, RJ, SP
- **Sul:** PR, RS, SC

## 🎨 Design

### Cores por Tipo de Entidade

- **Clientes:** Azul (#2563eb)
- **Leads:** Verde (#16a34a)
- **Concorrentes:** Vermelho (#dc2626)

### Interações

- **Hover:** Linha muda de cor
- **Click:** Expande/colapsa nível
- **Double Click (cidade):** Abre modal com lista
- **Double Click (entidade):** Abre modal com detalhes

## 🔧 Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **TypeScript**
- **tRPC** (API type-safe)
- **Drizzle ORM** (queries ao banco)
- **Tailwind CSS** (estilização)
- **Lucide React** (ícones)
- **Sonner** (toasts)

## 📝 Notas Técnicas

### Correções Aplicadas

1. Campo `qualidade` → `qualidadeClassificacao` (conforme schema)
2. Queries com `projectId` buscam todas as pesquisas do projeto
3. Tratamento de `null` vs `undefined` nos filtros
4. Validação de coordenadas e campos obrigatórios

### Pendências

1. **Exportação Excel/CSV:** Implementar lógica real (atualmente mostra toast)
2. **Performance:** Testar com grandes volumes de dados
3. **Paginação:** Considerar paginação para cidades com muitas entidades
4. **Busca:** Adicionar campo de busca por nome de cidade

### Melhorias Futuras

1. Salvar estado de expansão no localStorage
2. Adicionar gráficos de distribuição geográfica
3. Permitir ordenação por quantidade
4. Adicionar filtro por região/estado
5. Exportar apenas dados visíveis (com filtros aplicados)

## 🧪 Como Testar

1. **Iniciar servidor:**

   ```bash
   cd /home/ubuntu/inteligencia-de-mercado
   pnpm dev
   ```

2. **Acessar página:**
   - URL: `http://localhost:3000/map`
   - Menu: "Geoposição"

3. **Testar funcionalidades:**
   - [ ] Expandir/colapsar regiões
   - [ ] Expandir/colapsar estados
   - [ ] Duplo clique em cidade
   - [ ] Duplo clique em entidade
   - [ ] Trocar tabs
   - [ ] Aplicar filtros
   - [ ] Limpar filtros
   - [ ] Verificar totalizadores

4. **Verificar integração:**
   - [ ] Dados carregam corretamente
   - [ ] Filtros funcionam
   - [ ] Modais abrem/fecham
   - [ ] Loading states aparecem
   - [ ] Erros são tratados

## 📚 Referências

- **Proposta Original:** `/PROPOSTA_TABELA_DRILLDOWN.md`
- **Schema do Banco:** `/drizzle/schema.ts`
- **Router Principal:** `/server/routers.ts`
- **Componente Sidebar:** `/components/Sidebar.tsx` (já atualizado para "Geoposição")

## ✅ Checklist de Implementação

- [x] API endpoint `getHierarchicalData`
- [x] API endpoint `getCityEntities`
- [x] Componente `GeoTable`
- [x] Componente `EntityDetailCard`
- [x] Componente `ErrorBoundary`
- [x] Página `/map` reescrita
- [x] Tabs para tipos de entidade
- [x] Painel de filtros
- [x] Modal de lista de entidades
- [x] Modal de detalhes
- [x] Integração com tRPC
- [x] Tratamento de erros
- [x] Loading states
- [ ] Exportação Excel
- [ ] Exportação CSV
- [ ] Testes de performance
- [ ] Documentação de usuário

---

**Status:** ✅ Implementação completa e pronta para testes
**Data:** 30/11/2024
**Desenvolvedor:** Manus AI
