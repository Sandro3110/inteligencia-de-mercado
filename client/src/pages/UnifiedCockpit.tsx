import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSelectedPesquisa } from "@/hooks/useSelectedPesquisa";
import { ProjectSelector } from "@/components/ProjectSelector";
import { PesquisaSelector } from "@/components/PesquisaSelector";
import { AppSidebar } from "@/components/AppSidebar";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { 
  LayoutList, 
  Map, 
  LayoutGrid, 
  BarChart3, 
  Filter,
  Building2,
  Users,
  Target,
  TrendingUp,
  Download,
  Save,
  FilterX,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// Importar componentes das abas (serão criados nas próximas fases)
import ListViewTab from "@/components/tabs/ListViewTab";
import MapViewTab from "@/components/tabs/MapViewTab";
import KanbanViewTab from "@/components/tabs/KanbanViewTab";

type ViewType = "lista" | "mapa" | "kanban";

// Contexto de filtros unificados (será expandido na Fase 5)
export interface UnifiedFilters {
  searchQuery: string;
  statusFilter: "all" | "pending" | "rich" | "discarded";
  selectedTagIds: number[];
  mercadoFilters: {
    segmentacao: string[];
    categoria: string[];
    porte: string[];
  };
  geoFilters: {
    ufs: string[];
    cidades: string[];
  };
  qualityFilter: {
    minScore: number;
    maxScore: number;
  };
}

export default function UnifiedCockpit() {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId, pesquisas, selectPesquisa } = useSelectedPesquisa(selectedProjectId);
  const { sidebarClass } = useSidebarState();
  const [location, setLocation] = useLocation();
  
  // Estado da aba ativa (sincronizado com URL)
  const [activeView, setActiveView] = useState<ViewType>("lista");
  
  // Estado para controlar quais abas já foram visitadas (lazy loading)
  const [visitedTabs, setVisitedTabs] = useState<Set<ViewType>>(() => new Set<ViewType>(["lista"]));
  
  // Função para marcar aba como visitada
  const markTabAsVisited = (tab: ViewType) => {
    setVisitedTabs(prev => {
      const newSet = new Set<ViewType>(prev);
      newSet.add(tab);
      return newSet;
    });
  };
  
  // Estado de filtros unificados
  const [filters, setFilters] = useState<UnifiedFilters>({
    searchQuery: "",
    statusFilter: "all",
    selectedTagIds: [],
    mercadoFilters: {
      segmentacao: [],
      categoria: [],
      porte: [],
    },
    geoFilters: {
      ufs: [],
      cidades: [],
    },
    qualityFilter: {
      minScore: 0,
      maxScore: 100,
    },
  });
  
  // Estado do painel lateral de filtros
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Queries para estatísticas
  const { data: mercados } = trpc.mercados.list.useQuery(
    { 
      projectId: selectedProjectId!, 
      pesquisaId: selectedPesquisaId || undefined 
    },
    { enabled: !!selectedProjectId }
  );
  
  const { data: clientes } = trpc.clientes.list.useQuery(
    { 
      projectId: selectedProjectId!, 
      pesquisaId: selectedPesquisaId || undefined 
    },
    { enabled: !!selectedProjectId }
  );
  
  const { data: concorrentes } = trpc.concorrentes.list.useQuery(
    { 
      projectId: selectedProjectId!, 
      pesquisaId: selectedPesquisaId || undefined 
    },
    { enabled: !!selectedProjectId }
  );
  
  const { data: leads } = trpc.leads.list.useQuery(
    { 
      projectId: selectedProjectId!, 
      pesquisaId: selectedPesquisaId || undefined 
    },
    { enabled: !!selectedProjectId }
  );
  
  // Sincronizar aba ativa com URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view") as ViewType | null;
    if (viewParam && ["lista", "mapa", "kanban"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [location]);
  
  // Atualizar URL quando aba mudar
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    markTabAsVisited(view); // Marca aba como visitada para lazy loading
    const params = new URLSearchParams(window.location.search);
    params.set("view", view);
    setLocation(`/?${params.toString()}`, { replace: true });
  };
  
  // Atalhos de teclado
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            handleViewChange("lista");
            break;
          case '2':
            e.preventDefault();
            handleViewChange("mapa");
            break;
          case '3':
            e.preventDefault();
            handleViewChange("kanban");
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);
  
  // Limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      selectedTagIds: [],
      mercadoFilters: {
        segmentacao: [],
        categoria: [],
        porte: [],
      },
      geoFilters: {
        ufs: [],
        cidades: [],
      },
      qualityFilter: {
        minScore: 0,
        maxScore: 100,
      },
    });
    toast.success("Filtros limpos");
  };
  
  // Contar filtros ativos
  const activeFiltersCount = 
    (filters.statusFilter !== "all" ? 1 : 0) +
    filters.selectedTagIds.length +
    filters.mercadoFilters.segmentacao.length +
    filters.mercadoFilters.categoria.length +
    filters.mercadoFilters.porte.length +
    filters.geoFilters.ufs.length +
    filters.geoFilters.cidades.length +
    (filters.qualityFilter.minScore > 0 || filters.qualityFilter.maxScore < 100 ? 1 : 0);
  
  // Estatísticas agregadas
  const stats = {
    mercados: mercados?.length || 0,
    clientes: clientes?.length || 0,
    concorrentes: concorrentes?.length || 0,
    leads: leads?.length || 0,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarClass}`}>
        {/* Header Superior */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container py-4 space-y-4">
            {/* Seletores de Projeto e Pesquisa */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <ProjectSelector />
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <PesquisaSelector />
              </div>
            </div>
            
            {/* Título e Estatísticas */}
            <div>
              <h1 className="text-2xl font-bold mb-2">Cockpit de Gestão</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  {stats.mercados} Mercados
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  {stats.clientes} Clientes
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  {stats.concorrentes} Concorrentes
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {stats.leads} Leads
                </Badge>
              </div>
            </div>
            
            {/* Barra de Ferramentas */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botão de Filtros */}
              <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Painel de filtros será implementado na Fase 5 */}
                    <p className="text-sm text-muted-foreground">
                      Painel de filtros em desenvolvimento...
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Limpar Filtros */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                  <FilterX className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
              
              {/* Botões de Ação */}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Filtro
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sistema de Abas */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeView} onValueChange={(v) => handleViewChange(v as ViewType)} className="h-full flex flex-col">
            <div className="border-b bg-card/30">
              <div className="container">
                <TabsList className="h-12">
                  <TabsTrigger value="lista" className="gap-2">
                    <LayoutList className="h-4 w-4" />
                    Lista
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      Ctrl+1
                    </kbd>
                  </TabsTrigger>
                  <TabsTrigger value="mapa" className="gap-2">
                    <Map className="h-4 w-4" />
                    Mapa
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      Ctrl+2
                    </kbd>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Kanban
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      Ctrl+3
                    </kbd>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="lista" className="h-full m-0 p-0">
                {visitedTabs.has("lista") && (
                  <ListViewTab filters={filters} onFiltersChange={setFilters} />
                )}
              </TabsContent>
              
              <TabsContent value="mapa" className="h-full m-0 p-0">
                {visitedTabs.has("mapa") ? (
                  <MapViewTab filters={filters} onFiltersChange={setFilters} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                      <p className="text-muted-foreground">Carregando mapa...</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="kanban" className="h-full m-0 p-0">
                {visitedTabs.has("kanban") ? (
                  <KanbanViewTab filters={filters} onFiltersChange={setFilters} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                      <p className="text-muted-foreground">Carregando kanban...</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
