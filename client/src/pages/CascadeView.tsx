import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DetailPopup } from "@/components/DetailPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Download,
  ArrowUp,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "rich" | "discarded";
type Page = "mercados" | "clientes" | "concorrentes" | "leads";
type ValidationStatus = "pending" | "rich" | "needs_adjustment" | "discarded";

export default function CascadeView() {
  const [currentPage, setCurrentPage] = useState<Page>("mercados");
  const [selectedMercadoId, setSelectedMercadoId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");
  
  // Estados para validação em lote
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<ValidationStatus>("rich");
  const [batchNotes, setBatchNotes] = useState("");
  
  // Estados para scroll tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  const utils = trpc.useUtils();
  const updateClienteMutation = trpc.clientes.updateValidation.useMutation({
    onSuccess: () => {
      utils.clientes.byMercado.invalidate();
      utils.mercados.list.invalidate();
    },
  });
  const updateConcorrenteMutation = trpc.concorrentes.updateValidation.useMutation({
    onSuccess: () => {
      utils.concorrentes.byMercado.invalidate();
      utils.mercados.list.invalidate();
    },
  });
  const updateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate();
      utils.mercados.list.invalidate();
    },
  });

  const mercadoSelecionado = mercados?.find((m) => m.id === selectedMercadoId);

  // Monitorar scroll para mostrar botão voltar ao topo
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const handleScroll = () => {
      setShowScrollTop(viewport.scrollTop > 200);
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcular totais gerais
  const totalMercados = mercados?.length || 0;
  const totalClientes = mercados?.reduce((sum, m) => sum + (m.quantidadeClientes || 0), 0) || 0;
  const totalConcorrentes = 591; // Fixo conforme dados
  const totalLeads = 727; // Fixo conforme dados

  // Filtrar por status
  const filterByStatus = (items: any[]) => {
    if (statusFilter === "all") return items;
    if (statusFilter === "pending") return items.filter((i) => i.validationStatus === "pending");
    if (statusFilter === "rich") return items.filter((i) => i.validationStatus === "rich");
    if (statusFilter === "discarded") return items.filter((i) => i.validationStatus === "discarded");
    return items;
  };

  // Busca global inteligente
  const searchInText = (text: string | null | undefined) => {
    if (!text) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    let filtered = filterByStatus(clientes);
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          searchInText(c.empresa) ||
          searchInText(c.cnpj) ||
          searchInText(c.produtoPrincipal) ||
          searchInText(c.cidade)
      );
    }
    return filtered;
  }, [clientes, statusFilter, searchQuery]);

  const filteredConcorrentes = useMemo(() => {
    if (!concorrentes) return [];
    let filtered = filterByStatus(concorrentes);
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          searchInText(c.nome) ||
          searchInText(c.cnpj) ||
          searchInText(c.produto)
      );
    }
    return filtered;
  }, [concorrentes, statusFilter, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    let filtered = filterByStatus(leads);
    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          searchInText(l.nome) ||
          searchInText(l.cnpj) ||
          searchInText(l.regiao)
      );
    }
    return filtered;
  }, [leads, statusFilter, searchQuery]);

  // Contador de resultados de busca
  const searchResultsCount = useMemo(() => {
    if (!searchQuery) return null;
    return {
      clientes: filteredClientes.length,
      concorrentes: filteredConcorrentes.length,
      leads: filteredLeads.length,
    };
  }, [searchQuery, filteredClientes, filteredConcorrentes, filteredLeads]);

  // Funções de navegação
  const scrollToTop = () => {
    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectMercado = (id: number) => {
    setSelectedMercadoId(id);
    setCurrentPage("clientes");
    setSelectedItems(new Set());
    setTimeout(scrollToTop, 100);
  };

  const handleNextPage = () => {
    if (currentPage === "mercados") setCurrentPage("clientes");
    else if (currentPage === "clientes") setCurrentPage("concorrentes");
    else if (currentPage === "concorrentes") setCurrentPage("leads");
    setSelectedItems(new Set());
    setTimeout(scrollToTop, 100);
  };

  const handlePrevPage = () => {
    if (currentPage === "leads") setCurrentPage("concorrentes");
    else if (currentPage === "concorrentes") setCurrentPage("clientes");
    else if (currentPage === "clientes") setCurrentPage("mercados");
    setSelectedItems(new Set());
    setTimeout(scrollToTop, 100);
  };

  const getPageTitle = () => {
    if (currentPage === "mercados") return "Selecione um Mercado";
    if (currentPage === "clientes") return `Clientes - ${mercadoSelecionado?.nome || ""}`;
    if (currentPage === "concorrentes") return `Concorrentes - ${mercadoSelecionado?.nome || ""}`;
    if (currentPage === "leads") return `Leads - ${mercadoSelecionado?.nome || ""}`;
    return "";
  };

  const getPageNumber = () => {
    if (currentPage === "mercados") return 1;
    if (currentPage === "clientes") return 2;
    if (currentPage === "concorrentes") return 3;
    if (currentPage === "leads") return 4;
    return 1;
  };

  // Ícones de status
  const getStatusIcon = (status: string | null) => {
    if (status === "rich") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "needs_adjustment") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (status === "discarded") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  // Checkbox handlers
  const toggleItemSelection = (id: number) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const toggleSelectAll = () => {
    if (currentPage === "clientes") {
      if (selectedItems.size === filteredClientes.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredClientes.map((c) => c.id)));
      }
    } else if (currentPage === "concorrentes") {
      if (selectedItems.size === filteredConcorrentes.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredConcorrentes.map((c) => c.id)));
      }
    } else if (currentPage === "leads") {
      if (selectedItems.size === filteredLeads.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredLeads.map((l) => l.id)));
      }
    }
  };

  // Validação em lote
  const handleBatchValidation = async () => {
    if (selectedItems.size === 0) return;

    try {
      const ids = Array.from(selectedItems);
      
      if (currentPage === "clientes") {
        await Promise.all(
          ids.map((id) =>
            updateClienteMutation.mutateAsync({
              id,
              status: batchStatus,
              notes: batchNotes,
            })
          )
        );
      } else if (currentPage === "concorrentes") {
        await Promise.all(
          ids.map((id) =>
            updateConcorrenteMutation.mutateAsync({
              id,
              status: batchStatus,
              notes: batchNotes,
            })
          )
        );
      } else if (currentPage === "leads") {
        await Promise.all(
          ids.map((id) =>
            updateLeadMutation.mutateAsync({
              id,
              status: batchStatus,
              notes: batchNotes,
            })
          )
        );
      }

      toast.success(`${selectedItems.size} itens validados com sucesso!`);
      setSelectedItems(new Set());
      setBatchModalOpen(false);
      setBatchNotes("");
    } catch (error) {
      toast.error("Erro ao validar itens em lote");
    }
  };

  // Exportação de dados filtrados
  const handleExportFiltered = () => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = "";

    if (currentPage === "clientes") {
      data = filteredClientes;
      headers = ["ID", "Empresa", "CNPJ", "Produto", "Segmentação", "Cidade", "UF", "Status"];
      filename = "clientes_filtrados.csv";
    } else if (currentPage === "concorrentes") {
      data = filteredConcorrentes;
      headers = ["ID", "Nome", "CNPJ", "Produto", "Porte", "Score", "Status"];
      filename = "concorrentes_filtrados.csv";
    } else if (currentPage === "leads") {
      data = filteredLeads;
      headers = ["ID", "Nome", "CNPJ", "Tipo", "Porte", "Região", "Status"];
      filename = "leads_filtrados.csv";
    } else {
      toast.error("Selecione uma página com dados para exportar");
      return;
    }

    if (data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    // Gerar CSV
    const csvContent = [
      headers.join(","),
      ...data.map((item) => {
        if (currentPage === "clientes") {
          return [
            item.id,
            `"${item.empresa || ""}"`,
            item.cnpj || "",
            `"${item.produtoPrincipal || ""}"`,
            item.segmentacaoB2bB2c || "",
            item.cidade || "",
            item.uf || "",
            item.validationStatus || "pending",
          ].join(",");
        } else if (currentPage === "concorrentes") {
          return [
            item.id,
            `"${item.nome || ""}"`,
            item.cnpj || "",
            `"${item.produto || ""}"`,
            item.porte || "",
            item.qualidadeScore || "",
            item.validationStatus || "pending",
          ].join(",");
        } else {
          return [
            item.id,
            `"${item.nome || ""}"`,
            item.cnpj || "",
            item.tipo || "",
            item.porte || "",
            item.regiao || "",
            item.validationStatus || "pending",
          ].join(",");
        }
      }),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast.success(`${data.length} itens exportados com sucesso!`);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GESTOR PAV</h1>
          <p className="text-sm text-muted-foreground">Pesquisa de Mercado</p>
        </div>
        <div className="flex items-center gap-4">
          {currentPage !== "mercados" && (
            <Button variant="outline" size="sm" onClick={handleExportFiltered}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Filtrados
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[280px] border-r border-border/40 p-6 flex flex-col gap-6">
          {/* Busca Global */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Busca Global
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nome, CNPJ, produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchResultsCount && (
              <p className="text-xs text-muted-foreground mt-2">
                {searchResultsCount.clientes} clientes, {searchResultsCount.concorrentes} concorrentes,{" "}
                {searchResultsCount.leads} leads
              </p>
            )}
          </div>

          {/* Estatísticas */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Estatísticas</h3>
            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mercados</p>
                    <p className="text-2xl font-bold">{totalMercados}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                    <p className="text-2xl font-bold">{totalClientes}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Concorrentes</p>
                    <p className="text-2xl font-bold">{totalConcorrentes}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold">{totalLeads}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Filtros</h3>
            <div className="space-y-2">
              <Button
                variant={statusFilter === "all" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setStatusFilter("pending")}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "rich" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setStatusFilter("rich")}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validados
              </Button>
              <Button
                variant={statusFilter === "discarded" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setStatusFilter("discarded")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Descartados
              </Button>
            </div>
          </div>

          {/* Mercado Atual */}
          {mercadoSelecionado && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Mercado Atual</h3>
              <div className="glass-card p-3">
                <p className="text-sm font-medium truncate">{mercadoSelecionado.nome}</p>
                <Badge variant="outline" className="text-xs mt-2">
                  {mercadoSelecionado.segmentacao}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Área Principal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header da Página */}
          <div className="px-6 py-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Página {getPageNumber()} de 4</p>
                  {currentPage === "mercados" && (
                    <Badge variant="outline" className="text-xs">
                      {mercados?.length || 0} mercados
                    </Badge>
                  )}
                  {currentPage === "clientes" && (
                    <Badge variant="outline" className="text-xs">
                      {filteredClientes.length} de {clientes?.length || 0} clientes
                    </Badge>
                  )}
                  {currentPage === "concorrentes" && (
                    <Badge variant="outline" className="text-xs">
                      {filteredConcorrentes.length} de {concorrentes?.length || 0} concorrentes
                    </Badge>
                  )}
                  {currentPage === "leads" && (
                    <Badge variant="outline" className="text-xs">
                      {filteredLeads.length} de {leads?.length || 0} leads
                    </Badge>
                  )}
                </div>
              </div>
              {currentPage !== "mercados" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      (currentPage === "clientes" && selectedItems.size === filteredClientes.length) ||
                      (currentPage === "concorrentes" && selectedItems.size === filteredConcorrentes.length) ||
                      (currentPage === "leads" && selectedItems.size === filteredLeads.length)
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Selecionar todos ({selectedItems.size})</span>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-hidden p-6">
            <div className="h-full max-w-6xl mx-auto">
              <div className="glass-card h-full flex flex-col" ref={scrollAreaRef}>
                <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 280px)' }}>
                  <div className="p-4">
                    {/* Lista de Mercados */}
                    {currentPage === "mercados" && (
                      <div className="space-y-2">
                        {mercados?.map((mercado) => (
                          <div
                            key={mercado.id}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                            onClick={() => handleSelectMercado(mercado.id)}
                          >
                            <div className="flex-1">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {mercado.nome}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {mercado.segmentacao}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {mercado.quantidadeClientes} clientes
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lista de Clientes */}
                    {currentPage === "clientes" && (
                      <div className="space-y-2">
                        {filteredClientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            <Checkbox
                              checked={selectedItems.has(cliente.id)}
                              onCheckedChange={() => toggleItemSelection(cliente.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div
                              className="flex-1"
                              onClick={() => {
                                setDetailPopupItem(cliente);
                                setDetailPopupType("cliente");
                                setDetailPopupOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(cliente.validationStatus)}
                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                  {cliente.empresa}
                                </h3>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {cliente.segmentacaoB2bB2c}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {cliente.cidade}, {cliente.uf}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {cliente.produtoPrincipal}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lista de Concorrentes */}
                    {currentPage === "concorrentes" && (
                      <div className="space-y-2">
                        {filteredConcorrentes.map((concorrente) => (
                          <div
                            key={concorrente.id}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            <Checkbox
                              checked={selectedItems.has(concorrente.id)}
                              onCheckedChange={() => toggleItemSelection(concorrente.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div
                              className="flex-1"
                              onClick={() => {
                                setDetailPopupItem(concorrente);
                                setDetailPopupType("concorrente");
                                setDetailPopupOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(concorrente.validationStatus)}
                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                  {concorrente.nome}
                                </h3>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {concorrente.porte}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Score: {concorrente.qualidadeScore}%
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">{concorrente.produto}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lista de Leads */}
                    {currentPage === "leads" && (
                      <div className="space-y-2">
                        {filteredLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                          >
                            <Checkbox
                              checked={selectedItems.has(lead.id)}
                              onCheckedChange={() => toggleItemSelection(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div
                              className="flex-1"
                              onClick={() => {
                                setDetailPopupItem(lead);
                                setDetailPopupType("lead");
                                setDetailPopupOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(lead.validationStatus)}
                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                  {lead.nome}
                                </h3>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {lead.tipo}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{lead.porte}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">{lead.regiao}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === "mercados"}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {selectedItems.size > 0 && currentPage !== "mercados" && (
              <Button onClick={() => setBatchModalOpen(true)}>
                Validar Selecionados ({selectedItems.size})
              </Button>
            )}

            {currentPage === "mercados" && (
              <span className="text-sm text-muted-foreground">
                Selecione um mercado para continuar
              </span>
            )}

            <Button
              onClick={handleNextPage}
              disabled={currentPage === "leads" || (currentPage === "mercados" && !selectedMercadoId)}
            >
              Avançar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Validação em Lote */}
      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validar {selectedItems.size} itens selecionados</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Status de Validação</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={batchStatus === "rich" ? "default" : "outline"}
                  onClick={() => setBatchStatus("rich")}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Rico
                </Button>
                <Button
                  variant={batchStatus === "needs_adjustment" ? "default" : "outline"}
                  onClick={() => setBatchStatus("needs_adjustment")}
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Precisa Ajuste
                </Button>
                <Button
                  variant={batchStatus === "discarded" ? "default" : "outline"}
                  onClick={() => setBatchStatus("discarded")}
                  className="w-full col-span-2"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Descartado
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="batch-notes">Observações (opcional)</Label>
              <Textarea
                id="batch-notes"
                placeholder="Adicione observações sobre a validação..."
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBatchValidation}>
              Validar {selectedItems.size} itens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pop-up de Detalhes */}
      <DetailPopup
        isOpen={detailPopupOpen}
        item={detailPopupItem}
        type={detailPopupType}
        onClose={() => setDetailPopupOpen(false)}
      />

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg glass-card border-border/40 hover:scale-110 transition-all duration-300 z-50"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

