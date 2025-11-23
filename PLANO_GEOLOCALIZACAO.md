# 🗺️ Plano de Implementação: Geolocalização e Cockpit de Heatmap Dinâmico

## 📊 Diagnóstico Completo

### ✅ Infraestrutura Já Existente (100% Pronta)

#### 1. Schema do Banco de Dados

As três tabelas principais já possuem campos de geolocalização:

**Tabela: clientes**

- `latitude` DECIMAL(10, 8)
- `longitude` DECIMAL(11, 8)
- `geocodedAt` TIMESTAMP
- `cidade` VARCHAR(100)
- `uf` VARCHAR(2)

**Tabela: concorrentes**

- `latitude` DECIMAL(10, 8)
- `longitude` DECIMAL(11, 8)
- `geocodedAt` TIMESTAMP
- `cidade` VARCHAR(100)
- `uf` VARCHAR(2)

**Tabela: leads**

- `latitude` DECIMAL(10, 8)
- `longitude` DECIMAL(11, 8)
- `geocodedAt` TIMESTAMP
- `cidade` VARCHAR(100)
- `uf` VARCHAR(2)

**Tabela: enrichment_configs**

- `googleMapsApiKey` TEXT

#### 2. Router tRPC de Geocodificação (`server/routers/geocodingRouter.ts`)

Endpoints já implementados:

```typescript
geo.getRecordsSemCoordenadas({ projetoId, tipo? })
// Busca registros sem coordenadas (cliente, concorrente, lead)

geo.geocodeAddress({ projetoId, id, tipo, cidade, uf })
// Geocodifica um endereço individual

geo.geocodeBatch({ projetoId, tipo? })
// Geocodifica múltiplos registros em lote

geo.getStats({ projetoId })
// Estatísticas de cobertura geográfica

geo.testConnection({ projetoId })
// Testa conexão com Google Maps API
```

#### 3. Serviço de Geocodificação (`server/services/geocoding.ts`)

- Integração com Google Maps Geocoding API
- Funções de geocodificação individual e em lote
- Rate limiting e tratamento de erros

#### 4. Funções de Banco de Dados (`server/db-geocoding.ts`)

- `updateClienteCoordinates()`
- `updateConcorrenteCoordinates()`
- `updateLeadCoordinates()`
- `getRecordsSemCoordenadas()`
- `getGeocodeStats()`

---

### ⚠️ Situação Atual dos Dados

**Consulta realizada no banco:**

| Tabela       | Total | Com Latitude | Com Longitude | Com Ambos |
| ------------ | ----- | ------------ | ------------- | --------- |
| clientes     | ?     | 0            | 0             | 0         |
| concorrentes | ?     | 0            | 0             | 0         |
| leads        | ?     | 0            | 0             | 0         |

**Status da API Key:**

- Campo `googleMapsApiKey` existe mas não está configurado

**Dados de Endereço Disponíveis:**

- Clientes têm: `cidade`, `uf` (vindos da ReceitaWS)
- Concorrentes têm: `cidade`, `uf`
- Leads têm: `cidade`, `uf`

---

### ❌ O Que Não Está Funcionando

#### 1. API de Enriquecimento NÃO Geocodifica Automaticamente

**Arquivo: `server/enrichmentOptimized.ts`**

- ✅ Código **aceita** latitude/longitude se vier nos dados
- ❌ Mas **não chama** a API de geocodificação
- ❌ ReceitaWS não retorna coordenadas, apenas endereço textual

**Arquivo: `server/enrichmentFlow.ts`**

- ✅ Enriquece dados via ReceitaWS (cidade, uf, cep)
- ❌ Não geocodifica após obter endereço

#### 2. Nenhum Registro Foi Geocodificado

- Base de dados completa sem coordenadas
- Impossível criar visualizações geográficas

#### 3. Frontend de Mapas Não Existe

- Nenhum componente de mapa (Leaflet)
- Nenhuma página de cockpit geográfico
- Nenhuma visualização de heatmap

---

## 🎯 Plano de Implementação (6 Fases)

### **FASE 1: Configuração e Geocodificação da Base Existente**

#### 1.1 Configurar Google Maps API Key

```typescript
// Via interface web ou SQL direto
UPDATE enrichment_configs
SET googleMapsApiKey = 'SUA_API_KEY_AQUI'
WHERE projectId = 1;
```

#### 1.2 Criar Página de Gerenciamento de Geocodificação

**Arquivo: `client/src/pages/GeoAdmin.tsx`**

Funcionalidades:

- [ ] Exibir estatísticas de cobertura (via `geo.getStats`)
- [ ] Botão "Testar Conexão" (via `geo.testConnection`)
- [ ] Botão "Geocodificar Base Completa" (via `geo.geocodeBatch`)
- [ ] Progress bar para acompanhar processamento
- [ ] Tabela de registros pendentes
- [ ] Logs de erros de geocodificação

#### 1.3 Executar Geocodificação Inicial

