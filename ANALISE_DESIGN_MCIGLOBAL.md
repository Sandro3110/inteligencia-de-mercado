# Análise de Design - MciGlobal HTML

## 🎨 Características Estéticas Principais

### 1. **Paleta de Cores Dark**

**Background**:

- Base: `#020617` (slate-950)
- Gradiente radial: `radial-gradient(circle at top, #0b1120 0, #020617 40%, #020617 100%)`
- Efeito de profundidade com gradiente sutil do topo

**Borders**:

- `#1f2937` (gray-800) - borders principais
- `rgba(148,163,184,0.45)` - borders com transparência
- `rgba(31,41,55,0.9)` - borders de seções

**Text**:

- Principal: `#e5e7eb` (gray-200)
- Muted: `#9ca3af` (gray-400)
- Accent: `#38bdf8` (sky-400)

**Cores Semânticas**:

- Verde (sucesso): `#22c55e`
- Azul (info): `#3b82f6`
- Amarelo (warning): `#eab308`
- Vermelho (erro): `#ef4444`

### 2. **Cards com Glassmorphism**

**Estrutura dos Cards**:

```css
background:
  radial-gradient(
    circle at top left,
    rgba(248, 250, 252, 0.06),
    transparent 50%
  ),
  linear-gradient(
    to bottom right,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 0.98)
  );
border: 1px solid rgba(148, 163, 184, 0.45);
border-radius: 16px;
```

**Características**:

- Gradiente radial no canto superior esquerdo (efeito de luz)
- Gradiente linear diagonal para profundidade
- Transparência sutil (0.96-0.98)
- Borders semi-transparentes
- Border-radius generosos (14-18px)

### 3. **Tipografia e Hierarquia**

**Títulos**:

- `text-transform: uppercase`
- `letter-spacing: 0.12em - 0.18em` (bem espaçado)
- Tamanhos pequenos (0.8rem - 1rem) mas impactantes
- Cor muted para títulos de seção

**Valores Principais**:

- Tamanho maior (1.1rem)
- `font-weight: 600`
- Cor principal (white)

**Metadados**:

- Tamanho pequeno (0.7rem - 0.78rem)
- Cor muted
- Sempre acompanhando valores principais

### 4. **Hover Effects Suaves**

```css
transition:
  background 0.12s ease,
  transform 0.08s ease,
  border-color 0.12s ease;

:hover {
  background: rgba(30, 64, 175, 0.6);
  border-color: rgba(129, 140, 248, 0.9);
  transform: translateY(-1px);
}
```

**Características**:

- Transições rápidas (0.08s - 0.12s)
- Transform sutil (-1px no eixo Y)
- Mudança de cor para azul
- Border mais vibrante

### 5. **Pills e Badges**

**Pills**:

```css
border-radius: 999px;
padding: 2px 8px;
border: 1px solid rgba(148, 163, 184, 0.55);
display: inline-flex;
align-items: center;
gap: 6px;
```

**Dots**:

- `width: 7-9px`
- `height: 7-9px`
- `border-radius: 999px`
- Cores semânticas

### 6. **Layout em Cascata**

**Estrutura Hierárquica**:

1. **MCIs Globais** (topo) - Grid de 4 colunas
2. **Página de Áreas** - Layout 2 colunas (1.2fr + 1.8fr)
3. **Página de Alavancas** - Grid de alavancas
4. **Página de KPIs** - Lista + Gauge/Gantt

**Navegação**:

- Breadcrumbs visuais no header
- Botões "Voltar" explícitos
- Páginas com `display: none` e `.active`

### 7. **Espaçamento e Densidade**

**Gaps**:

- Entre cards principais: `10-16px`
- Dentro de cards: `4-6px`
- Entre seções: `12-14px`

**Padding**:

- Cards grandes: `14px`
- Cards médios: `10-12px`
- Cards pequenos: `6-9px`

**Border-radius**:

- Cards principais: `16-18px`
- Cards secundários: `14px`
- Mini cards: `10px`
- Pills/buttons: `999px`

---

## 📊 Estrutura de Componentes

### 1. **Card MCI (Topo)**

- Header com título + pill colorido
- Valor principal grande
- Metadados (meta vs real)
- Trend indicator (▲/▼)

