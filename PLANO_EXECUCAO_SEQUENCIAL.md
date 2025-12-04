# Plano de Execução Sequencial - Dashboard de Qualidade de Dados

**Projeto:** Intelmarket - Inteligência de Mercado  
**Data:** 04/12/2025  
**Autor:** Manus AI  
**Versão:** 1.0

---

## 📋 Sumário Executivo

Este documento apresenta um **plano de execução sequencial e lógico** para implementação completa do Dashboard de Qualidade de Dados, organizado em **20 fases incrementais** que seguem a estrutura do menu lateral e respeitam as dependências técnicas entre funcionalidades.

Cada fase é **atômica, testável e validável matematicamente**, com critérios claros de sucesso e procedimento obrigatório de **commit + deploy + validação** antes de avançar para a próxima fase.

---

## 🎯 Princípios do Plano

### 1. Sequencialidade Lógica

As fases seguem a ordem natural do menu e respeitam dependências técnicas. Funcionalidades base (CRUD de entidades) são implementadas antes de funcionalidades derivadas (análises e relatórios).

### 2. Validação Matemática Obrigatória

Cada fase inclui **checklist de validação matemática** em três camadas:
- **Banco de Dados:** Queries SQL para contar registros
- **Backend:** Validar retorno da API
- **Frontend:** Verificar exibição correta

### 3. Deploy Incremental

Cada fase termina com:
1. **Commit** com mensagem descritiva
2. **Push** para repositório
3. **Deploy** automático via Vercel
4. **Checagem de logs** de build
5. **Validação em produção**
6. **Liberação** para próxima fase

### 4. Zero Placeholders Funcionais

Botões e ações só são criados quando totalmente funcionais. Placeholders visuais são permitidos apenas se claramente identificados como "Em desenvolvimento".

---

## 📊 Estrutura do Menu (Base do Plano)

O sistema possui **6 seções principais** no menu lateral:

### 1. Visão Geral
- Gestão de Conteúdo (Desktop Turbo)

### 2. Preparação
- Projetos
- Pesquisas
- Importar Dados
- Histórico de Importações

### 3. Enriquecimento
- Enriquecer com IA
- Processamento Avançado

### 4. Inteligência
- Explorador Multidimensional
- Análise Temporal
- Análise Geográfica
- Análise de Mercado

### 5. Administração
- Usuários
- Gestão de IA

### 6. Ajuda
- Tours guiados
- Documentação

---

## 🚀 FASES DE EXECUÇÃO

---

## FASE 1: Fundação - Entidades (✅ CONCLUÍDA)

**Duração:** 10h  
**Status:** ✅ Concluída em 04/12/2025  
**Commit:** `398b75f`

### Escopo

Sistema completo de Browse e Detalhes de Entidades (Clientes, Leads, Concorrentes).

### Entregas

1. API `/api/entidades` com 48 campos e 14 filtros
2. Hook `useEntidades`
3. Browse `EntidadesListPage` com filtros funcionais
4. Sheet `EntidadeDetailsSheet` com 6 abas
5. Navegação contextual desde Gestão de Conteúdo

### Validação Matemática

```sql
-- Banco
SELECT COUNT(*) FROM dim_entidade; -- 32
SELECT COUNT(*) FROM dim_entidade WHERE tipo = 'cliente'; -- 20

-- API
GET /api/entidades?tipo=cliente
Response: { data: [...], total: 20 }

-- Frontend
Exibição: "20 registros encontrados"
```

**Resultado:** ✅ 100% correto

### Pendências Identificadas

- 7 ações do Sheet são placeholders
- Score de qualidade não persiste
- Relacionamentos com produtos/mercados não implementados

---

## FASE 2: Fundação - Produtos

**Duração estimada:** 30h  
**Status:** 🔵 Próxima fase  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Implementar sistema completo de Browse e Detalhes de Produtos seguindo o mesmo padrão de qualidade da Fase 1.

---

### SUBFASE 2.1: Banco de Dados (2h)

**Responsável:** Backend + DBA

#### Tarefas

1. **Validar estrutura da tabela `dim_produto`**
   ```sql
   DESCRIBE dim_produto;
   ```

2. **Criar tabelas de relacionamento (se não existirem)**
   ```sql
   CREATE TABLE IF NOT EXISTS fato_entidade_produto (
     id SERIAL PRIMARY KEY,
     entidade_id INTEGER REFERENCES dim_entidade(entidade_id),
     produto_id INTEGER REFERENCES dim_produto(produto_id),
     data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     criado_por VARCHAR(255)
   );

   CREATE TABLE IF NOT EXISTS fato_produto_mercado (
     id SERIAL PRIMARY KEY,
     produto_id INTEGER REFERENCES dim_produto(produto_id),
     mercado_id INTEGER REFERENCES dim_mercado(mercado_id),
     data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Criar índices para performance**
   ```sql
   CREATE INDEX idx_produto_categoria ON dim_produto(categoria);
   CREATE INDEX idx_produto_ativo ON dim_produto(ativo);
   CREATE INDEX idx_entidade_produto_entidade ON fato_entidade_produto(entidade_id);
   CREATE INDEX idx_entidade_produto_produto ON fato_entidade_produto(produto_id);
   ```

4. **Inserir dados de teste (se necessário)**
   ```sql
   -- Script de seed com 50 produtos de exemplo
   ```

#### Validação Matemática

```sql
-- Total de produtos
SELECT COUNT(*) FROM dim_produto;
-- Esperado: >= 10

-- Produtos ativos
SELECT COUNT(*) FROM dim_produto WHERE ativo = true;

-- Produtos por categoria
SELECT categoria, COUNT(*) 
FROM dim_produto 
GROUP BY categoria 
ORDER BY COUNT(*) DESC;

