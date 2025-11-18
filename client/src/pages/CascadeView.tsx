import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DetailPopup } from "@/components/DetailPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

type StatusFilter = "all" | "pending" | "rich" | "discarded";
type Page = "mercados" | "clientes" | "concorrentes" | "leads";

export default function CascadeView() {
  const [currentPage, setCurrentPage] = useState<Page>("mercados");
  const [selectedMercadoId, setSelectedMercadoId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");

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
    setCurrentPage("clientes");
  };

  const handleAvancar = () => {
    if (currentPage === "mercados" && selectedMercadoId) {
      setCurrentPage("clientes");
    } else if (currentPage === "clientes") {
      setCurrentPage("concorrentes");
    } else if (currentPage === "concorrentes") {
      setCurrentPage("leads");
    }
  };

  const handleVoltar = () => {
    if (currentPage === "leads") {
      setCurrentPage("concorrentes");
    } else if (currentPage === "concorrentes") {
      setCurrentPage("clientes");
    } else if (currentPage === "clientes") {
      setCurrentPage("mercados");
      setSelectedMercadoId(null);
    }
  };

  const handleOpenDetail = (item: any, type: "cliente" | "concorrente" | "lead") => {
    setDetailPopupItem(item);
    setDetailPopupType(type);
    setDetailPopupOpen(true);
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

  const getPageNumber = () => {
    switch (currentPage) {
      case "mercados":
        return 1;
      case "clientes":
        return 2;
      case "concorrentes":
        return 3;
      case "leads":
        return 4;
      default:
        return 1;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "mercados":
        return "Selecione um Mercado";
      case "clientes":
        return "Clientes";
      case "concorrentes":
        return "Concorrentes";
      case "leads":
        return "Leads";
      default:
        return "";
    }
  };

  const canAvancar = () => {
    if (currentPage === "mercados") return false;
    if (currentPage === "leads") return false;
    return true;
  };

  const canVoltar = () => {
    return currentPage !== "mercados";
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Fixo */}
        <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
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
                  <h3 className="section-title mb-3">Mercado Atual</h3>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs font-semibold mb-2 truncate">
                      {mercadoSelecionado.nome}
                    </p>
                    <div className="space-y-1">
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

        {/* Área Principal */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 flex-shrink-0">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Página {getPageNumber()} de 4
                  {mercadoSelecionado && ` • ${mercadoSelecionado.nome}`}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {currentPage === "mercados" && `${totalMercados} mercados`}
                {currentPage === "clientes" && `${filterByStatus(clientes || []).length} clientes`}
                {currentPage === "concorrentes" && `${filterByStatus(concorrentes || []).length} concorrentes`}
                {currentPage === "leads" && `${filterByStatus(leads || []).length} leads`}
              </Badge>
            </div>
          </div>

          {/* Conteúdo com Caixa Fixa */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-6xl mx-auto p-6">
              <div className="glass-card h-full flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {/* Página 1: Mercados */}
                    {currentPage === "mercados" && (
                      <div className="space-y-1">
                        {isLoading && <p className="text-muted-foreground p-4">Carregando...</p>}
                        {mercados?.map((mercado) => (
                          <div
                            key={mercado.id}
                            onClick={() => handleSelectMercado(mercado.id)}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {mercado.nome}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                {mercado.segmentacao && (
                                  <Badge variant="outline" className="text-xs">
                                    {mercado.segmentacao}
                                  </Badge>
                                )}
                                <span>{mercado.quantidadeClientes || 0} clientes</span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Página 2: Clientes */}
                    {currentPage === "clientes" && (
                      <div className="space-y-1">
                        {filterByStatus(clientes || []).map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => handleOpenDetail(cliente, "cliente")}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            {getStatusIcon(cliente.validationStatus || "pending")}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {cliente.empresa}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {cliente.produtoPrincipal || "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {cliente.segmentacaoB2bB2c && (
                                <Badge variant="outline" className="text-xs">
                                  {cliente.segmentacaoB2bB2c}
                                </Badge>
                              )}
                              {cliente.cidade && (
                                <span className="text-xs text-muted-foreground">
                                  {cliente.cidade}, {cliente.uf}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {filterByStatus(clientes || []).length === 0 && (
                          <p className="text-center text-muted-foreground py-12">
                            Nenhum cliente encontrado
                          </p>
                        )}
                      </div>
                    )}

                    {/* Página 3: Concorrentes */}
                    {currentPage === "concorrentes" && (
                      <div className="space-y-1">
                        {filterByStatus(concorrentes || []).map((concorrente) => (
                          <div
                            key={concorrente.id}
                            onClick={() => handleOpenDetail(concorrente, "concorrente")}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            {getStatusIcon(concorrente.validationStatus || "pending")}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {concorrente.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {concorrente.produto || "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {concorrente.porte && (
                                <Badge variant="outline" className="text-xs">
                                  {concorrente.porte}
                                </Badge>
                              )}
                              {concorrente.qualidadeScore && (
                                <span className="text-xs text-muted-foreground">
                                  Score: {concorrente.qualidadeScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {filterByStatus(concorrentes || []).length === 0 && (
                          <p className="text-center text-muted-foreground py-12">
                            Nenhum concorrente encontrado
                          </p>
                        )}
                      </div>
                    )}

                    {/* Página 4: Leads */}
                    {currentPage === "leads" && (
                      <div className="space-y-1">
                        {filterByStatus(leads || []).map((lead) => (
                          <div
                            key={lead.id}
                            onClick={() => handleOpenDetail(lead, "lead")}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            {getStatusIcon(lead.validationStatus || "pending")}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {lead.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {lead.regiao || "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {lead.tipo && (
                                <Badge variant="outline" className="text-xs">
                                  {lead.tipo}
                                </Badge>
                              )}
                              {lead.porte && (
                                <span className="text-xs text-muted-foreground">
                                  {lead.porte}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {filterByStatus(leads || []).length === 0 && (
                          <p className="text-center text-muted-foreground py-12">
                            Nenhum lead encontrado
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Footer com Botões de Navegação */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleVoltar}
                disabled={!canVoltar()}
                className="min-w-[120px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentPage === "mercados" && "Selecione um mercado para continuar"}
                {currentPage === "clientes" && "Clique em Avançar para ver concorrentes"}
                {currentPage === "concorrentes" && "Clique em Avançar para ver leads"}
                {currentPage === "leads" && "Última página"}
              </div>
              <Button
                variant="default"
                onClick={handleAvancar}
                disabled={!canAvancar()}
                className="min-w-[120px]"
              >
                Avançar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>

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

