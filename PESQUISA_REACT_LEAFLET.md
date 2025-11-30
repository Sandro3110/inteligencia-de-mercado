# Pesquisa: React-Leaflet

## Conceitos Fundamentais

### 1. React-Leaflet NÃO substitui Leaflet

- É apenas uma camada de abstração
- Leaflet faz o rendering real do mapa
- React só renderiza um `<div>` para o MapContainer

### 2. Propriedades são IMUTÁVEIS por padrão

- Props são usadas apenas na criação inicial do componente
- **NÃO são atualizadas automaticamente** quando mudam
- Apenas props explicitamente documentadas como "mutable" são reativas

### 3. Props mutáveis são comparadas por REFERÊNCIA

- Mudanças são detectadas por `===` (referência)
- Aplicadas chamando métodos do Leaflet diretamente

### 4. Context API do React

- Cada MapContainer cria seu próprio contexto
- Componentes filhos DEVEM estar dentro de MapContainer
- Hooks só funcionam como descendentes de MapContainer

### 5. Lifecycle

1. MapContainer renderiza `<div>`
2. MapContainer instancia Leaflet Map
3. MapContainer cria React context
4. Filhos são renderizados
5. Cada filho instancia sua layer do Leaflet
6. Quando props mutáveis mudam → atualiza layer
7. Quando componente é removido → remove layer do mapa

### 6. Limitações CRÍTICAS

- ❌ **NÃO é compatível com SSR** (Leaflet acessa DOM diretamente)
- ❌ Componentes são abstrações de layers, NÃO elementos DOM
- ❌ React.StrictMode pode causar problemas (executa effects 2x)
- ✅ Usar `key` única para forçar re-render completo

---

## Implicações para o Projeto

### Problema Atual

O erro "Cannot convert undefined or null to object" provavelmente acontece porque:

1. **Props sendo passadas como `undefined` ou `null`**
   - Leaflet espera valores válidos
   - Props imutáveis não são validadas por React-Leaflet

2. **Mudanças de props não estão sendo detectadas**
   - Se passarmos novo array com mesma referência, não atualiza
   - Precisamos garantir nova referência quando dados mudam

3. **Componentes sendo renderizados fora de MapContainer**
   - Context não está disponível
   - Leaflet não consegue acessar instância do mapa

### Solução Proposta

1. ✅ **Validar TODOS os dados antes de passar para componentes**
2. ✅ **Usar `useMemo` com dependências corretas**
3. ✅ **Garantir que arrays/objetos tenham novas referências**
4. ✅ **Adicionar `key` única quando dados mudam completamente**
5. ✅ **Verificar se todos os componentes estão dentro de MapContainer**