-- Produtos vinculados a entidades
SELECT COUNT(DISTINCT produto_id) FROM fato_entidade_produto;
```

#### Critérios de Sucesso

- ✅ Tabela `dim_produto` existe e possui dados
- ✅ Tabelas de relacionamento criadas
- ✅ Índices criados
- ✅ Pelo menos 10 produtos de teste
- ✅ Queries de validação retornam resultados esperados

#### Commit

```bash
git add migrations/
git commit -m "feat(db): Criar estrutura de produtos e relacionamentos"
git push
```

---

### SUBFASE 2.2: API Backend (6h)

**Responsável:** Backend

#### Tarefas

1. **Criar arquivo `/api/produtos.ts`**

2. **Implementar endpoint GET `/api/produtos`**
   - 15 campos retornados
   - 10 filtros funcionais
   - Paginação (limit/offset)
   - Total count
   - JOIN com tabelas de relacionamento

3. **Implementar endpoint GET `/api/produtos/:id`**
   - Retornar produto específico
   - Incluir relacionamentos

4. **Implementar endpoint GET `/api/produtos/:id/entidades`**
   - Listar entidades vinculadas ao produto

5. **Implementar endpoint GET `/api/produtos/:id/mercados`**
   - Listar mercados onde produto é comercializado

#### Estrutura da API

```typescript
// GET /api/produtos
interface ProdutosQuery {
  busca?: string;           // nome, SKU, EAN
  categoria?: string;
  subcategoria?: string;
  preco_min?: number;
  preco_max?: number;
  ativo?: boolean;
  data_inicio?: string;
  data_fim?: string;
  entidade_id?: number;     // filtro contextual
  projeto_id?: number;      // filtro contextual
  limit?: number;           // default: 50
  offset?: number;          // default: 0
}

interface ProdutosResponse {
  data: Produto[];
  total: number;
  limit: number;
  offset: number;
}

interface Produto {
  produto_id: number;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  preco: number;
  moeda: string;
  unidade: string;
  sku: string;
  ean: string;
  ncm: string;
  ativo: boolean;
  data_cadastro: string;
  data_atualizacao: string;
  criado_por: string;
  atualizado_por: string;
}
```

#### Validação Matemática

```bash
# Teste 1: Total de produtos
curl "http://localhost:5000/api/produtos"
# Verificar: response.total === COUNT(*) FROM dim_produto

# Teste 2: Filtro por categoria
curl "http://localhost:5000/api/produtos?categoria=Tecnologia"
# Verificar: response.total === COUNT(*) WHERE categoria = 'Tecnologia'

# Teste 3: Filtro por preço
curl "http://localhost:5000/api/produtos?preco_min=100&preco_max=500"
# Verificar: response.total === COUNT(*) WHERE preco BETWEEN 100 AND 500

# Teste 4: Paginação
curl "http://localhost:5000/api/produtos?limit=10&offset=0"
# Verificar: response.data.length === 10

# Teste 5: Produto específico
curl "http://localhost:5000/api/produtos/1"
# Verificar: response.produto_id === 1

# Teste 6: Entidades vinculadas
curl "http://localhost:5000/api/produtos/1/entidades"
# Verificar: response.length === COUNT(*) FROM fato_entidade_produto WHERE produto_id = 1
```

#### Critérios de Sucesso

- ✅ Todos os endpoints retornam 200 OK
- ✅ Validação matemática 100% precisa
- ✅ Filtros funcionam corretamente
- ✅ Paginação funciona
- ✅ Relacionamentos retornam dados corretos
- ✅ Erros retornam status code apropriado (400, 404, 500)

#### Commit

```bash
git add api/produtos.ts
git commit -m "feat(api): Implementar API completa de produtos com 10 filtros"
git push
```

---

### SUBFASE 2.3: Hook Frontend (1h)

**Responsável:** Frontend

#### Tarefas

1. **Criar arquivo `/client/src/hooks/useProdutos.ts`**

2. **Implementar hook com:**
   - Fetch da API `/api/produtos`
   - Estado (loading, error, data)
   - Suporte a todos os filtros
   - Paginação
   - Refetch manual

#### Código

```typescript
import { useState, useEffect } from 'react';

interface UseProdutosParams {
  busca?: string;
  categoria?: string;
  subcategoria?: string;
  preco_min?: number;
  preco_max?: number;
  ativo?: boolean;
  data_inicio?: string;
  data_fim?: string;
  entidade_id?: number;
  projeto_id?: number;
  limit?: number;
  offset?: number;
}