### 2. **Lista de Áreas**

- Items com hover effect
- Dot colorido + nome
- Role/descrição muted
- CTA à direita
- Estado `.active` com gradiente azul

### 3. **Mini KPIs**

- Grid 2 colunas
- Título muted
- Valor principal
- Metadados abaixo

### 4. **Alavancas**

- Grid 2 colunas
- Header com tag + badge MCI
- Descrição
- Footer com metadados

### 5. **KPIs**

- Lista de rows
- Grid: nome (1.6fr) + valor (80px) + meta (70px) + semáforo (90px)
- Semáforo com dot colorido

---

## 🎯 Elementos a Adaptar no Gestor PAV

### Prioridade Alta

1. **Background Radial Gradient**
   - Substituir fundo atual por gradiente radial dark
   - Adicionar profundidade visual

2. **Cards Glassmorphism**
   - Aplicar gradientes radiais nos cards
   - Borders semi-transparentes
   - Efeito de luz no canto superior

3. **Tipografia Uppercase**
   - Títulos de seção em uppercase
   - Letter-spacing aumentado
   - Cores muted para hierarquia

4. **Hover Effects**
   - Transform translateY(-1px)
   - Mudança de cor para azul
   - Transições rápidas

5. **Pills e Badges**
   - Status com pills arredondados
   - Dots coloridos para categorias
   - Border semi-transparente

### Prioridade Média

6. **Breadcrumbs Visuais**
   - Adicionar navegação clara no header
   - Mostrar hierarquia (Dashboard → Mercados → Detalhes)

7. **Mini KPIs**
   - Reformatar cards de estatísticas
   - Grid 2 colunas mais compacto
   - Metadados abaixo dos valores

8. **Espaçamento Refinado**
   - Gaps menores e mais consistentes
   - Padding reduzido para densidade

### Prioridade Baixa

9. **Gauge/Gantt**
   - Adicionar visualizações gráficas
   - Gauge para progresso de validação
   - Gantt para timeline (futuro)

10. **Animações Sutis**
    - Fade in ao carregar
    - Stagger nos cards
    - Smooth scroll

---

## 🔧 Implementação Sugerida

### Fase 1: Base Dark Theme

- Atualizar `index.css` com novas variáveis CSS
- Implementar background radial gradient
- Ajustar paleta de cores

### Fase 2: Cards Glassmorphism

- Criar classes utilitárias para cards
- Aplicar gradientes radiais
- Atualizar borders

### Fase 3: Tipografia e Hierarquia

- Atualizar tamanhos de fonte
- Adicionar uppercase e letter-spacing
- Refinar cores de texto

### Fase 4: Interações

- Implementar hover effects
- Adicionar transitions
- Testar responsividade

### Fase 5: Componentes Visuais

- Criar pills e badges
- Adicionar breadcrumbs
- Implementar semáforos visuais

---

## 📐 Comparação: Atual vs MciGlobal

| Aspecto     | Gestor PAV Atual  | MciGlobal                    | Ação         |
| :---------- | :---------------- | :--------------------------- | :----------- |
| Background  | Gradiente simples | Radial gradient profundo     | ✅ Adaptar   |
| Cards       | Solid com border  | Glassmorphism com gradientes | ✅ Adaptar   |
| Tipografia  | Normal case       | Uppercase com spacing        | ✅ Adaptar   |
| Hover       | Simples           | Transform + color change     | ✅ Adaptar   |
| Pills       | Básicos           | Com dots coloridos           | ✅ Adaptar   |
| Breadcrumbs | Ausente           | Presente e claro             | ✅ Adicionar |
| Densidade   | Média             | Alta (compacto)              | ⚠️ Ajustar   |
| Cores       | Vibrantes         | Dark sutis                   | ✅ Adaptar   |

---

## 💡 Conclusão

O design MciGlobal se destaca por:

- **Profundidade visual** com gradientes e transparências
- **Hierarquia clara** com tipografia uppercase e spacing
- **Interações sutis** com hover effects suaves
- **Densidade alta** com espaçamento otimizado
- **Estética profissional** dark moderna

Adaptando esses elementos ao Gestor PAV, teremos uma interface mais sofisticada, profissional e visualmente atraente, mantendo a funcionalidade existente.
