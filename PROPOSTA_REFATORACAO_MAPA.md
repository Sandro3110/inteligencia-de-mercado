# Proposta de Refatoração do Módulo de Mapa

**Autor:** Manus AI  
**Data:** 30 de Novembro de 2025  
**Versão:** 1.0

---

## 1. Contexto e Problema Atual

O módulo de mapa do sistema IntelMarket apresenta erro recorrente **"Cannot convert undefined or null to object"** que impede a visualização de clientes, leads e concorrentes no mapa geográfico. Após análise detalhada da documentação do React-Leaflet e do schema do banco de dados, identificamos as causas raiz e propomos uma refatoração completa.

### Causas Raiz Identificadas

**1. Incompatibilidade com Conceitos do React-Leaflet**

O React-Leaflet não substitui o Leaflet, mas apenas fornece abstrações React para as camadas do Leaflet. As propriedades passadas aos componentes são **imutáveis por padrão** e só são usadas na criação inicial da instância do Leaflet. Mudanças nas props não atualizam automaticamente o mapa, a menos que sejam explicitamente documentadas como mutáveis.

**2. Problemas de Referência em Arrays**

Props mutáveis são comparadas por **referência** (`===`), não por valor. Se passarmos o mesmo array (mesma referência) com dados diferentes, o React-Leaflet não detecta a mudança e não re-renderiza as camadas.

**3. Validação Insuficiente de Dados**

O código atual não valida adequadamente se os dados retornados da API estão no formato correto antes de passá-los para os componentes do Leaflet. Valores `null`, `undefined`, ou coordenadas inválidas (`NaN`) causam erros silenciosos.

**4. Conversão de Tipos Incorreta**

O Postgres retorna campos `numeric` como **strings** (ex: `"-23.55050000"`), mas o Leaflet espera **números**. A conversão com `parseFloat()` não está sendo validada adequadamente.

---

## 2. Arquitetura Proposta

### 2.1. Estrutura de Camadas

```
app/(app)/map/page.tsx
├── MapContainer (React-Leaflet)
│   ├── TileLayer (OpenStreetMap)
│   ├── MarkerClusterGroup (Agrupamento)
│   │   └── EntityMarkers (Clientes, Leads, Concorrentes)
│   ├── MapBounds (Auto-ajuste de zoom)
│   └── MapControls (Controles personalizados)
├── MapSidebar (Filtros e Estatísticas)
└── MapLegend (Legenda de cores)
```

### 2.2. Fluxo de Dados

```
1. Usuário seleciona filtros
   ↓
2. Filtros são validados e normalizados
   ↓
3. tRPC query busca dados da API
   ↓
4. API retorna entidades com coordenadas
   ↓
5. Frontend valida e transforma dados
   ↓
6. useMemo cria novo array com nova referência
   ↓
7. React-Leaflet detecta mudança e re-renderiza
   ↓
8. Leaflet renderiza marcadores no mapa
```

### 2.3. Tipos TypeScript

```typescript
// Entidade retornada pela API
interface MapEntityRaw {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: string | null; // Postgres numeric
  longitude: string | null; // Postgres numeric
  cidade: string | null;
  uf: string | null;
  qualidadeScore: number | null;
  qualidadeClassificacao: string | null;
  cnpj?: string | null;
  porte?: string | null;
  setor?: string | null;
}

// Entidade processada para o mapa
interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number; // Convertido para number
  longitude: number; // Convertido para number
  cidade: string | null;
  uf: string | null;
  qualidadeScore: number | null;
  qualidadeClassificacao: string | null;
  cnpj?: string | null;
  porte?: string | null;
  setor?: string | null;
}

// Filtros do mapa
interface MapFilters {
  projectId: number | null;
  pesquisaId: number | null;
  entityTypes: ('cliente' | 'lead' | 'concorrente')[];
  estado: string | null;
  cidade: string | null;
  setor: string | null;
  porte: string | null;
  qualidade: string | null;
}

// Estatísticas do mapa
interface MapStats {
  totalClientes: number;
  totalLeads: number;
  totalConcorrentes: number;
  entidadesComCoordenadas: number;
  entidadesSemCoordenadas: number;
}
```

---

## 3. Implementação Detalhada

### 3.1. API Layer (`server/routers/map.ts`)

**Responsabilidades:**

- Buscar dados do banco com filtros
- Validar coordenadas no servidor
- Retornar apenas entidades com coordenadas válidas
- Calcular estatísticas

**Mudanças Necessárias:**

1. ✅ **Validação de Coordenadas:**

```typescript
// ANTES (problemático)
const lat = parseFloat(c.latitude as string);
const lng = parseFloat(c.longitude as string);

// DEPOIS (robusto)
if (!c.latitude || !c.longitude) continue;

const lat = parseFloat(c.latitude.toString());
const lng = parseFloat(c.longitude.toString());

if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
  console.warn(`[getMapData] Coordenadas inválidas para ${c.type} ${c.id}`);
  continue;
}

if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  console.warn(`[getMapData] Coordenadas fora do range para ${c.type} ${c.id}`);
  continue;
}
```