export function useProdutos(params: UseProdutosParams) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);

  const fetchProdutos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/produtos?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      
      const result = await response.json();
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [JSON.stringify(params)]);

  return { loading, error, data, total, refetch: fetchProdutos };
}
```

#### Validação

```typescript
// Teste no console do navegador
const { data, total } = useProdutos({ categoria: 'Tecnologia' });
console.log('Total:', total);
console.log('Produtos:', data.length);
```

#### Critérios de Sucesso

- ✅ Hook retorna dados corretamente
- ✅ Loading state funciona
- ✅ Error state funciona
- ✅ Refetch funciona
- ✅ Filtros são aplicados corretamente

#### Commit

```bash
git add client/src/hooks/useProdutos.ts
git commit -m "feat(frontend): Criar hook useProdutos com suporte a filtros"
git push
```

---

### SUBFASE 2.4: Browse de Produtos (8h)

**Responsável:** Frontend

#### Tarefas

1. **Criar arquivo `/client/src/pages/ProdutosListPage.tsx`**

2. **Implementar componente com:**
   - Header com título e botão voltar
   - Seção de filtros (8 filtros)
   - Contador de filtros ativos
   - Tabela com 8 colunas
   - Paginação
   - Duplo click para abrir detalhes
   - Footer LGPD

#### Layout

```
┌─────────────────────────────────────────────────┐
│ ← Voltar          PRODUTOS                      │
├─────────────────────────────────────────────────┤
│ Filtros: [2 ativos] [Limpar]                    │
│                                                  │
│ [Busca] [Categoria] [Subcategoria] [Preço]     │
│ [Ativo] [Data Início] [Data Fim]                │
├─────────────────────────────────────────────────┤
│ Resultados (50)                                  │
│ Exibindo 1-50 de 150 (500 total)               │
│                                                  │
│ ┌─────────────────────────────────────────────┐│
│ │ Nome │ SKU │ Categoria │ Preço │ Ativo │...││
│ ├─────────────────────────────────────────────┤│
│ │ Produto A │ SKU001 │ Tech │ R$ 100 │ ✓ │   ││
│ │ Produto B │ SKU002 │ Food │ R$ 50  │ ✓ │   ││
│ └─────────────────────────────────────────────┘│
├─────────────────────────────────────────────────┤
│ [← Anterior]  Página 1 de 10  [Próxima →]     │
├─────────────────────────────────────────────────┤
│ LGPD | Política de Privacidade | Termos        │
└─────────────────────────────────────────────────┘
```

#### Filtros Implementados

1. **Busca** (input text)
   - Placeholder: "Nome, SKU ou EAN..."
   - Busca em: nome, sku, ean

2. **Categoria** (select)
   - Opções dinâmicas do banco
   - "Todas" como padrão

3. **Subcategoria** (select)
   - Opções dinâmicas filtradas por categoria
   - "Todas" como padrão

4. **Preço Mínimo** (number input)
   - Placeholder: "0"

5. **Preço Máximo** (number input)
   - Placeholder: "999999"

6. **Ativo** (select)
   - Opções: Todos / Ativo / Inativo

7. **Data Início** (date input)

8. **Data Fim** (date input)

#### Tabela (8 colunas)

1. **Nome** - Nome do produto
2. **SKU** - Código SKU
3. **Categoria** - Categoria principal
4. **Subcategoria** - Subcategoria
5. **Preço** - Formatado em R$
6. **Unidade** - Unidade de medida
7. **Ativo** - Badge verde/vermelho
8. **Ações** - Ícone de detalhes

#### Interações

- **Duplo click na linha:** Abre `ProdutoDetailsSheet`
- **Botão "Limpar":** Remove todos os filtros
- **Paginação:** Navega entre páginas (50 itens/página)

#### Validação Matemática

```typescript
// Console do navegador
const filteredCount = document.querySelector('.filtered-count').textContent;
const totalCount = document.querySelector('.total-count').textContent;

console.log('Filtrados:', filteredCount); // Ex: 150
console.log('Total:', totalCount);        // Ex: 500

// Verificar com SQL
// SELECT COUNT(*) FROM dim_produto WHERE <filtros>; -- 150
// SELECT COUNT(*) FROM dim_produto; -- 500
```

#### Critérios de Sucesso

- ✅ Página carrega sem erros
- ✅ Filtros funcionam individualmente
- ✅ Filtros funcionam em combinação
- ✅ Tabela exibe dados corretamente
- ✅ Paginação funciona
- ✅ Duplo click abre sheet (placeholder OK nesta fase)
- ✅ Exibição dual está correta
- ✅ Contador de filtros ativos funciona
- ✅ Botão "Limpar" funciona

#### Commit

```bash
git add client/src/pages/ProdutosListPage.tsx
git commit -m "feat(frontend): Implementar browse completo de produtos com 8 filtros"
git push
```

#### Deploy e Validação

```bash
# 1. Aguardar deploy do Vercel (2-3 min)

# 2. Acessar em produção
https://intelmarket.app/produtos/list

# 3. Testar todos os filtros

# 4. Verificar console do navegador (sem erros)

# 5. Validar contadores com SQL
```

---

### SUBFASE 2.5: Sheet de Detalhes - Estrutura (2h)

**Responsável:** Frontend

#### Tarefas

1. **Criar arquivo `/client/src/components/ProdutoDetailsSheet.tsx`**

2. **Implementar estrutura base:**
   - Sheet lateral (direita)
   - Header com nome do produto
   - Botão fechar
   - 5 abas (estrutura vazia)

#### Código Base

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProdutoDetailsSheetProps {
  produto: Produto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProdutoDetailsSheet({
  produto,
  open,
  onOpenChange
}: ProdutoDetailsSheetProps) {
  if (!produto) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{produto.nome}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="geral" className="mt-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="entidades">Entidades</TabsTrigger>
            <TabsTrigger value="mercados">Mercados</TabsTrigger>
            <TabsTrigger value="rastreabilidade">Rastreabilidade</TabsTrigger>
            <TabsTrigger value="acoes">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            {/* Implementar na próxima subfase */}
          </TabsContent>

          <TabsContent value="entidades">
            {/* Implementar na próxima subfase */}
          </TabsContent>

          <TabsContent value="mercados">
            {/* Implementar na próxima subfase */}
          </TabsContent>

          <TabsContent value="rastreabilidade">
            {/* Implementar na próxima subfase */}
          </TabsContent>

          <TabsContent value="acoes">
            {/* Implementar na próxima subfase */}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

#### Integração com Browse

```typescript
// Em ProdutosListPage.tsx
const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
const [sheetOpen, setSheetOpen] = useState(false);

const handleRowDoubleClick = (produto: Produto) => {
  setSelectedProduto(produto);
  setSheetOpen(true);
};

// No JSX
<ProdutoDetailsSheet
  produto={selectedProduto}
  open={sheetOpen}
  onOpenChange={setSheetOpen}
/>
```

#### Validação

- Duplo click em produto abre sheet
- Sheet exibe nome do produto
- Abas são clicáveis
- Sheet fecha ao clicar fora ou no X

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git add client/src/pages/ProdutosListPage.tsx
git commit -m "feat(frontend): Criar estrutura base do ProdutoDetailsSheet"
git push
```