- [ ] Testar com 10 registros primeiro
- [ ] Validar precisão das coordenadas
- [ ] Executar lote completo (pode levar tempo)
- [ ] Verificar taxa de sucesso

**Limitações do Google Maps API (tier gratuito):**

- 40.000 requisições/mês grátis
- ~1.300 requisições/dia
- Planejar execução em lotes

---

### **FASE 2: Integração Automática no Fluxo de Enriquecimento**

#### 2.1 Modificar `enrichmentFlow.ts`

**Localização: após linha 476 (após salvar cache ReceitaWS)**

```typescript
// Após obter dados da ReceitaWS
if (dadosEnriquecidos?.cidade && dadosEnriquecidos?.uf) {
  const { geocodeAddress } = await import("./services/geocoding");
  const config = await getEnrichmentConfig(projectId);

  if (config?.googleMapsApiKey) {
    const geoResult = await geocodeAddress(
      dadosEnriquecidos.cidade,
      dadosEnriquecidos.uf,
      "Brasil",
      config.googleMapsApiKey
    );

    if ("latitude" in geoResult) {
      dadosEnriquecidos.latitude = geoResult.latitude;
      dadosEnriquecidos.longitude = geoResult.longitude;
    }
  }
}
```

#### 2.2 Modificar `enrichmentOptimized.ts`

**Localização: após linha 134 (após atualizar geocodedAt)**

Adicionar chamada de geocodificação se coordenadas não existirem.

#### 2.3 Modificar Funções de Criação no `db.ts`

**Funções a modificar:**

- `createCliente()` - adicionar geocodificação após insert
- `createConcorrente()` - adicionar geocodificação após insert
- `createLead()` - adicionar geocodificação após insert

**Estratégia:**

1. Criar registro com dados básicos
2. Se tem cidade+uf, chamar geocodificação
3. Atualizar coordenadas via `updateClienteCoordinates()`

---

### **FASE 3: Instalar Leaflet e Criar Componentes Base**

#### 3.1 Instalar Dependências

```bash
pnpm add leaflet react-leaflet leaflet.heat
pnpm add -D @types/leaflet
```

#### 3.2 Configurar CSS do Leaflet

**Arquivo: `client/src/index.css`**

```css
/* Adicionar no final */
@import "leaflet/dist/leaflet.css";

/* Fix para ícones do Leaflet */
.leaflet-container {
  width: 100%;
  height: 100%;
}
```

#### 3.3 Criar Componente Base de Mapa

**Arquivo: `client/src/components/maps/MapContainer.tsx`**

```typescript
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}

export default function Map({
  center = [-14.235, -51.925], // Centro do Brasil
  zoom = 4,
  children
}: MapContainerProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {children}
    </MapContainer>
  );
}
```

#### 3.4 Testar Renderização Básica

Criar página de teste simples para validar mapa.

---

### **FASE 4: Desenvolver Cockpit Geográfico com Heatmap**

#### 4.1 Criar Queries no Backend

**Arquivo: `server/db.ts`**

```typescript
/**
 * Busca dados geolocalizados com filtros
 */
export async function getGeolocatedData(filters: {
  projectId: number;
  pesquisaId?: number;
  mercadoId?: number;
  tipo?: "cliente" | "concorrente" | "lead";
  status?: string;
}) {
  const db = await getDb();
  // Query com filtros
}

/**
 * Agrega dados para heatmap (densidade por região)
 */
export async function getHeatmapData(filters: {
  projectId: number;
  pesquisaId?: number;
  tipo?: "cliente" | "concorrente" | "lead";
}) {
  const db = await getDb();
  // Retorna array de [lat, lng, intensity]
}

/**
 * Estatísticas por região (UF/cidade)
 */
export async function getRegionStats(filters: {
  projectId: number;
  pesquisaId?: number;
  groupBy: "uf" | "cidade";
}) {
  const db = await getDb();
  // Retorna contagens por região
}
```

#### 4.2 Criar Endpoints tRPC

**Arquivo: `server/routers/geocodingRouter.ts`**

Adicionar novos endpoints:

```typescript
getLocations: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    pesquisaId: z.number().optional(),
    mercadoId: z.number().optional(),
    tipo: z.enum(['cliente', 'concorrente', 'lead']).optional(),
    status: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return getGeolocatedData(input);
  }),

getHeatmapData: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    pesquisaId: z.number().optional(),
    tipo: z.enum(['cliente', 'concorrente', 'lead']).optional(),
  }))
  .query(async ({ input }) => {
    return getHeatmapData(input);
  }),

getRegionStats: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    pesquisaId: z.number().optional(),
    groupBy: z.enum(['uf', 'cidade']),
  }))
  .query(async ({ input }) => {
    return getRegionStats(input);
  }),
```

#### 4.3 Criar Componente de Heatmap

**Arquivo: `client/src/components/maps/HeatmapLayer.tsx`**

