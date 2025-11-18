import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DetailPopup } from "@/components/DetailPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Home,
  Menu,
  X,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "rich" | "discarded";
type NavigationLevel = "mercados" | "itens" | "detalhes";

export default function CascadeView() {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>("mercados");
  const [selectedMercadoId, setSelectedMercadoId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({ search: "" });
  const { data: clientes } = trpc.clientes.byMercado.useQuery(
    { mercadoId: selectedMercadoId! },
    { enabled: !!selectedMercadoId }
  );
  const { data: concorrentes } = trpc.concorrentes.byMercado.useQuery(
    { mercadoId: selectedMercadoId! },
    { enabled: !!selectedMercadoId }
  );
  const { data: leads } = trpc.leads.byMercado.useQuery(
    { mercadoId: selectedMercadoId! },
    { enabled: !!selectedMercadoId }
  );

  const mercadoSelecionado = mercados?.find((m) => m.id === selectedMercadoId);

  // Calcular totais gerais
  const totalMercados = mercados?.length || 0;
  const totalClientes = mercados?.reduce((sum, m) => sum + (m.quantidadeClientes || 0), 0) || 0;
  const totalConcorrentes = 591;
  const totalLeads = 727;

  const handleSelectMercado = (mercadoId: number) => {
    setSelectedMercadoId(mercadoId);
    setCurrentLevel("itens");
  };

  const handleOpenDetail = (item: any, type: "cliente" | "concorrente" | "lead") => {
    setDetailPopupItem(item);
    setDetailPopupType(type);
    setDetailPopupOpen(true);
  };

  const handleVoltar = () => {
    if (currentLevel === "itens") {
      setCurrentLevel("mercados");
      setSelectedMercadoId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rich":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "needs_adjustment":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "discarded":
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filterByStatus = (items: any[]) => {
    if (statusFilter === "all") return items;
    return items.filter((item) => item.validationStatus === statusFilter);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Fixo */}
      <aside
        className={`
          ${sidebarOpen ? "w-72" : "w-0"}
          transition-all duration-300 overflow-hidden
          border-r border-border bg-card/50 backdrop-blur-sm
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">GESTOR PAV</h1>
            <ThemeToggle />
          </div>
          <p className="text-xs text-muted-foreground">Pesquisa de Mercado</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* KPIs */}
            <div>
              <h3 className="section-title mb-3">Estatísticas</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Mercados</span>
                  </div>
                  <p className="text-2xl font-bold">{totalMercados}</p>
                </div>
                <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-info" />
                    <span className="text-xs text-muted-foreground">Clientes</span>
                  </div>
                  <p className="text-2xl font-bold">{totalClientes}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground">Concorrentes</span>
                  </div>
                  <p className="text-2xl font-bold">{totalConcorrentes}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">Leads</span>
                  </div>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div>
              <h3 className="section-title mb-3">Filtros</h3>
              <div className="space-y-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className="w-full justify-start text-sm"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                  className="w-full justify-start text-sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pendentes
                </Button>
                <Button
                  variant={statusFilter === "rich" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("rich")}
                  className="w-full justify-start text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validados
                </Button>
                <Button
                  variant={statusFilter === "discarded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("discarded")}
                  className="w-full justify-start text-sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Descartados
                </Button>
              </div>
            </div>

            {/* Navegação Hierárquica */}
            {selectedMercadoId && mercadoSelecionado && (
              <div>
                <h3 className="section-title mb-3">Navegação</h3>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Home className="h-3 w-3" />
                    <ChevronRight className="h-3 w-3" />
                    <span className="truncate">{mercadoSelecionado.nome}</span>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Clientes:</span>
                      <span className="ml-2 font-semibold">{clientes?.length || 0}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Concorrentes:</span>
                      <span className="ml-2 font-semibold">{concorrentes?.length || 0}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Leads:</span>
                      <span className="ml-2 font-semibold">{leads?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Botão Toggle Sidebar (Mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Área Principal */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Breadcrumbs + Botão Voltar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              {currentLevel === "mercados" && <span>Mercados</span>}
              {currentLevel === "itens" && mercadoSelecionado && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground font-medium">{mercadoSelecionado.nome}</span>
                </>
              )}
            </div>
            {currentLevel === "itens" && (
              <Button variant="outline" size="sm" onClick={handleVoltar}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto">
          {/* Nível 1: Lista de Mercados */}
          {currentLevel === "mercados" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Selecione um Mercado</h2>
              {isLoading && <p className="text-muted-foreground">Carregando...</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mercados?.map((mercado) => (
                  <div
                    key={mercado.id}
                    onClick={() => handleSelectMercado(mercado.id)}
                    className="glass-card p-5 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {mercado.nome}
                        </h3>
                        {mercado.segmentacao && (
                          <Badge variant="outline" className="text-xs">
                            {mercado.segmentacao}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{mercado.quantidadeClientes || 0} clientes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nível 2: Clientes, Concorrentes e Leads */}
          {currentLevel === "itens" && selectedMercadoId && mercadoSelecionado && (
            <div className="space-y-8">
              {/* Clientes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-info" />
                    Clientes
                  </h2>
                  <Badge variant="outline">{filterByStatus(clientes || []).length} registros</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(clientes || []).map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => handleOpenDetail(cliente, "cliente")}
                      className="glass-card p-4 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors">
                          {cliente.empresa}
                        </h3>
                        {getStatusIcon(cliente.validationStatus || "pending")}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {cliente.produtoPrincipal || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {cliente.cidade && (
                          <span className="text-muted-foreground">{cliente.cidade}</span>
                        )}
                        {cliente.segmentacaoB2bB2c && (
                          <Badge variant="outline" className="text-[10px]">
                            {cliente.segmentacaoB2bB2c}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filterByStatus(clientes || []).length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                      Nenhum cliente encontrado
                    </p>
                  )}
                </div>
              </div>

              {/* Concorrentes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-warning" />
                    Concorrentes
                  </h2>
                  <Badge variant="outline">{filterByStatus(concorrentes || []).length} registros</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(concorrentes || []).map((concorrente) => (
                    <div
                      key={concorrente.id}
                      onClick={() => handleOpenDetail(concorrente, "concorrente")}
                      className="glass-card p-4 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors">
                          {concorrente.nome}
                        </h3>
                        {getStatusIcon(concorrente.validationStatus || "pending")}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {concorrente.produto || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {concorrente.porte && (
                          <Badge variant="outline" className="text-[10px]">
                            {concorrente.porte}
                          </Badge>
                        )}
                        {concorrente.qualidadeScore && (
                          <span className="text-muted-foreground">
                            Score: {concorrente.qualidadeScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {filterByStatus(concorrentes || []).length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                      Nenhum concorrente encontrado
                    </p>
                  )}
                </div>
              </div>

              {/* Leads */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Leads
                  </h2>
                  <Badge variant="outline">{filterByStatus(leads || []).length} registros</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(leads || []).map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleOpenDetail(lead, "lead")}
                      className="glass-card p-4 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm flex-1 group-hover:text-primary transition-colors">
                          {lead.nome}
                        </h3>
                        {getStatusIcon(lead.validationStatus || "pending")}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {lead.regiao || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {lead.tipo && (
                          <Badge variant="outline" className="text-[10px]">
                            {lead.tipo}
                          </Badge>
                        )}
                        {lead.porte && (
                          <span className="text-muted-foreground">{lead.porte}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {filterByStatus(leads || []).length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                      Nenhum lead encontrado
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Popup */}
      <DetailPopup
        isOpen={detailPopupOpen}
        onClose={() => setDetailPopupOpen(false)}
        item={detailPopupItem}
        type={detailPopupType}
      />
    </div>
  );
}