2. ✅ **Retorno Consistente:**

```typescript
// SEMPRE retornar array, mesmo vazio
return results; // Array<MapEntityRaw>
```

3. ✅ **Remoção de Logs de Debug:**

- Remover todos os `console.log` de debug
- Manter apenas `console.warn` para coordenadas inválidas

---

### 3.2. Frontend Layer (`app/(app)/map/page.tsx`)

**Responsabilidades:**

- Gerenciar estado dos filtros
- Buscar dados via tRPC
- Transformar dados brutos em entidades válidas
- Renderizar mapa e componentes

**Mudanças Necessárias:**

1. ✅ **Validação e Transformação de Dados:**

```typescript
const entities = useMemo(() => {
  // Validar se mapData existe e é array
  if (!mapData || !Array.isArray(mapData)) {
    console.warn('[Map] mapData inválido:', mapData);
    return [];
  }

  // Transformar e validar cada entidade
  return mapData
    .filter((entity) => {
      // Validar campos obrigatórios
      if (!entity || typeof entity !== 'object') return false;
      if (!entity.id || !entity.type || !entity.nome) return false;
      if (!entity.latitude || !entity.longitude) return false;

      return true;
    })
    .map((entity) => {
      // Converter coordenadas
      const lat =
        typeof entity.latitude === 'string' ? parseFloat(entity.latitude) : entity.latitude;
      const lng =
        typeof entity.longitude === 'string' ? parseFloat(entity.longitude) : entity.longitude;

      // Validar conversão
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`[Map] Conversão falhou para entidade ${entity.id}`);
        return null;
      }

      return {
        ...entity,
        latitude: lat,
        longitude: lng,
      } as MapEntity;
    })
    .filter((entity): entity is MapEntity => entity !== null);
}, [mapData]); // Dependência: mapData
```

2. ✅ **Cálculo de Estatísticas:**

```typescript
const mapStats = useMemo<MapStats>(() => {
  if (!entities || entities.length === 0) {
    return {
      totalClientes: 0,
      totalLeads: 0,
      totalConcorrentes: 0,
      entidadesComCoordenadas: 0,
      entidadesSemCoordenadas: 0,
    };
  }

  return {
    totalClientes: entities.filter((e) => e.type === 'cliente').length,
    totalLeads: entities.filter((e) => e.type === 'lead').length,
    totalConcorrentes: entities.filter((e) => e.type === 'concorrente').length,
    entidadesComCoordenadas: entities.length,
    entidadesSemCoordenadas: 0, // Calculado no servidor
  };
}, [entities]);
```

3. ✅ **Tratamento de Erro Robusto:**

```typescript
const {
  data: mapData,
  isLoading,
  isError,
  error,
  refetch,
} = trpc.map.getMapData.useQuery(
  {
    entityTypes: ['cliente', 'lead', 'concorrente'],
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
    filters: {
      estado: filters.estado,
      cidade: filters.cidade,
      setor: filters.setor,
      porte: filters.porte,
      qualidade: filters.qualidade,
    },
  },
  {
    retry: false,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error('[Map] Erro ao buscar dados:', err);
      toast.error('Erro ao carregar dados do mapa', {
        description: 'Tente novamente em alguns instantes.',
      });
    },
  }
);

// Renderização condicional
if (isLoading) {
  return <MapLoadingSkeleton />;
}

if (isError) {
  return (
    <MapErrorState
      error={error}
      onRetry={() => refetch()}
    />
  );
}

if (!entities || entities.length === 0) {
  return (
    <MapEmptyState
      filters={filters}
      onClearFilters={() => setFilters(initialFilters)}
    />
  );
}
```

---

### 3.3. Componente MapContainer (`components/map/MapContainer.tsx`)

**Responsabilidades:**

- Renderizar mapa Leaflet
- Gerenciar marcadores e clusters
- Auto-ajustar zoom e bounds

**Mudanças Necessárias:**

1. ✅ **Validação de Props:**