---

### SUBFASE 2.6: Sheet - Aba Geral (2h)

**Responsável:** Frontend

#### Tarefas

Implementar aba "Geral" com 4 seções:

1. **Identificação**
   - Nome
   - SKU
   - EAN
   - NCM
   - Status (badge ativo/inativo)

2. **Classificação**
   - Categoria
   - Subcategoria

3. **Precificação**
   - Preço (formatado em R$)
   - Moeda
   - Unidade de medida

4. **Descrição**
   - Descrição completa (textarea readonly)

#### Layout

```typescript
<TabsContent value="geral" className="space-y-6">
  {/* Identificação */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Identificação
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div>
        <Label>Nome</Label>
        <p className="font-medium">{produto.nome}</p>
      </div>
      <div>
        <Label>SKU</Label>
        <p className="font-mono">{produto.sku || '-'}</p>
      </div>
      <div>
        <Label>EAN</Label>
        <p className="font-mono">{produto.ean || '-'}</p>
      </div>
      <div>
        <Label>NCM</Label>
        <p className="font-mono">{produto.ncm || '-'}</p>
      </div>
      <div>
        <Label>Status</Label>
        <Badge variant={produto.ativo ? 'success' : 'destructive'}>
          {produto.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
    </CardContent>
  </Card>

  {/* Classificação */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Tag className="h-5 w-5" />
        Classificação
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div>
        <Label>Categoria</Label>
        <p>{produto.categoria || '-'}</p>
      </div>
      <div>
        <Label>Subcategoria</Label>
        <p>{produto.subcategoria || '-'}</p>
      </div>
    </CardContent>
  </Card>

  {/* Precificação */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Precificação
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-3 gap-4">
      <div>
        <Label>Preço</Label>
        <p className="text-lg font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: produto.moeda || 'BRL'
          }).format(produto.preco)}
        </p>
      </div>
      <div>
        <Label>Moeda</Label>
        <p>{produto.moeda || 'BRL'}</p>
      </div>
      <div>
        <Label>Unidade</Label>
        <p>{produto.unidade || '-'}</p>
      </div>
    </CardContent>
  </Card>

  {/* Descrição */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Descrição
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {produto.descricao || 'Sem descrição disponível.'}
      </p>
    </CardContent>
  </Card>
</TabsContent>
```

#### Validação

