# Proposta de Arquitetura: Browse Filtrado + Card de Detalhes

**Data:** 04 de dezembro de 2025  
**Autor:** Análise de Engenharia de Dados e Arquitetura da Informação  
**Objetivo:** Implementar fluxo completo: Gestão de Conteúdo → Browse Filtrado → Card de Detalhes (duplo click)

---

## 🎯 Visão Geral do Fluxo

```
┌─────────────────────────┐
│  Gestão de Conteúdo     │
│  (Desktop Turbo)        │
│                         │
│  [Filtros]              │
│  - Projeto              │
│  - Pesquisa             │
│                         │
│  [Totalizadores]        │
│  👥 Clientes: 20/20     │
│  ➕ Leads: 7/7          │
│  🏢 Concorrentes: 5/5   │
│  📦 Produtos: 3/3       │
│  🎯 Mercados: 1/1       │
│  📁 Projetos: 7/7       │
│  🔍 Pesquisas: 4/4      │
└────────┬────────────────┘
         │ CLICK
         ▼
┌─────────────────────────┐
│  Browse Filtrado        │
│  (EntidadesListPage)    │
│                         │
│  [Filtros Herdados]     │
│  - Projeto: X           │
│  - Pesquisa: Y          │
│                         │
│  [Filtros Específicos]  │
│  - Tipo: cliente/lead   │
│  - Busca: nome, CNPJ    │
│  - Cidade/UF            │
│  - Setor                │
│                         │
│  [Lista de Registros]   │
│  ┌─────────────────┐    │
│  │ Ambev S.A.      │    │
│  │ CNPJ: 07.526... │    │
│  │ SP - Bebidas    │    │
│  └─────────────────┘    │
└────────┬────────────────┘
         │ DUPLO CLICK
         ▼
┌─────────────────────────┐
│  Card de Detalhes       │
│  (Modal/Drawer)         │
│                         │
│  [Visão 360°]           │
│  - Dados cadastrais     │
│  - Dados enriquecidos   │
│  - Contexto comercial   │
│  - Produtos/Mercados    │
│  - Histórico            │
│  - Recomendações IA     │
│                         │
│  [Ações]                │
│  - Editar               │
│  - Exportar             │
│  - Enriquecer           │
│  - Converter (lead→cli) │
└─────────────────────────┘
```

---

## 📊 Análise do Schema do Banco

### Tabelas Principais

| Tabela | Registros | Propósito | Status |
|--------|-----------|-----------|--------|
| `dim_entidade` | 32 | Tabela mestre de todas as entidades | ✅ OK |
| `dim_lead` | 7 | Leads específicos | ⚠️ Redundante |
| `dim_concorrente` | 5 | Concorrentes específicos | ⚠️ Redundante |
| `dim_produto` | 3 | Produtos | ✅ OK |
| `dim_mercado` | 1 | Mercados | ✅ OK |
| `dim_projeto` | 7 | Projetos | ✅ OK |
| `dim_pesquisa` | 4 | Pesquisas | ✅ OK |
| `fato_entidade_contexto` | 32 | Vincula entidades a projetos/pesquisas | ✅ OK |
| `fato_entidade_produto` | 0 | Vincula entidades a produtos | ⚠️ Vazio |
| `fato_entidade_competidor` | 0 | Vincula entidades a concorrentes | ⚠️ Vazio |

### Campos Importantes de `dim_entidade`