```typescript
interface MapContainerProps {
  entities: MapEntity[]; // DEVE ser array não-vazio
  center?: [number, number];
  zoom?: number;
  onEntityClick?: (entity: MapEntity) => void;
}

export function MapContainer({
  entities,
  center,
  zoom = 6,
  onEntityClick
}: MapContainerProps) {
  // Validar props
  if (!entities || !Array.isArray(entities) || entities.length === 0) {
    console.warn('[MapContainer] Entidades inválidas:', entities);
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Nenhuma entidade para exibir
        </p>
      </div>
    );
  }

  // Calcular centro do mapa baseado nas entidades
  const mapCenter = useMemo(() => {
    if (center) return center;

    const avgLat = entities.reduce((sum, e) => sum + e.latitude, 0) / entities.length;
    const avgLng = entities.reduce((sum, e) => sum + e.longitude, 0) / entities.length;

    return [avgLat, avgLng] as [number, number];
  }, [entities, center]);

  return (
    <ReactLeafletMapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup>
        {entities.map((entity) => (
          <EntityMarker
            key={`${entity.type}-${entity.id}`}
            entity={entity}
            onClick={() => onEntityClick?.(entity)}
          />
        ))}
      </MarkerClusterGroup>

      <MapBounds entities={entities} />
    </ReactLeafletMapContainer>
  );
}
```

2. ✅ **Componente MapBounds:**

```typescript
function MapBounds({ entities }: { entities: MapEntity[] }) {
  const map = useMap();

  useEffect(() => {
    if (!entities || entities.length === 0) return;

    // Validar coordenadas
    const validEntities = entities.filter((e) => {
      return (
        typeof e.latitude === 'number' &&
        typeof e.longitude === 'number' &&
        !isNaN(e.latitude) &&
        !isNaN(e.longitude) &&
        isFinite(e.latitude) &&
        isFinite(e.longitude)
      );
    });

    if (validEntities.length === 0) {
      console.warn('[MapBounds] Nenhuma entidade com coordenadas válidas');
      return;
    }

    // Criar bounds
    const bounds = validEntities.map((e) => [e.latitude, e.longitude] as [number, number]);

    try {
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (error) {
      console.error('[MapBounds] Erro ao ajustar bounds:', error);
    }
  }, [entities, map]);

  return null;
}
```

---

## 4. Checklist de Implementação

### Fase 1: API Layer

- [ ] Adicionar validação robusta de coordenadas
- [ ] Validar range de latitude (-90 a 90) e longitude (-180 a 180)
- [ ] Garantir retorno de array vazio quando não há dados
- [ ] Remover logs de debug (manter apenas warnings)
- [ ] Testar query com diferentes filtros

### Fase 2: Frontend Layer

- [ ] Adicionar `useMemo` para transformação de dados
- [ ] Validar tipo e estrutura de `mapData`
- [ ] Converter coordenadas de string para number
- [ ] Validar conversão com `isNaN()` e `isFinite()`
- [ ] Implementar cálculo de estatísticas
- [ ] Adicionar tratamento de erro robusto
- [ ] Implementar estados de loading, erro e vazio

### Fase 3: Componente MapContainer

- [ ] Validar props antes de renderizar
- [ ] Calcular centro do mapa baseado nas entidades
- [ ] Adicionar validação no MapBounds
- [ ] Implementar try-catch no fitBounds
- [ ] Adicionar key única para cada marcador

### Fase 4: Testes

- [ ] Testar com dados válidos
- [ ] Testar com array vazio
- [ ] Testar com coordenadas inválidas (NaN, null, undefined)
- [ ] Testar com coordenadas fora do range
- [ ] Testar mudança de filtros
- [ ] Testar com diferentes tipos de entidades

### Fase 5: Deploy

- [ ] Fazer commit das mudanças
- [ ] Aguardar deploy no Vercel
- [ ] Testar em produção
- [ ] Validar com usuário final

---

## 5. Benefícios Esperados

1. ✅ **Robustez:** Validação em múltiplas camadas previne erros silenciosos
2. ✅ **Manutenibilidade:** Código limpo e bem documentado
3. ✅ **Performance:** useMemo evita re-renders desnecessários
4. ✅ **UX:** Estados de loading, erro e vazio melhoram experiência
5. ✅ **Debugging:** Logs estruturados facilitam identificação de problemas

---

## 6. Riscos e Mitigações

| Risco                                         | Probabilidade | Impacto | Mitigação                      |
| --------------------------------------------- | ------------- | ------- | ------------------------------ |
| Dados do banco inconsistentes                 | Média         | Alto    | Validação robusta no servidor  |
| Performance com muitas entidades              | Baixa         | Médio   | Usar MarkerClusterGroup        |
| Incompatibilidade com React 19                | Baixa         | Alto    | Testar em ambiente de staging  |
| Mudanças quebrarem funcionalidades existentes | Média         | Alto    | Testes manuais antes de deploy |

---

## 7. Próximos Passos

1. **Aprovação da Proposta:** Revisar e aprovar arquitetura proposta
2. **Implementação:** Seguir checklist de implementação fase por fase
3. **Testes:** Validar cada fase antes de avançar
4. **Deploy:** Fazer deploy incremental com rollback preparado
5. **Monitoramento:** Acompanhar logs e feedback do usuário

---

**Autor:** Manus AI  
**Revisão:** Pendente  
**Status:** Proposta Inicial