- Todos os campos são exibidos corretamente
- Formatação de preço está correta
- Badge de status tem cor correta
- Descrição quebra linhas corretamente

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git commit -m "feat(frontend): Implementar aba Geral do ProdutoDetailsSheet"
git push
```

---

### SUBFASE 2.7: Sheet - Aba Entidades (3h)

**Responsável:** Frontend + Backend

#### Tarefas Backend

1. **Garantir que API `/api/produtos/:id/entidades` existe**

2. **Retornar dados:**
   ```typescript
   interface EntidadeVinculada {
     entidade_id: number;
     nome: string;
     cnpj: string;
     tipo: string;
     cidade: string;
     uf: string;
   }
   ```

#### Tarefas Frontend

1. **Criar hook `useProdutoEntidades`**
   ```typescript
   export function useProdutoEntidades(produtoId: number) {
     const [loading, setLoading] = useState(true);
     const [data, setData] = useState<EntidadeVinculada[]>([]);

     useEffect(() => {
       fetch(`/api/produtos/${produtoId}/entidades`)
         .then(res => res.json())
         .then(setData)
         .finally(() => setLoading(false));
     }, [produtoId]);

     return { loading, data };
   }
   ```

2. **Implementar aba com tabela**
   ```typescript
   <TabsContent value="entidades">
     <Card>
       <CardHeader>
         <CardTitle>Entidades Relacionadas</CardTitle>
       </CardHeader>
       <CardContent>
         {loading ? (
           <p>Carregando...</p>
         ) : data.length === 0 ? (
           <p className="text-muted-foreground">
             Nenhuma entidade vinculada a este produto.
           </p>
         ) : (
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nome</TableHead>
                 <TableHead>CNPJ</TableHead>
                 <TableHead>Tipo</TableHead>
                 <TableHead>Cidade</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {data.map(entidade => (
                 <TableRow
                   key={entidade.entidade_id}
                   className="cursor-pointer hover:bg-accent"
                   onDoubleClick={() => handleOpenEntidade(entidade)}
                 >
                   <TableCell>{entidade.nome}</TableCell>
                   <TableCell>{entidade.cnpj}</TableCell>
                   <TableCell>{entidade.tipo}</TableCell>
                   <TableCell>{entidade.cidade}/{entidade.uf}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         )}
       </CardContent>
     </Card>
   </TabsContent>
   ```

3. **Implementar navegação cruzada**
   - Duplo click em entidade → Abre `EntidadeDetailsSheet`
   - Gerenciar estado de múltiplos sheets abertos

#### Validação Matemática

```sql
-- Banco
SELECT COUNT(*) FROM fato_entidade_produto WHERE produto_id = 1;
-- Ex: 3

-- API
GET /api/produtos/1/entidades
-- Response: [{ entidade_id: 1, ... }, { entidade_id: 2, ... }, { entidade_id: 3, ... }]
-- Length: 3

-- Frontend
// Verificar que tabela exibe 3 linhas
```

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git add client/src/hooks/useProdutoEntidades.ts
git commit -m "feat(frontend): Implementar aba Entidades com navegação cruzada"
git push
```

---

### SUBFASE 2.8: Sheet - Aba Mercados (2h)

**Responsável:** Frontend + Backend

#### Tarefas Backend

1. **Garantir que API `/api/produtos/:id/mercados` existe**

2. **Retornar dados:**
   ```typescript
   interface MercadoVinculado {
     mercado_id: number;
     nome: string;
     descricao: string;
   }
   ```

#### Tarefas Frontend

1. **Criar hook `useProdutoMercados`**

2. **Implementar aba com cards**
   ```typescript
   <TabsContent value="mercados">
     <Card>
       <CardHeader>
         <CardTitle>Mercados de Atuação</CardTitle>
       </CardHeader>
       <CardContent>
         {loading ? (
           <p>Carregando...</p>
         ) : data.length === 0 ? (
           <p className="text-muted-foreground">
             Nenhum mercado vinculado a este produto.
           </p>
         ) : (
           <div className="grid gap-4">
             {data.map(mercado => (
               <Card key={mercado.mercado_id}>
                 <CardHeader>
                   <CardTitle className="text-base">{mercado.nome}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-muted-foreground">
                     {mercado.descricao}
                   </p>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   </TabsContent>
   ```

#### Validação Matemática

```sql
-- Banco
SELECT COUNT(*) FROM fato_produto_mercado WHERE produto_id = 1;

-- API
GET /api/produtos/1/mercados
-- Verificar length do array
```

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git add client/src/hooks/useProdutoMercados.ts
git commit -m "feat(frontend): Implementar aba Mercados do ProdutoDetailsSheet"
git push
```

---

### SUBFASE 2.9: Sheet - Aba Rastreabilidade (1h)

**Responsável:** Frontend

#### Tarefas

Implementar aba com 2 seções:

1. **Origem dos Dados**
   - Fonte
   - Data de cadastro
   - Última atualização

2. **Auditoria**
   - Criado por
   - Atualizado por

#### Código

```typescript
<TabsContent value="rastreabilidade" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Origem dos Dados</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div>
        <Label>Fonte</Label>
        <p>{produto.fonte || '-'}</p>
      </div>
      <div>
        <Label>Data de Cadastro</Label>
        <p>{new Date(produto.data_cadastro).toLocaleDateString('pt-BR')}</p>
      </div>
      <div>
        <Label>Última Atualização</Label>
        <p>{new Date(produto.data_atualizacao).toLocaleDateString('pt-BR')}</p>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Auditoria</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div>
        <Label>Criado por</Label>
        <p>{produto.criado_por || '-'}</p>
      </div>
      <div>
        <Label>Atualizado por</Label>
        <p>{produto.atualizado_por || '-'}</p>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git commit -m "feat(frontend): Implementar aba Rastreabilidade do ProdutoDetailsSheet"
git push
```

---

### SUBFASE 2.10: Sheet - Aba Ações (2h)

**Responsável:** Frontend

#### Tarefas

Implementar aba com 4 ações (placeholders):

1. **✏️ Editar Produto**
2. **📥 Exportar Dados**
3. **🔗 Vincular Entidade**
4. **🗑️ Excluir Produto**

#### Código

```typescript
<TabsContent value="acoes">
  <Card>
    <CardHeader>
      <CardTitle>Ações Disponíveis</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
      >
        <Edit className="h-4 w-4 mr-2" />
        Editar Produto
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar Dados
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
      >
        <Link className="h-4 w-4 mr-2" />
        Vincular Entidade
      </Button>

      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir Produto
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

#### Commit

```bash
git add client/src/components/ProdutoDetailsSheet.tsx
git commit -m "feat(frontend): Implementar aba Ações do ProdutoDetailsSheet (placeholders)"
git push
```

---

### SUBFASE 2.11: Navegação Contextual (2h)

**Responsável:** Frontend

#### Tarefas

1. **Adicionar card "Produtos" no DesktopTurboPage**
   ```typescript
   <Card onClick={() => navigate('/produtos/list')}>
     <CardHeader>
       <CardTitle>Produtos</CardTitle>
     </CardHeader>
     <CardContent>
       <p className="text-3xl font-bold">{totalProdutos}</p>
       <p className="text-sm text-muted-foreground">produtos cadastrados</p>
     </CardContent>
   </Card>
   ```

2. **Integrar navegação Entidade → Produtos**
   - No `EntidadeDetailsSheet`, aba "Produtos"
   - Click em produto → Abre `ProdutoDetailsSheet`

3. **Integrar navegação Produto → Entidades**
   - No `ProdutoDetailsSheet`, aba "Entidades"
   - Click em entidade → Abre `EntidadeDetailsSheet`

#### Validação

- Gestão de Conteúdo → Card Produtos → Browse funciona
- Entidade → Produtos → Click → Sheet abre
- Produto → Entidades → Click → Sheet abre
- Múltiplos sheets podem estar abertos simultaneamente

#### Commit

```bash
git add client/src/pages/DesktopTurboPage.tsx
git add client/src/components/EntidadeDetailsSheet.tsx
git add client/src/components/ProdutoDetailsSheet.tsx
git commit -m "feat(frontend): Implementar navegação contextual completa de produtos"
git push
```

---

### SUBFASE 2.12: Validação Final e Testes (2h)

**Responsável:** QA + Desenvolvedor

#### Checklist de Validação

##### 1. Validação Matemática (30 min)

```sql
-- Banco de Dados
SELECT COUNT(*) FROM dim_produto; -- Total
SELECT COUNT(*) FROM dim_produto WHERE ativo = true; -- Ativos
SELECT COUNT(*) FROM dim_produto WHERE categoria = 'Tecnologia'; -- Por categoria
SELECT COUNT(DISTINCT produto_id) FROM fato_entidade_produto; -- Com entidades
```

```bash
# API
curl "http://localhost:5000/api/produtos" | jq '.total'
curl "http://localhost:5000/api/produtos?ativo=true" | jq '.total'
curl "http://localhost:5000/api/produtos?categoria=Tecnologia" | jq '.total'
```

```typescript
// Frontend (console do navegador)
// Verificar que totalizadores correspondem aos valores do banco
```

**Critério:** Todos os valores devem ser 100% idênticos.

##### 2. Testes Funcionais (60 min)

**Cenário 1: Browse básico**
1. Acessar `/produtos/list`
2. Verificar que todos os produtos aparecem
3. Verificar paginação (50 itens/página)
4. Verificar exibição dual (filtrados / total)

**Cenário 2: Filtros**
1. Aplicar filtro de busca → Verificar resultados
2. Aplicar filtro de categoria → Verificar resultados
3. Aplicar filtro de preço → Verificar resultados
4. Combinar múltiplos filtros → Verificar resultados
5. Limpar filtros → Verificar que volta ao estado inicial

**Cenário 3: Detalhes**
1. Duplo click em um produto → Sheet abre
2. Navegar entre as 5 abas → Todas funcionam
3. Verificar que todos os dados aparecem corretamente
4. Fechar sheet → Volta ao browse

**Cenário 4: Navegação contextual**
1. Gestão de Conteúdo → Card Produtos → Browse
2. Entidade → Produtos → Click → Detalhes
3. Produto → Entidades → Click → Detalhes
4. Verificar que navegação cruzada funciona

**Cenário 5: Responsividade**
1. Testar em desktop (1920x1080)
2. Testar em tablet (768x1024)
3. Testar em mobile (375x667)

##### 3. Checagem de Logs (15 min)

```bash
# Vercel Deploy Logs
# Verificar que não há erros de build
# Verificar que não há warnings críticos

# Browser Console
# Acessar https://intelmarket.app/produtos/list
# Abrir DevTools → Console
# Verificar que não há erros JavaScript
# Verificar que não há warnings de React
```

##### 4. Performance (15 min)

```bash
# Lighthouse
# Acessar https://intelmarket.app/produtos/list
# Executar Lighthouse audit
# Verificar scores:
# - Performance: >= 80
# - Accessibility: >= 90
# - Best Practices: >= 90
# - SEO: >= 90
```

#### Critérios de Sucesso da Fase 2

- ✅ Validação matemática 100% precisa
- ✅ Todos os testes funcionais passam
- ✅ Zero erros no console
- ✅ Zero erros de build
- ✅ Lighthouse scores aceitáveis
- ✅ Navegação contextual funciona
- ✅ Responsividade OK

#### Commit Final

```bash
git add .
git commit -m "feat(produtos): Fase 2 completa - Browse e Detalhes de Produtos 100% funcional"
git push
git tag -a "fase-2-produtos" -m "Fase 2: Produtos completa e validada"
git push --tags
```

---

## FASE 3: Preparação - Projetos

**Duração estimada:** 25h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades), Fase 2 (Produtos)

### Objetivo

Implementar sistema completo de gerenciamento de Projetos de Inteligência de Mercado.

### Escopo

Um **Projeto** é um container que agrupa:
- Entidades (clientes, leads, concorrentes)
- Produtos
- Pesquisas
- Análises
- Relatórios

### Subfases

1. **Banco de Dados** (3h)
   - Validar tabela `dim_projeto`
   - Criar relacionamentos (fato_projeto_entidade, fato_projeto_produto)
   - Inserir dados de teste

2. **API Backend** (6h)
   - GET `/api/projetos` (listar projetos)
   - GET `/api/projetos/:id` (detalhes do projeto)
   - POST `/api/projetos` (criar projeto)
   - PUT `/api/projetos/:id` (editar projeto)
   - DELETE `/api/projetos/:id` (excluir projeto)
   - GET `/api/projetos/:id/entidades` (entidades do projeto)
   - GET `/api/projetos/:id/produtos` (produtos do projeto)

3. **Hook Frontend** (1h)
   - `useProjetos`
   - `useProjeto`

4. **Browse de Projetos** (6h)
   - Listagem com cards
   - Filtros (nome, status, data)
   - Ações (criar, editar, excluir)

5. **Detalhes do Projeto** (6h)
   - Dashboard do projeto
   - Abas: Entidades, Produtos, Pesquisas, Análises
   - Adicionar/remover entidades
   - Adicionar/remover produtos

6. **Navegação Contextual** (2h)
   - Gestão de Conteúdo → Filtrar por projeto
   - Entidades → Filtrar por projeto
   - Produtos → Filtrar por projeto

7. **Validação e Testes** (1h)

### Validação Matemática

```sql
-- Total de projetos
SELECT COUNT(*) FROM dim_projeto;

-- Projetos ativos
SELECT COUNT(*) FROM dim_projeto WHERE status = 'ativo';

-- Entidades por projeto
SELECT projeto_id, COUNT(*) 
FROM fato_projeto_entidade 
GROUP BY projeto_id;

-- Produtos por projeto
SELECT projeto_id, COUNT(*) 
FROM fato_projeto_produto 
GROUP BY projeto_id;
```

---

## FASE 4: Preparação - Pesquisas

**Duração estimada:** 20h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 3 (Projetos)

### Objetivo

Implementar sistema de configuração de Pesquisas de Mercado.

### Escopo

Uma **Pesquisa** define:
- Critérios de segmentação (setor, porte, região)
- Filtros de qualificação
- Perguntas e campos customizados
- Vinculação a um projeto

### Subfases

1. Banco de Dados (3h)
2. API Backend (6h)
3. Hook Frontend (1h)
4. Browse de Pesquisas (5h)
5. Detalhes da Pesquisa (4h)
6. Validação e Testes (1h)

---

## FASE 5: Preparação - Importação de Dados

**Duração estimada:** 30h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades), Fase 2 (Produtos)

### Objetivo

Implementar sistema completo de importação de dados via CSV/Excel.

### Escopo

- Upload de arquivos CSV/Excel
- Mapeamento de colunas
- Validação de dados
- Preview antes de importar
- Importação em background (queue)
- Histórico de importações
- Rollback de importações

### Subfases

1. Banco de Dados (4h)
   - Tabela `fato_importacao`
   - Tabela `fato_importacao_log`

2. API Backend (10h)
   - POST `/api/importacao/upload` (upload arquivo)
   - POST `/api/importacao/mapear` (mapear colunas)
   - POST `/api/importacao/preview` (preview dados)
   - POST `/api/importacao/executar` (executar importação)
   - GET `/api/importacao/:id/status` (status da importação)

3. Worker de Importação (6h)
   - Processar arquivo em background
   - Validar dados linha por linha
   - Inserir no banco
   - Atualizar status

4. Frontend (8h)
   - Página de upload
   - Página de mapeamento
   - Página de preview
   - Página de histórico

5. Validação e Testes (2h)

---

## FASE 6: Preparação - Histórico de Importações

**Duração estimada:** 10h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 5 (Importação)

### Objetivo

Visualizar histórico e status de importações anteriores.

### Escopo

- Listagem de importações
- Filtros (data, status, tipo)
- Detalhes da importação
- Logs de erros
- Rollback de importação

---

## FASE 7: Enriquecimento - Enriquecer com IA

**Duração estimada:** 40h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Enriquecer dados de empresas com inteligência artificial.

### Escopo

- Buscar dados complementares (faturamento, funcionários, etc.)
- Integração com APIs externas (Receita Federal, CNPJ.ws, etc.)
- Enriquecimento via LLM (GPT-4)
- Enriquecimento em lote
- Histórico de enriquecimentos

### Subfases

1. Banco de Dados (3h)
2. Integração com APIs Externas (10h)
3. Integração com LLM (8h)
4. API Backend (8h)
5. Frontend (8h)
6. Validação e Testes (3h)

---

## FASE 8: Enriquecimento - Processamento Avançado

**Duração estimada:** 35h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 7 (Enriquecer com IA)

### Objetivo

Processar lotes de dados e gerar insights automatizados.

### Escopo

- Processamento em lote
- Geração de insights via IA
- Classificação automática (setor, porte, etc.)
- Detecção de duplicatas
- Normalização de dados

---

## FASE 9: Inteligência - Explorador Multidimensional

**Duração estimada:** 45h  
**Status:** ⚪ Planejada  
**Dependências:** Todas as fases anteriores

### Objetivo

Análise interativa por múltiplas dimensões (setor, porte, região).

### Escopo

- Cubo OLAP
- Drill-down / Drill-up
- Slicing / Dicing
- Visualizações interativas
- Exportação de análises

---

## FASE 10: Inteligência - Análise Temporal

**Duração estimada:** 30h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 9 (Explorador)

### Objetivo

Identificar tendências e padrões ao longo do tempo.

### Escopo

- Gráficos de linha temporal
- Comparação período a período
- Previsões (forecast)
- Sazonalidade

---

## FASE 11: Inteligência - Análise Geográfica

**Duração estimada:** 35h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 9 (Explorador)

### Objetivo

Visualizar distribuição geográfica e oportunidades por região.

### Escopo

- Mapa interativo
- Heatmap de densidade
- Filtros geográficos
- Análise por estado/cidade
- Rotas de vendas

---

## FASE 12: Inteligência - Análise de Mercado

**Duração estimada:** 40h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 9 (Explorador)

### Objetivo

Explorar hierarquia de mercados e segmentos de atuação.

### Escopo

- Árvore de mercados
- Análise de participação (market share)
- Matriz BCG
- Análise de concorrentes

---

## FASE 13: Administração - Usuários

**Duração estimada:** 25h  
**Status:** ⚪ Planejada  
**Dependências:** Nenhuma (independente)

### Objetivo

Gerenciar usuários, permissões e controle de acesso.

### Escopo

- CRUD de usuários
- Perfis de acesso (admin, analista, visualizador)
- Permissões granulares
- Logs de auditoria
- Autenticação (OAuth)

---

## FASE 14: Administração - Gestão de IA

**Duração estimada:** 20h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 7 (Enriquecer com IA)

### Objetivo

Monitorar uso, custos e segurança da inteligência artificial.

### Escopo

- Dashboard de uso de IA
- Custos por operação
- Logs de chamadas
- Rate limiting
- Segurança e compliance

---

## FASE 15: Ações de Entidades - Editar

**Duração estimada:** 6h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Implementar edição completa de entidades.

### Escopo

- Modal de edição
- Formulário com validação
- API PUT `/api/entidades/:id`
- Feedback de sucesso/erro

---

## FASE 16: Ações de Entidades - Enriquecer

**Duração estimada:** 4h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 7 (Enriquecer com IA)

### Objetivo

Enriquecer entidade individual com IA.

---

## FASE 17: Ações de Entidades - Exportar

**Duração estimada:** 2h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Exportar dados de entidade para CSV/Excel.

---

## FASE 18: Ações de Entidades - Email

**Duração estimada:** 3h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Enviar email para entidade.

---

## FASE 19: Ações de Entidades - Excluir

**Duração estimada:** 2h  
**Status:** ⚪ Planejada  
**Dependências:** Fase 1 (Entidades)

### Objetivo

Excluir entidade com confirmação.

---

## FASE 20: Melhorias de UX

**Duração estimada:** 12h  
**Status:** ⚪ Planejada  
**Dependências:** Todas as fases anteriores

### Objetivo

Resolver bugs e implementar melhorias de experiência.

### Escopo

1. Loading states (3h)
2. Mensagens de erro (2h)
3. Exportação em massa (4h)
4. Filtros persistentes (2h)
5. Fix EMFILE bug (1h)

---

## 📊 RESUMO GERAL

| Fase | Nome | Duração | Status | Dependências |
|------|------|---------|--------|--------------|
| 1 | Fundação - Entidades | 10h | ✅ Concluída | - |
| 2 | Fundação - Produtos | 30h | 🔵 Próxima | Fase 1 |
| 3 | Preparação - Projetos | 25h | ⚪ Planejada | Fases 1, 2 |
| 4 | Preparação - Pesquisas | 20h | ⚪ Planejada | Fase 3 |
| 5 | Preparação - Importação | 30h | ⚪ Planejada | Fases 1, 2 |
| 6 | Preparação - Histórico | 10h | ⚪ Planejada | Fase 5 |
| 7 | Enriquecimento - IA | 40h | ⚪ Planejada | Fase 1 |
| 8 | Enriquecimento - Avançado | 35h | ⚪ Planejada | Fase 7 |
| 9 | Inteligência - Explorador | 45h | ⚪ Planejada | Todas anteriores |
| 10 | Inteligência - Temporal | 30h | ⚪ Planejada | Fase 9 |
| 11 | Inteligência - Geográfica | 35h | ⚪ Planejada | Fase 9 |
| 12 | Inteligência - Mercado | 40h | ⚪ Planejada | Fase 9 |
| 13 | Administração - Usuários | 25h | ⚪ Planejada | - |
| 14 | Administração - Gestão IA | 20h | ⚪ Planejada | Fase 7 |
| 15 | Ações - Editar | 6h | ⚪ Planejada | Fase 1 |
| 16 | Ações - Enriquecer | 4h | ⚪ Planejada | Fase 7 |
| 17 | Ações - Exportar | 2h | ⚪ Planejada | Fase 1 |
| 18 | Ações - Email | 3h | ⚪ Planejada | Fase 1 |
| 19 | Ações - Excluir | 2h | ⚪ Planejada | Fase 1 |
| 20 | Melhorias de UX | 12h | ⚪ Planejada | Todas |
| **TOTAL** | **20 fases** | **424h** | **2% concluído** | - |

---

## 🎯 ORDEM DE EXECUÇÃO RECOMENDADA

### Trilha Crítica (Sequencial)

```
Fase 1 (Entidades) ✅
  ↓
Fase 2 (Produtos) 🔵
  ↓
Fase 3 (Projetos)
  ↓
Fase 4 (Pesquisas)
  ↓
Fase 5 (Importação)
  ↓
Fase 6 (Histórico)
  ↓
Fase 7 (Enriquecer IA)
  ↓
Fase 8 (Processamento Avançado)
  ↓
Fase 9 (Explorador Multidimensional)
  ↓
Fases 10, 11, 12 (Análises - podem ser paralelas)
  ↓
Fase 20 (Melhorias UX)
```

### Trilha Paralela (Independente)

```
Fase 13 (Usuários) - pode ser feita a qualquer momento
Fase 14 (Gestão IA) - após Fase 7
Fases 15-19 (Ações) - após Fase 1
```

---

## 📋 PROCEDIMENTO PADRÃO DE CADA FASE

### 1. Planejamento (10% do tempo)

- Revisar escopo da fase
- Verificar dependências
- Preparar ambiente
- Criar branch no git

### 2. Desenvolvimento (60% do tempo)

- Implementar subfases sequencialmente
- Commit a cada subfase
- Testar localmente

### 3. Validação Matemática (10% do tempo)

- Executar queries SQL
- Testar APIs
- Verificar frontend
- Documentar resultados

### 4. Testes (10% do tempo)

- Testes funcionais
- Testes de integração
- Testes de regressão

### 5. Deploy e Validação (10% do tempo)

- Commit final
- Push para repositório
- Aguardar deploy Vercel
- Checar logs de build
- Validar em produção
- Criar tag de versão
- Liberar próxima fase

---

## ✅ CHECKLIST DE LIBERAÇÃO DE FASE

Antes de avançar para a próxima fase, verificar:

- [ ] Todos os commits foram feitos
- [ ] Push para repositório realizado
- [ ] Deploy do Vercel concluído sem erros
- [ ] Logs de build sem warnings críticos
- [ ] Validação matemática 100% precisa
- [ ] Todos os testes funcionais passam
- [ ] Zero erros no console do navegador
- [ ] Lighthouse scores aceitáveis
- [ ] Documentação atualizada
- [ ] Tag de versão criada
- [ ] Stakeholders notificados

---

## 🚨 CRITÉRIOS DE BLOQUEIO

Uma fase NÃO pode avançar se:

- ❌ Validação matemática falhar (diferença > 0%)
- ❌ Build do Vercel falhar
- ❌ Erros críticos no console
- ❌ Testes funcionais falharem
- ❌ Dependências não estiverem concluídas

---

## 📈 MÉTRICAS DE ACOMPANHAMENTO

### Por Fase

- **Tempo planejado** vs **Tempo real**
- **Bugs encontrados** vs **Bugs resolvidos**
- **Commits realizados**
- **Linhas de código adicionadas/removidas**
- **Cobertura de testes**

### Geral

- **Progresso total:** 2% (1/20 fases)
- **Horas investidas:** 10h / 424h
- **Horas restantes:** 414h
- **Prazo estimado:** 52 dias úteis (8h/dia)

---

## 🎯 PRÓXIMA AÇÃO

**Iniciar Fase 2 - Fundação: Produtos**

**Primeira subfase:** 2.1 - Banco de Dados (2h)

**Responsável:** Backend + DBA

**Tarefas:**
1. Validar estrutura da tabela `dim_produto`
2. Criar tabelas de relacionamento
3. Criar índices
4. Inserir dados de teste
5. Executar validação matemática

**Comando para iniciar:**
```bash
git checkout -b fase-2-produtos
```

---

**Autor:** Manus AI  
**Data:** 04/12/2025  
**Versão:** 1.0