```sql
dim_entidade (48 campos)
├── Identificação
│   ├── id (PK)
│   ├── entidade_hash (unique)
│   ├── tipo_entidade (cliente|lead|concorrente)
│   ├── nome
│   ├── nome_fantasia
│   ├── cnpj, email, telefone, site
│
├── Localização
│   ├── cidade, uf
│   ├── → FK para dim_geografia (não implementado)
│
├── Dados Comerciais
│   ├── porte, setor, produto_principal
│   ├── segmentacao_b2b_b2c
│   ├── num_filiais, num_lojas, num_funcionarios
│
├── Qualidade de Dados
│   ├── score_qualidade_dados
│   ├── validacao_cnpj, validacao_email, validacao_telefone
│   ├── campos_faltantes
│   ├── ultima_validacao
│   ├── status_qualificacao_id → FK dim_status_qualificacao
│
├── Enriquecimento IA
│   ├── enriquecido_em, enriquecido_por
│   ├── cache_hit, cache_expires_at
│
├── Rastreabilidade
│   ├── origem_tipo, origem_arquivo, origem_processo
│   ├── origem_prompt, origem_confianca
│   ├── origem_data, origem_usuario_id
│   ├── importacao_id → FK dim_importacao
│
└── Auditoria
    ├── created_at, created_by
    ├── updated_at, updated_by
    ├── deleted_at, deleted_by
```

---

## 🔍 Análise das APIs Existentes

### APIs Funcionais

| API | Endpoint | Funcionalidade | Status |
|-----|----------|----------------|--------|
| `totalizadores.js` | `/api/totalizadores` | Conta entidades por tipo + filtros | ✅ OK |
| `projetos.js` | `/api/projetos` | CRUD de projetos | ✅ OK |
| `pesquisas.js` | `/api/pesquisas` | CRUD de pesquisas | ✅ OK |
| `entidades.js` | `/api/entidades` | Lista entidades (básico) | ⚠️ Limitado |

### API `entidades.js` - Análise

```javascript
// ATUAL (limitado)
export default async function handler(req, res) {
  const { data: entidades } = await supabase
    .from('dim_entidade')
    .select('id, nome, cnpj, tipo_entidade')  // ⚠️ Apenas 4 campos
    .order('id', { ascending: false })
    .limit(100);  // ⚠️ Sem filtros
    
  res.json({ entidades, total: entidades.length });
}
```

**Problemas:**
1. ❌ Não aceita filtros (tipo, projeto, pesquisa, busca)
2. ❌ Retorna apenas 4 campos (faltam dados comerciais, localização, etc)
3. ❌ Não faz JOIN com `fato_entidade_contexto` para filtrar por projeto/pesquisa
4. ❌ Não faz JOIN com `dim_geografia` para dados de localização enriquecidos
5. ❌ Não retorna dados de qualidade (score, validações)

---

## 🖥️ Análise dos Componentes Frontend

### Páginas Existentes

| Página | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| `DesktopTurboPage` | `/desktop-turbo` | Gestão de Conteúdo com filtros | ✅ OK |
| `EntidadesListPage` | `/entidades` | Browse básico de entidades | ⚠️ Limitado |
| `DetalhesEntidade` | `/entidades/:id` | Card de detalhes completo | ✅ OK (mas não usado) |
| `ProdutosPage` | `/produtos` | Browse de produtos | ⚠️ Placeholder |
| `MercadosPage` | `/mercados` | Browse de mercados | ⚠️ Placeholder |

### Componente `EntidadesListPage` - Análise

```typescript
// ATUAL
const { data: entidades } = trpc.entidades.list.useQuery({ 
  busca: debouncedBusca,  // ✅ OK
  limit: 50               // ✅ OK
});

// ❌ FALTANDO:
// - Filtro por tipo (cliente/lead/concorrente)
// - Filtro por projeto_id
// - Filtro por pesquisa_id
// - Filtro por cidade/UF
// - Filtro por setor
// - Duplo click para abrir DetalhesEntidade
```

### Componente `DetalhesEntidade` - Análise

```typescript
// ✅ JÁ EXISTE E ESTÁ COMPLETO!
const { data: entidade } = trpc.entidade.detalhes.useQuery({ id });
const { data: similares } = trpc.entidade.similares.useQuery({ id });
const { data: recomendacoes } = trpc.entidade.recomendacoes.useQuery({ id });

// Exibe:
// - Dados cadastrais completos
// - Contexto comercial (receita, LTV, CAC, score)
// - Produtos/Mercados
// - Histórico de interações
// - Recomendações IA
// - Entidades similares
```

**Problema:** Página existe mas não é acessada via duplo click!

---

## 🚨 Problemas Identificados

### 1. **Fluxo Quebrado: Gestão → Browse**