```typescript
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
  };
}

export default function HeatmapLayer({ points, options }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    const heatLayer = (L as any)
      .heatLayer(points, {
        radius: options?.radius || 25,
        blur: options?.blur || 15,
        maxZoom: options?.maxZoom || 17,
      })
      .addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
}
```

#### 4.4 Criar Página do Cockpit Geográfico

**Arquivo: `client/src/pages/GeoCockpit.tsx`**

Layout:

```
┌─────────────────────────────────────────┐
│ Header: Filtros + Estatísticas         │
├──────────────┬──────────────────────────┤
│              │                          │
│  Painel      │      Mapa Principal      │
│  Lateral     │      (Heatmap)           │
│              │                          │
│  - Filtros   │                          │
│  - Stats     │                          │
│  - Legenda   │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

Funcionalidades:

- [ ] Mapa principal com heatmap
- [ ] Filtros: pesquisa, mercado, tipo, período, qualidade
- [ ] Cards de estatísticas agregadas
- [ ] Modo de visualização: heatmap vs marcadores
- [ ] Click em ponto para abrir detalhes
- [ ] Legenda dinâmica

---

### **FASE 5: Filtros Avançados e Análises Geográficas**

#### 5.1 Painel de Filtros Avançados

- [ ] Filtro por pesquisa (dropdown)
- [ ] Filtro por mercado (dropdown)
- [ ] Filtro por tipo (checkbox: clientes, concorrentes, leads)
- [ ] Filtro por período (date range)
- [ ] Filtro por qualidade (slider)
- [ ] Filtro por status de validação

#### 5.2 Análises Complementares

- [ ] Gráfico de barras: Top 10 cidades
- [ ] Gráfico de pizza: Distribuição por tipo
- [ ] Tabela: Ranking de UFs por densidade
- [ ] Card: Densidade média por região

#### 5.3 Interatividade

- [ ] Click em marcador → drawer com detalhes
- [ ] Hover → tooltip com preview
- [ ] Seleção múltipla (shift+click)
- [ ] Busca por endereço/cidade
- [ ] Botão "Centralizar no Brasil"

#### 5.4 Exportação

- [ ] Exportar mapa como imagem (PNG)
- [ ] Exportar dados visíveis (CSV/Excel)
- [ ] Exportar relatório geográfico (PDF)

---

### **FASE 6: Testes e Checkpoint**

#### 6.1 Testes Unitários

- [ ] Testar funções de geocodificação
- [ ] Testar queries geográficas
- [ ] Testar agregações de heatmap

#### 6.2 Testes de Integração

- [ ] Testar fluxo completo de enriquecimento com geocodificação
- [ ] Testar geocodificação em lote
- [ ] Testar filtros do cockpit

#### 6.3 Testes de Performance

- [ ] Testar com 1000+ pontos no mapa
- [ ] Validar tempo de resposta das queries
- [ ] Otimizar índices se necessário

#### 6.4 Validação Final

- [ ] Verificar precisão das coordenadas
- [ ] Validar responsividade em mobile
- [ ] Testar em diferentes navegadores

#### 6.5 Criar Checkpoint

```bash
pnpm test # Rodar todos os testes
# Se tudo passar:
# Usar webdev_save_checkpoint
```

---

## 📈 Cronograma Estimado

| Fase      | Descrição                          | Tempo Estimado  |
| --------- | ---------------------------------- | --------------- |
| 1         | Configuração e Geocodificação Base | 2-3 horas       |
| 2         | Integração Automática              | 1-2 horas       |
| 3         | Instalação Leaflet                 | 1 hora          |
| 4         | Cockpit Geográfico                 | 3-4 horas       |
| 5         | Filtros e Análises                 | 2-3 horas       |
| 6         | Testes e Checkpoint                | 1-2 horas       |
| **TOTAL** |                                    | **10-15 horas** |

---

## 🚨 Pontos de Atenção

### 1. Limitações da API Gratuita do Google Maps

- **40.000 requisições/mês grátis**
- ~1.300 requisições/dia
- Planejar geocodificação em lotes
- Considerar cache agressivo

### 2. Performance com Grande Volume

- Implementar clustering de marcadores
- Usar virtualização para grandes datasets
- Otimizar queries com índices geográficos

### 3. Precisão da Geocodificação

- Alguns endereços podem ter baixa precisão
- Validar coordenadas manualmente se necessário
- Implementar sistema de confiança (confidence score)

### 4. Responsividade

- Mapa deve funcionar bem em mobile
- Considerar UX touch-friendly
- Testar em diferentes tamanhos de tela

---

## 🎯 Próximos Passos Imediatos

1. ✅ **Diagnóstico completo realizado**
2. ⏭️ **Configurar Google Maps API Key**
3. ⏭️ **Criar página GeoAdmin.tsx**
4. ⏭️ **Executar geocodificação inicial da base**

---

**Documento criado em:** 2025-01-21  
**Última atualização:** 2025-01-21  
**Status:** Pronto para implementação