**Problema:**
```typescript
// DesktopTurboPage.tsx
const handleRowClick = (tipo) => {
  navigate(`/entidades?tipo=${tipo}`);  // ❌ Não passa projeto_id e pesquisa_id
};
```

**Impacto:**
- Filtros de projeto/pesquisa são perdidos ao navegar para o browse
- Browse mostra TODAS as entidades, não apenas as filtradas

---

### 2. **Browse Sem Filtros Herdados**

**Problema:**
```typescript
// EntidadesListPage.tsx
const { data } = trpc.entidades.list.useQuery({ 
  busca: debouncedBusca  // ❌ Não lê query params (tipo, projeto_id, pesquisa_id)
});
```

**Impacto:**
- Não respeita os filtros da tela anterior
- Usuário perde o contexto

---

### 3. **Browse Sem Duplo Click**

**Problema:**
```typescript
// EntidadesListPage.tsx
<Card className="hover-lift cursor-pointer">  // ❌ Sem onClick
  <h3>{ent.nome}</h3>
</Card>
```

**Impacto:**
- Não abre o card de detalhes
- Usuário não consegue ver dados completos

---

### 4. **API Sem Suporte a Filtros**

**Problema:**
```javascript
// api/entidades.js
const { data } = await supabase
  .from('dim_entidade')
  .select('id, nome, cnpj, tipo_entidade')  // ❌ Sem WHERE, sem JOIN
  .limit(100);
```

**Impacto:**
- Impossível filtrar por projeto/pesquisa no backend
- Retorna dados incompletos

---

### 5. **Tabelas Redundantes**

**Problema:**
- `dim_lead` e `dim_concorrente` duplicam dados de `dim_entidade`
- Dados podem ficar dessincronizados

**Exemplo:**
```sql
-- dim_entidade
id=1, nome="Ambev", tipo_entidade="lead", cnpj="07.526..."

-- dim_lead (redundante!)
id=1, entidade_id=1, nome="Ambev", cnpj="07.526..."
```

---

## ✅ Proposta de Solução

### Fase 1: Atualizar API `/api/entidades`

**Objetivo:** Suportar filtros completos e retornar dados enriquecidos

```javascript
// api/entidades.js (NOVO)
export default async function handler(req, res) {
  const { 
    tipo,           // cliente|lead|concorrente
    projeto_id,     // Filtro por projeto
    pesquisa_id,    // Filtro por pesquisa
    busca,          // Busca por nome/CNPJ
    cidade,         // Filtro por cidade
    uf,             // Filtro por UF
    setor,          // Filtro por setor
    limit = 50,
    offset = 0
  } = req.query;

  let query = supabase
    .from('dim_entidade')
    .select(`
      id,
      nome,
      nome_fantasia,
      cnpj,
      email,
      telefone,
      site,
      tipo_entidade,
      cidade,
      uf,
      porte,
      setor,
      produto_principal,
      segmentacao_b2b_b2c,
      num_filiais,
      num_funcionarios,
      score_qualidade_dados,
      validacao_cnpj,
      validacao_email,
      validacao_telefone,
      enriquecido_em,
      created_at,
      updated_at,
      fato_entidade_contexto!inner (
        projeto_id,
        pesquisa_id
      )
    `)
    .is('deleted_at', null);

  // Filtro por tipo
  if (tipo) {
    query = query.eq('tipo_entidade', tipo);
  }

  // Filtro por projeto
  if (projeto_id) {
    query = query.eq('fato_entidade_contexto.projeto_id', projeto_id);
  }

  // Filtro por pesquisa
  if (pesquisa_id) {
    query = query.eq('fato_entidade_contexto.pesquisa_id', pesquisa_id);
  }

  // Busca textual
  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,cnpj.ilike.%${busca}%,email.ilike.%${busca}%`);
  }

  // Filtro por localização
  if (cidade) query = query.eq('cidade', cidade);
  if (uf) query = query.eq('uf', uf);
  if (setor) query = query.eq('setor', setor);

  // Paginação
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: entidades, error, count } = await query;

  if (error) throw error;

  res.json({ 
    entidades: entidades || [],
    total: count || 0,
    limit,
    offset
  });
}
```

---

### Fase 2: Atualizar `DesktopTurboPage` - Passar Filtros

**Objetivo:** Passar projeto_id e pesquisa_id para o browse

```typescript
// client/src/pages/DesktopTurboPage.tsx
const handleRowClick = (totalizador: Totalizador) => {
  const params = new URLSearchParams();
  params.set('tipo', totalizador.tipo);
  
  // Passar filtros ativos
  if (projetoSelecionado) {
    params.set('projeto_id', projetoSelecionado.toString());
  }
  if (pesquisaSelecionada) {
    params.set('pesquisa_id', pesquisaSelecionada.toString());
  }
  
  navigate(`/entidades?${params.toString()}`);
};
```

---

### Fase 3: Atualizar `EntidadesListPage` - Ler Filtros e Duplo Click

**Objetivo:** Ler query params e implementar duplo click

```typescript
// client/src/pages/EntidadesListPage.tsx
import { useLocation } from 'wouter';

export default function EntidadesListPage() {
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  
  // Ler filtros da URL
  const tipo = searchParams.get('tipo') || undefined;
  const projetoId = searchParams.get('projeto_id') || undefined;
  const pesquisaId = searchParams.get('pesquisa_id') || undefined;
  
  const [busca, setBusca] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [ufFiltro, setUfFiltro] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('');
  
  const debouncedBusca = useDebouncedValue(busca, 500);
  
  // Query com todos os filtros
  const { data, isLoading } = trpc.entidades.list.useQuery({
    tipo,
    projeto_id: projetoId ? Number(projetoId) : undefined,
    pesquisa_id: pesquisaId ? Number(pesquisaId) : undefined,
    busca: debouncedBusca || undefined,
    cidade: cidadeFiltro || undefined,
    uf: ufFiltro || undefined,
    setor: setorFiltro || undefined,
    limit: 50
  });
  
  // Duplo click para abrir detalhes
  const handleDoubleClick = (entidadeId: number) => {
    navigate(`/entidades/${entidadeId}`);
  };
  
  return (
    <div>
      {/* Header com badges de filtros ativos */}
      <div className="flex gap-2 mb-4">
        {tipo && <Badge>Tipo: {tipo}</Badge>}
        {projetoId && <Badge>Projeto: {projetoNome}</Badge>}
        {pesquisaId && <Badge>Pesquisa: {pesquisaNome}</Badge>}
      </div>
      
      {/* Filtros específicos */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Input 
            placeholder="Buscar nome/CNPJ..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Input 
            placeholder="Cidade" 
            value={cidadeFiltro}
            onChange={(e) => setCidadeFiltro(e.target.value)}
          />
          <Select value={ufFiltro} onValueChange={setUfFiltro}>
            <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SP">SP</SelectItem>
              <SelectItem value="RJ">RJ</SelectItem>
              {/* ... */}
            </SelectContent>
          </Select>
          <Input 
            placeholder="Setor" 
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
          />
        </div>
      </Card>
      
      {/* Lista de entidades */}
      <div className="space-y-3">
        {data?.entidades.map((ent) => (
          <Card 
            key={ent.id} 
            className="p-6 hover-lift cursor-pointer"
            onDoubleClick={() => handleDoubleClick(ent.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{ent.nome}</h3>
                  <Badge variant={getBadgeVariant(ent.tipo_entidade)}>
                    {ent.tipo_entidade}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">CNPJ:</span>
                    <span className="ml-2">{ent.cnpj || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Localização:</span>
                    <span className="ml-2">{ent.cidade}/{ent.uf}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Setor:</span>
                    <span className="ml-2">{ent.setor || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Score de qualidade */}
                <div className="mt-2">
                  <Progress value={ent.score_qualidade_dados || 0} />
                  <span className="text-xs text-muted-foreground">
                    Qualidade: {ent.score_qualidade_dados || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Hint de duplo click */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        💡 Dê um duplo clique em qualquer registro para ver detalhes completos
      </p>
    </div>
  );
}
```

---

### Fase 4: Atualizar `DetalhesEntidade` - Abrir como Modal

**Objetivo:** Abrir detalhes em modal/drawer ao invés de página completa

**Opção A: Usar Sheet (Drawer lateral)**

```typescript
// client/src/components/EntidadeDetailsSheet.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function EntidadeDetailsSheet({ 
  entidadeId, 
  open, 
  onOpenChange 
}: { 
  entidadeId: number; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: entidade } = trpc.entidade.detalhes.useQuery({ 
    id: entidadeId 
  }, { enabled: open });
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entidade?.nome}</SheetTitle>
        </SheetHeader>
        
        {/* Conteúdo de DetalhesEntidade aqui */}
        <Tabs defaultValue="geral">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral">
            {/* Dados cadastrais */}
          </TabsContent>
          
          <TabsContent value="comercial">
            {/* Contexto comercial, scores, LTV, CAC */}
          </TabsContent>
          
          <TabsContent value="produtos">
            {/* Produtos/Mercados relacionados */}
          </TabsContent>
          
          <TabsContent value="historico">
            {/* Histórico de interações, enriquecimentos */}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

**Uso no EntidadesListPage:**

```typescript
const [detalhesAberto, setDetalhesAberto] = useState(false);
const [entidadeSelecionada, setEntidadeSelecionada] = useState<number | null>(null);

const handleDoubleClick = (entidadeId: number) => {
  setEntidadeSelecionada(entidadeId);
  setDetalhesAberto(true);
};

return (
  <>
    {/* Lista de entidades */}
    <Card onDoubleClick={() => handleDoubleClick(ent.id)}>
      ...
    </Card>
    
    {/* Sheet de detalhes */}
    {entidadeSelecionada && (
      <EntidadeDetailsSheet 
        entidadeId={entidadeSelecionada}
        open={detalhesAberto}
        onOpenChange={setDetalhesAberto}
      />
    )}
  </>
);
```

---

### Fase 5: Implementar Browse de Produtos e Mercados

**Objetivo:** Criar páginas funcionais para Produtos e Mercados

**Estrutura similar:**
1. API `/api/produtos` com filtros
2. API `/api/mercados` com filtros
3. Página `ProdutosListPage` com duplo click
4. Página `MercadosListPage` com duplo click
5. Componentes `ProdutoDetailsSheet` e `MercadoDetailsSheet`

---

## 📋 Checklist de Implementação

### Backend

- [ ] **API `/api/entidades`**
  - [ ] Adicionar suporte a filtros (tipo, projeto_id, pesquisa_id, busca, cidade, uf, setor)
  - [ ] Fazer JOIN com `fato_entidade_contexto`
  - [ ] Retornar campos completos (48 campos)
  - [ ] Implementar paginação
  - [ ] Adicionar contagem total

- [ ] **API `/api/produtos`**
  - [ ] Criar endpoint com filtros
  - [ ] Retornar dados completos

- [ ] **API `/api/mercados`**
  - [ ] Criar endpoint com filtros
  - [ ] Retornar dados completos

- [ ] **tRPC Procedures**
  - [ ] `entidades.list` - Listar com filtros
  - [ ] `entidade.detalhes` - Detalhes completos (já existe)
  - [ ] `produto.detalhes` - Detalhes de produto
  - [ ] `mercado.detalhes` - Detalhes de mercado

### Frontend

- [ ] **DesktopTurboPage**
  - [ ] Passar projeto_id e pesquisa_id ao navegar para browse
  - [ ] Atualizar handleRowClick

- [ ] **EntidadesListPage**
  - [ ] Ler query params (tipo, projeto_id, pesquisa_id)
  - [ ] Exibir badges de filtros ativos
  - [ ] Adicionar filtros específicos (cidade, UF, setor)
  - [ ] Implementar duplo click para abrir detalhes
  - [ ] Adicionar hint "Duplo clique para ver detalhes"

- [ ] **EntidadeDetailsSheet**
  - [ ] Criar componente Sheet/Drawer
  - [ ] Migrar conteúdo de DetalhesEntidade
  - [ ] Implementar abas (Geral, Comercial, Produtos, Histórico)
  - [ ] Adicionar ações (Editar, Exportar, Enriquecer)

- [ ] **ProdutosListPage**
  - [ ] Criar página com filtros
  - [ ] Implementar duplo click
  - [ ] Criar ProdutoDetailsSheet

- [ ] **MercadosListPage**
  - [ ] Criar página com filtros
  - [ ] Implementar duplo click
  - [ ] Criar MercadoDetailsSheet

### Testes

- [ ] Testar fluxo completo: Gestão → Browse → Detalhes
- [ ] Validar filtros herdados (projeto/pesquisa)
- [ ] Validar filtros específicos (busca, cidade, setor)
- [ ] Validar duplo click em todos os browses
- [ ] Validar exibição de dados completos no card

---

## 🎯 Priorização

### Prioridade 1 (Crítico) - 8 horas

1. ✅ Atualizar API `/api/entidades` com filtros completos
2. ✅ Atualizar `DesktopTurboPage` para passar filtros
3. ✅ Atualizar `EntidadesListPage` para ler filtros e duplo click
4. ✅ Criar `EntidadeDetailsSheet` componente

### Prioridade 2 (Importante) - 4 horas

5. ✅ Implementar browse de Produtos
6. ✅ Implementar browse de Mercados

### Prioridade 3 (Desejável) - 2 horas

7. ✅ Adicionar filtros avançados (range de score, data de criação)
8. ✅ Adicionar exportação em massa
9. ✅ Adicionar ações em lote (enriquecer múltiplos, converter leads)

---

## 📊 Diagrama de Entidade-Relacionamento (ER)

```
┌─────────────────┐
│  dim_projeto    │
│  id (PK)        │
│  nome           │
│  codigo         │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  dim_pesquisa   │
│  id (PK)        │
│  projeto_id (FK)│
│  nome           │
└────────┬────────┘
         │
         │ N:M
         ▼
┌──────────────────────┐
│ fato_entidade_contexto│
│  entidade_id (FK)    │
│  projeto_id (FK)     │
│  pesquisa_id (FK)    │
└────────┬─────────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│  dim_entidade   │
│  id (PK)        │
│  tipo_entidade  │◄───┐
│  nome           │    │
│  cnpj           │    │
│  cidade, uf     │    │
│  setor          │    │
└────────┬────────┘    │
         │             │
         │ 1:N         │ N:M
         ▼             │
┌──────────────────────┤
│ fato_entidade_produto│
│  entidade_id (FK)    │
│  produto_id (FK)     │
└──────────────────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│  dim_produto    │
│  id (PK)        │
│  nome           │
│  categoria      │
└─────────────────┘
```

---

## 🚀 Resumo Executivo

**Situação Atual:**
- ✅ Gestão de Conteúdo funcionando com filtros
- ⚠️ Browse de entidades limitado (sem filtros herdados, sem duplo click)
- ✅ Card de detalhes existe mas não é acessado
- ⚠️ Browse de produtos/mercados são placeholders

**Solução Proposta:**
1. Atualizar API para suportar filtros completos
2. Passar filtros entre telas (Gestão → Browse)
3. Implementar duplo click para abrir card de detalhes
4. Criar componente Sheet/Drawer para detalhes
5. Implementar browses de produtos e mercados

**Tempo Estimado:** 14 horas (2 dias)

**Impacto:**
- ✅ Fluxo completo funcionando
- ✅ Usuário consegue navegar com contexto preservado
- ✅ Acesso rápido a dados completos via duplo click
- ✅ Experiência consistente em todos os browses

---

**Próximos Passos:**
1. Aprovar proposta
2. Implementar Prioridade 1 (API + Entidades)
3. Testar fluxo completo
4. Implementar Prioridade 2 (Produtos + Mercados)
5. Deploy e validação final

---

**Autor:** Análise de Engenharia de Dados e Arquitetura da Informação  
**Revisão:** 04/12/2025 13:30
