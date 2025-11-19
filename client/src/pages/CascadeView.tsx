import { useState, useEffect, useRef, useMemo } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, pageTransition, listVariants, listItemVariants } from "@/lib/animations";
import { calculateQualityScore, classifyQuality, isValidCNPJFormat, isValidEmailFormat } from "@shared/qualityScore";
import { trpc } from "@/lib/trpc";
// ThemeToggle removido - sistema usa apenas tema light
import { DetailPopup } from "@/components/DetailPopup";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TagManager } from "@/components/TagManager";
import { EntityTagPicker } from "@/components/EntityTagPicker";
import { TagFilter } from "@/components/TagFilter";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { SearchFieldSelector, SearchField } from "@/components/SearchFieldSelector";
import { SaveFilterDialog } from "@/components/SaveFilterDialog";
import { SavedFilters } from "@/components/SavedFilters";
import { SavedFiltersManager } from "@/components/SavedFiltersManager";
import { CompararMercadosModal } from "@/components/CompararMercadosModal";
import { SkeletonMercado, SkeletonCliente, SkeletonConcorrente, SkeletonLead } from "@/components/SkeletonLoading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  AlertTriangle,
  MapPin,
  Briefcase,
  Package,
  Save,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF, ExportData } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KanbanBoard from "@/components/KanbanBoard";
import { LayoutList, LayoutGrid, BarChart3, FilterX } from "lucide-react";
import { Link } from "wouter";
import SearchHistory, { addToSearchHistory } from "@/components/SearchHistory";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { ProjectSelector } from "@/components/ProjectSelector";

type StatusFilter = "all" | "pending" | "rich" | "discarded";
type Page = "mercados" | "clientes" | "concorrentes" | "leads";
type ValidationStatus = "pending" | "rich" | "needs_adjustment" | "discarded";
type ViewMode = "list" | "kanban";

export default function CascadeView() {
  const { selectedProjectId } = useSelectedProject();
  const [currentPage, setCurrentPage] = useState<Page>("mercados");
  const [selectedMercadoId, setSelectedMercadoId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFields, setSearchFields] = useState<SearchField[]>(["nome", "cnpj", "produto"]); // Campos padrão
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  // Estados para comparação de mercados
  const [selectedMercadosForComparison, setSelectedMercadosForComparison] = useState<number[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  
  // Estados para filtros avançados
  const [mercadoFilters, setMercadoFilters] = useState<{
    segmentacao: string[];
    categoria: string[];
  }>({
    segmentacao: [],
    categoria: [],
  });
  
  const [clienteFilters, setClienteFilters] = useState<{
    segmentacao: string[];
    cidade: string[];
    uf: string[];
  }>({
    segmentacao: [],
    cidade: [],
    uf: [],
  });
  
  const [concorrenteFilters, setConcorrenteFilters] = useState<{
    porte: string[];
  }>({
    porte: [],
  });
  
  const [leadFilters, setLeadFilters] = useState<{
    tipo: string[];
    porte: string[];
  }>({
    tipo: [],
    porte: [],
  });
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");
  
  // Estados para validação em lote
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<ValidationStatus>("rich");
  const [batchNotes, setBatchNotes] = useState("");
  
  // Estado para salvar filtros
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  
  // Estados para scroll tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para paginação
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 20;

  const { data: mercados, isLoading } = trpc.mercados.list.useQuery(
    { projectId: selectedProjectId!, search: "" },
    { enabled: !!selectedProjectId }
  );
  const { data: clientesResponse } = trpc.clientes.byMercado.useQuery(
    { mercadoId: selectedMercadoId!, page: currentPageNum, pageSize },
    { enabled: !!selectedMercadoId }
  );
  const { data: concorrentesResponse } = trpc.concorrentes.byMercado.useQuery(
    { mercadoId: selectedMercadoId!, page: currentPageNum, pageSize },
    { enabled: !!selectedMercadoId }
  );
  const { data: leadsResponse } = trpc.leads.byMercado.useQuery(
    { mercadoId: selectedMercadoId!, page: currentPageNum, pageSize },
    { enabled: !!selectedMercadoId }
  );
  
  // Extrair dados da resposta paginada
  const clientes = clientesResponse?.data || [];
  const concorrentes = concorrentesResponse?.data || [];
  const leads = leadsResponse?.data || [];

  // Queries para filtrar por tags (apenas quando tags estão selecionadas)
  const { data: clientesComTags = [] } = trpc.tags.getEntitiesByTag.useQuery(
    { tagId: selectedTagIds[0] || 0, entityType: "cliente" },
    { enabled: selectedTagIds.length > 0 && currentPage === "clientes" }
  );
  const { data: concorrentesComTags = [] } = trpc.tags.getEntitiesByTag.useQuery(
    { tagId: selectedTagIds[0] || 0, entityType: "concorrente" },
    { enabled: selectedTagIds.length > 0 && currentPage === "concorrentes" }
  );
  const { data: leadsComTags = [] } = trpc.tags.getEntitiesByTag.useQuery(
    { tagId: selectedTagIds[0] || 0, entityType: "lead" },
    { enabled: selectedTagIds.length > 0 && currentPage === "leads" }
  );

  // Atalhos de teclado
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
      description: 'Focar no campo de busca',
    },
    {
      key: '/',
      handler: () => {
        searchInputRef.current?.focus();
      },
      description: 'Focar no campo de busca',
    },
    {
      key: 'Escape',
      handler: () => {
        if (detailPopupOpen) {
          setDetailPopupOpen(false);
        } else if (batchModalOpen) {
          setBatchModalOpen(false);
        }
      },
      description: 'Fechar modals',
    },
  ]);
  
  // Metadata de paginação
  const clientesMeta = clientesResponse || { total: 0, page: 1, totalPages: 0 };
  const concorrentesMeta = concorrentesResponse || { total: 0, page: 1, totalPages: 0 };
  const leadsMeta = leadsResponse || { total: 0, page: 1, totalPages: 0 };

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
  
  const saveFilterMutation = trpc.savedFilters.create.useMutation({
    onSuccess: () => {
      utils.savedFilters.list.invalidate();
      toast.success("Filtro salvo com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar filtro");
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

  // Buscar totais dinâmicos do backend
  // Se selectedProjectId for null, busca todos os projetos
  const { data: totals } = trpc.stats.totals.useQuery({ 
    projectId: selectedProjectId || undefined // undefined = todos os projetos
  });
  
  // Calcular totais gerais
  const totalMercados = totals?.mercados || 0;
  const totalClientes = totals?.clientes || 0;
  const totalConcorrentes = totals?.concorrentes || 0;
  const totalLeads = totals?.leads || 0;

  // Filtrar por status
  const filterByStatus = (items: any[]) => {
    if (statusFilter === "all") return items;
    if (statusFilter === "pending") return items.filter((i) => i.validationStatus === "pending");
    if (statusFilter === "rich") return items.filter((i) => i.validationStatus === "rich");
    if (statusFilter === "discarded") return items.filter((i) => i.validationStatus === "discarded");
    return items;
  };

  // Busca global multi-campo
  const matchesSearch = (item: any, type: "mercado" | "cliente" | "concorrente" | "lead") => {
    if (!searchQuery || searchFields.length === 0) return true;
    
    const query = searchQuery.toLowerCase();
    const checkField = (value: string | null | undefined) => {
      if (!value) return false;
      return value.toLowerCase().includes(query);
    };

    return searchFields.some((field) => {
      switch (field) {
        case "nome":
          if (type === "mercado") return checkField(item.nome);
          if (type === "cliente") return checkField(item.empresa);
          if (type === "concorrente") return checkField(item.nome);
          if (type === "lead") return checkField(item.nome);
          return false;
        
        case "cnpj":
          return checkField(item.cnpj);
        
        case "produto":
          if (type === "mercado") return checkField(item.categoria);
          if (type === "cliente") return checkField(item.produtoPrincipal);
          if (type === "concorrente") return checkField(item.produto);
          return false;
        
        case "cidade":
          if (type === "cliente") return checkField(item.cidade);
          if (type === "lead") return checkField(item.regiao); // Região como aproximação
          return false;
        
        case "uf":
          if (type === "cliente") return checkField(item.uf);
          return false;
        
        case "email":
          return checkField(item.email);
        
        case "telefone":
          return checkField(item.telefone);
        
        case "observacoes":
          return checkField(item.observacoes) || checkField(item.notas);
        
        default:
          return false;
      }
    });
  };

  const filteredMercados = useMemo(() => {
    if (!mercados) return [];
    let filtered = filterByStatus(mercados);
    
    // Busca multi-campo
    if (searchQuery && searchFields.length > 0) {
      filtered = filtered.filter((m) => matchesSearch(m, "mercado"));
    }
    
    // Filtrar por segmentação
    if (mercadoFilters.segmentacao.length > 0) {
      filtered = filtered.filter((m) =>
        mercadoFilters.segmentacao.includes(m.segmentacao || "")
      );
    }
    
    return filtered;
  }, [mercados, statusFilter, searchQuery, searchFields, mercadoFilters]);

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    let filtered = filterByStatus(clientes);
    
    // Busca multi-campo
    if (searchQuery && searchFields.length > 0) {
      filtered = filtered.filter((c) => matchesSearch(c, "cliente"));
    }
    // Filtrar por tags
    if (selectedTagIds.length > 0) {
      const idsComTags = new Set(clientesComTags);
      filtered = filtered.filter((c) => idsComTags.has(c.id));
    }
    // Filtrar por segmentação
    if (clienteFilters.segmentacao.length > 0) {
      filtered = filtered.filter((c) =>
        clienteFilters.segmentacao.includes(c.segmentacaoB2bB2c || "")
      );
    }
    // Filtrar por UF
    if (clienteFilters.uf.length > 0) {
      filtered = filtered.filter((c) =>
        clienteFilters.uf.includes(c.uf || "")
      );
    }
    return filtered;
  }, [clientes, statusFilter, searchQuery, selectedTagIds, clientesComTags, clienteFilters]);

  const filteredConcorrentes = useMemo(() => {
    if (!concorrentes) return [];
    let filtered = filterByStatus(concorrentes);
    
    // Busca multi-campo
    if (searchQuery && searchFields.length > 0) {
      filtered = filtered.filter((c) => matchesSearch(c, "concorrente"));
    }
    // Filtrar por tags
    if (selectedTagIds.length > 0) {
      const idsComTags = new Set(concorrentesComTags);
      filtered = filtered.filter((c) => idsComTags.has(c.id));
    }
    // Filtrar por porte
    if (concorrenteFilters.porte.length > 0) {
      filtered = filtered.filter((c) =>
        concorrenteFilters.porte.includes(c.porte || "")
      );
    }
    return filtered;
  }, [concorrentes, statusFilter, searchQuery, selectedTagIds, concorrentesComTags, concorrenteFilters]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    let filtered = filterByStatus(leads);
    
    // Busca multi-campo
    if (searchQuery && searchFields.length > 0) {
      filtered = filtered.filter((l) => matchesSearch(l, "lead"));
    }
    // Filtrar por tags
    if (selectedTagIds.length > 0) {
      const idsComTags = new Set(leadsComTags);
      filtered = filtered.filter((l) => idsComTags.has(l.id));
    }
    // Filtrar por tipo
    if (leadFilters.tipo.length > 0) {
      filtered = filtered.filter((l) =>
        leadFilters.tipo.includes(l.tipo || "")
      );
    }
    // Filtrar por porte
    if (leadFilters.porte.length > 0) {
      filtered = filtered.filter((l) =>
        leadFilters.porte.includes(l.porte || "")
      );
    }
    return filtered;
  }, [leads, statusFilter, searchQuery, selectedTagIds, leadsComTags, leadFilters]);

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
        setSelectedItems(new Set(filteredClientes.map((c: any) => c.id)));
      }
    } else if (currentPage === "concorrentes") {
      if (selectedItems.size === filteredConcorrentes.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredConcorrentes.map((c: any) => c.id)));
      }
    } else if (currentPage === "leads") {
      if (selectedItems.size === filteredLeads.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredLeads.map((l: any) => l.id)));
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
  const prepareExportData = (): ExportData | null => {
    let data: any[] = [];
    let headers: string[] = [];
    let totalData = 0;
    let entityType = "";
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

    if (currentPage === "mercados") {
      data = filteredMercados;
      totalData = mercados?.length || 0;
      entityType = "mercados";
      headers = ["ID", "Nome", "Segmentação", "Categoria", "Tamanho", "Crescimento", "Status"];
    } else if (currentPage === "clientes") {
      data = filteredClientes;
      totalData = clientes?.length || 0;
      entityType = "clientes";
      headers = ["ID", "Empresa", "CNPJ", "Produto", "Segmentação", "Cidade", "UF", "Status"];
    } else if (currentPage === "concorrentes") {
      data = filteredConcorrentes;
      totalData = concorrentes?.length || 0;
      entityType = "concorrentes";
      headers = ["ID", "Nome", "CNPJ", "Produto", "Porte", "Score", "Status"];
    } else if (currentPage === "leads") {
      data = filteredLeads;
      totalData = leads?.length || 0;
      entityType = "leads";
      headers = ["ID", "Nome", "CNPJ", "Tipo", "Porte", "Região", "Status"];
    } else {
      toast.error("Selecione uma página com dados para exportar");
      return null;
    }

    if (data.length === 0) {
      toast.error("Nenhum dado para exportar. Ajuste os filtros.");
      return null;
    }

    const filename = `${entityType}_${timestamp}`;

    // Preparar linhas
    const rows = data.map((item): (string | number)[] => {
        if (currentPage === "mercados") {
          return [
            item.id,
            `"${item.nome || ""}"`,
            item.segmentacao || "",
            `"${item.categoria || ""}"`,
            item.tamanhoMercado || "",
            item.crescimentoAnual || "",
            item.validationStatus || "pending",
          ];
        } else if (currentPage === "clientes") {
          return [
            item.id,
            `"${item.empresa || ""}"`,
            item.cnpj || "",
            `"${item.produtoPrincipal || ""}"`,
            item.segmentacaoB2bB2c || "",
            item.cidade || "",
            item.uf || "",
            item.validationStatus || "pending",
          ];
        } else if (currentPage === "concorrentes") {
          return [
            item.id,
            `"${item.nome || ""}"`,
            item.cnpj || "",
            `"${item.produto || ""}"`,
            item.porte || "",
            item.qualidadeScore || "",
            item.validationStatus || "pending",
          ];
        } else {
          return [
            item.id,
            `"${item.nome || ""}"`,
            item.cnpj || "",
            item.tipo || "",
            item.porte || "",
            item.regiao || "",
            item.validationStatus || "pending",
          ];
        }
      });

    const hasFiltersActive = searchQuery || selectedTagIds.length > 0 || 
      statusFilter !== "all" || 
      Object.values(mercadoFilters).some(arr => arr.length > 0) ||
      Object.values(clienteFilters).some(arr => arr.length > 0) ||
      Object.values(concorrenteFilters).some(arr => arr.length > 0) ||
      Object.values(leadFilters).some(arr => arr.length > 0);

    return {
      headers,
      rows,
      filename,
      title: `Relatório de ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      metadata: {
        "Data de Geração": new Date().toLocaleString("pt-BR"),
        "Total de Registros": `${data.length} de ${totalData}`,
        "Filtros Aplicados": hasFiltersActive ? "Sim" : "Não",
      },
    };
  };

  const handleExportFiltered = (format: "csv" | "excel" | "pdf") => {
    const exportData = prepareExportData();
    if (!exportData) return;

    try {
      if (format === "csv") {
        exportToCSV(exportData);
      } else if (format === "excel") {
        exportToExcel(exportData);
      } else if (format === "pdf") {
        exportToPDF(exportData);
      }
      toast.success(`Exportado com sucesso em formato ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-border/40">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-base font-bold tracking-tight">INTELIGÊNCIA DE MERCADO</h1>
            <p className="text-xs text-muted-foreground">Análise Estratégica</p>
          </div>
          <ProjectSelector />
          <div className="mt-2">
            <Breadcrumbs
              items={[
                { label: "Início", onClick: () => { setCurrentPage("mercados"); setSelectedMercadoId(null); } },
                ...(currentPage !== "mercados" && selectedMercadoId
                  ? [
                      {
                        label: mercados?.find((m: any) => m.id === selectedMercadoId)?.nome || "Mercado",
                        onClick: () => setCurrentPage("clientes"),
                      },
                    ]
                  : []),
                ...(currentPage !== "mercados" && currentPage !== "clientes"
                  ? [{ label: currentPage === "concorrentes" ? "Concorrentes" : "Leads" }]
                  : currentPage === "clientes"
                  ? [{ label: "Clientes" }]
                  : []),
              ]}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {/* Primeira linha de botões */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard-avancado">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/enrichment-progress">
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Monitorar Enriquecimento
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Filtrados
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportFiltered("csv")}>
                  <FileText className="w-4 h-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportFiltered("excel")}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportFiltered("pdf")}>
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Segunda linha de botões */}
          <div className="flex items-center gap-2">
            <Link href="/enrichment">
              <Button variant="default" size="sm" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Novo Projeto
              </Button>
            </Link>
            <TagManager />
          </div>
        </div>
      </div>

      {/* Barra de Filtros Horizontal */}
      <div className="border-b border-border/40 px-6 py-3 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Busca Global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    addToSearchHistory(searchQuery);
                  }
                }}
                className="pl-10 w-[250px] h-9"
              />
            </div>
            <SearchFieldSelector
              selectedFields={searchFields}
              onFieldsChange={setSearchFields}
            />
          </div>

          {/* Filtro por Tags */}
          <TagFilter
            selectedTags={selectedTagIds}
            onTagsChange={setSelectedTagIds}
          />

          {/* Filtros Avançados */}
          <div className="flex items-center gap-2">
              {/* Filtros de Mercados */}
              {currentPage === "mercados" && (
                <>
                  <MultiSelectFilter
                    title="Segmentação"
                    icon={<Briefcase className="w-3 h-3" />}
                    options={[
                      { value: "B2B", label: "B2B" },
                      { value: "B2C", label: "B2C" },
                      { value: "Ambos", label: "Ambos" },
                    ]}
                    selectedValues={mercadoFilters.segmentacao}
                    onValuesChange={(values) =>
                      setMercadoFilters({ ...mercadoFilters, segmentacao: values })
                    }
                  />
                </>
              )}

              {/* Filtros de Clientes */}
              {currentPage === "clientes" && (
                <>
                  <MultiSelectFilter
                    title="Segmentação"
                    icon={<Briefcase className="w-3 h-3" />}
                    options={[
                      { value: "B2B", label: "B2B" },
                      { value: "B2C", label: "B2C" },
                      { value: "Ambos", label: "Ambos" },
                    ]}
                    selectedValues={clienteFilters.segmentacao}
                    onValuesChange={(values) =>
                      setClienteFilters({ ...clienteFilters, segmentacao: values })
                    }
                  />
                  <MultiSelectFilter
                    title="Estado (UF)"
                    icon={<MapPin className="w-3 h-3" />}
                    options={[
                      { value: "SP", label: "São Paulo" },
                      { value: "RJ", label: "Rio de Janeiro" },
                      { value: "MG", label: "Minas Gerais" },
                      { value: "RS", label: "Rio Grande do Sul" },
                      { value: "PR", label: "Paraná" },
                      { value: "SC", label: "Santa Catarina" },
                      { value: "BA", label: "Bahia" },
                      { value: "PE", label: "Pernambuco" },
                      { value: "CE", label: "Ceará" },
                      { value: "GO", label: "Goiás" },
                    ]}
                    selectedValues={clienteFilters.uf}
                    onValuesChange={(values) =>
                      setClienteFilters({ ...clienteFilters, uf: values })
                    }
                  />
                </>
              )}

              {/* Filtros de Concorrentes */}
              {currentPage === "concorrentes" && (
                <>
                  <MultiSelectFilter
                    title="Porte"
                    icon={<Package className="w-3 h-3" />}
                    options={[
                      { value: "Pequeno", label: "Pequeno" },
                      { value: "Médio", label: "Médio" },
                      { value: "Grande", label: "Grande" },
                    ]}
                    selectedValues={concorrenteFilters.porte}
                    onValuesChange={(values) =>
                      setConcorrenteFilters({ ...concorrenteFilters, porte: values })
                    }
                  />
                </>
              )}

              {/* Filtros de Leads */}
              {currentPage === "leads" && (
                <>
                  <MultiSelectFilter
                    title="Tipo"
                    icon={<Target className="w-3 h-3" />}
                    options={[
                      { value: "Cliente Potencial", label: "Cliente Potencial" },
                      { value: "Parceiro", label: "Parceiro" },
                      { value: "Fornecedor", label: "Fornecedor" },
                    ]}
                    selectedValues={leadFilters.tipo}
                    onValuesChange={(values) =>
                      setLeadFilters({ ...leadFilters, tipo: values })
                    }
                  />
                  <MultiSelectFilter
                    title="Porte"
                    icon={<Package className="w-3 h-3" />}
                    options={[
                      { value: "Pequeno", label: "Pequeno" },
                      { value: "Médio", label: "Médio" },
                      { value: "Grande", label: "Grande" },
                    ]}
                    selectedValues={leadFilters.porte}
                    onValuesChange={(values) =>
                      setLeadFilters({ ...leadFilters, porte: values })
                    }
                  />
                </>
              )}
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Gerenciador de Filtros Salvos */}
            <SavedFiltersManager
              currentFilters={{
                searchQuery,
                searchFields,
                selectedTagIds,
                statusFilter,
                mercadoFilters,
                clienteFilters,
                concorrenteFilters,
                leadFilters,
              }}
              projectId={selectedProjectId || undefined}
              onApplyFilter={(filters) => {
                setSearchQuery(filters.searchQuery || "");
                setSearchFields(filters.searchFields || ["nome", "cnpj", "produto"]);
                setSelectedTagIds(filters.selectedTagIds || []);
                setStatusFilter(filters.statusFilter || "all");
                setMercadoFilters(filters.mercadoFilters || { segmentacao: [], categoria: [] });
                setClienteFilters(filters.clienteFilters || { segmentacao: [], cidade: [], uf: [] });
                setConcorrenteFilters(filters.concorrenteFilters || { porte: [] });
                setLeadFilters(filters.leadFilters || { tipo: [], porte: [] });
              }}
            />
            
            {/* Botão Limpar Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSearchFields(["nome", "cnpj", "produto"]);
                setSelectedTagIds([]);
                setStatusFilter("all");
                setMercadoFilters({ segmentacao: [], categoria: [] });
                setClienteFilters({ segmentacao: [], cidade: [], uf: [] });
                setConcorrenteFilters({ porte: [] });
                setLeadFilters({ tipo: [], porte: [] });
                toast.success("Todos os filtros foram limpos");
              }}
            >
              <FilterX className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pendentes
            </Button>
            <Button
              variant={statusFilter === "rich" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rich")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Validados
            </Button>
            <Button
              variant={statusFilter === "discarded" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("discarded")}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Descartados
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[280px] border-r border-border/40 p-6 flex flex-col gap-6">
          {/* Estatísticas */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Estatísticas</h3>
            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mercados</p>
                    <p className="text-base font-bold">{totalMercados}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                    <p className="text-base font-bold">{totalClientes}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Concorrentes</p>
                    <p className="text-base font-bold">{totalConcorrentes}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="text-base font-bold">{totalLeads}</p>
                  </div>
                </div>
              </div>
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
                <div className="flex items-center gap-4">
                  {/* Botão de alternância Lista/Kanban (apenas para Leads) */}
                  {currentPage === "leads" && (
                    <div className="flex items-center gap-1 border rounded-md">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 px-3"
                      >
                        <LayoutList className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className="h-8 px-3"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Checkbox de seleção (apenas no modo lista) */}
                  {viewMode === "list" && (
                    <>
                      <Checkbox
                        checked={
                          (currentPage === "clientes" && selectedItems.size === filteredClientes.length) ||
                          (currentPage === "concorrentes" && selectedItems.size === filteredConcorrentes.length) ||
                          (currentPage === "leads" && selectedItems.size === filteredLeads.length)
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">Selecionar todos ({selectedItems.size})</span>
                    </>
                  )}
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
                    <AnimatePresence mode="wait">
                      {/* Lista de Mercados */}
                      {currentPage === "mercados" && (
                        <motion.div
                          key="mercados"
                          variants={pageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={pageTransition}
                        >
                        {isLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <SkeletonMercado key={i} />
                            ))}
                          </div>
                        ) : (
                          <motion.div 
                            className="space-y-2"
                            variants={listVariants}
                            initial="hidden"
                            animate="show"
                          >
                            {filteredMercados.map((mercado) => (
                              <motion.div
                                key={`mercado-item-${mercado.id}`}
                                variants={listItemVariants}
                              >
                                <div
                                  className="flex items-center gap-2 p-2 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                                  onClick={() => handleSelectMercado(mercado.id)}
                                >
                                  <Checkbox
                                    checked={selectedMercadosForComparison.includes(mercado.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        if (selectedMercadosForComparison.length < 3) {
                                          setSelectedMercadosForComparison([...selectedMercadosForComparison, mercado.id]);
                                        } else {
                                          toast.error("Máximo de 3 mercados para comparação");
                                        }
                                      } else {
                                        setSelectedMercadosForComparison(selectedMercadosForComparison.filter(id => id !== mercado.id));
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex-1">
                                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {mercado.nome}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">
                                        {mercado.segmentacao}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {mercado.quantidadeClientes} clientes
                                      </span>
                                    </div>
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                      <EntityTagPicker
                                        entityType="mercado"
                                        entityId={mercado.id}
                                      />
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                        </motion.div>
                      )}

                      {/* Lista de Clientes */}
                      {currentPage === "clientes" && (
                        <motion.div
                          key="clientes"
                          variants={pageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={pageTransition}
                        >
                      <div className="space-y-2">
                        {filteredClientes.map((cliente: any) => (
                          <div
                            key={cliente.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
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
                                {cliente.cnpj && !isValidCNPJFormat(cliente.cnpj) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>CNPJ inválido</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                                  {cliente.empresa}
                                </h3>
                                <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                                  {cliente.segmentacaoB2bB2c}
                                </Badge>
                                {(() => {
                                  const score = calculateQualityScore(cliente);
                                  const quality = classifyQuality(score);
                                  return (
                                    <Badge variant={quality.variant} className={`text-xs ${quality.color}`}>
                                      {score}%
                                    </Badge>
                                  );
                                })()}
                                <span className="text-sm text-muted-foreground ml-auto">
                                  {cliente.cidade}, {cliente.uf}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {cliente.produtoPrincipal}
                              </p>
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <EntityTagPicker
                                  entityType="cliente"
                                  entityId={cliente.id}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                        </motion.div>
                      )}

                      {/* Lista de Concorrentes */}
                      {currentPage === "concorrentes" && (
                        <motion.div
                          key="concorrentes"
                          variants={pageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={pageTransition}
                        >
                      <div className="space-y-2">
                        {filteredConcorrentes.map((concorrente: any) => (
                          <div
                            key={concorrente.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
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
                                <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                                  {concorrente.nome}
                                </h3>
                                <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                                  {concorrente.porte}
                                </Badge>
                                {(() => {
                                  const score = calculateQualityScore(concorrente);
                                  const quality = classifyQuality(score);
                                  return (
                                    <Badge variant={quality.variant} className={`text-xs ${quality.color}`}>
                                      {score}%
                                    </Badge>
                                  );
                                })()}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 truncate">{concorrente.produto}</p>
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <EntityTagPicker
                                  entityType="concorrente"
                                  entityId={concorrente.id}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                        </motion.div>
                      )}

                      {/* Lista/Kanban de Leads */}
                      {currentPage === "leads" && (
                        <motion.div
                          key="leads"
                          variants={pageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={pageTransition}
                        >
                          {viewMode === "list" ? (
                            <div className="space-y-2">
                              {filteredLeads.map((lead: any) => (
                                <div
                                  key={lead.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
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
                                      <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                                        {lead.nome}
                                      </h3>
                                      <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                                        {lead.tipo}
                                      </Badge>
                                      {(() => {
                                        const score = calculateQualityScore(lead);
                                        const quality = classifyQuality(score);
                                        return (
                                          <Badge variant={quality.variant} className={`text-xs ${quality.color}`}>
                                            {score}%
                                          </Badge>
                                        );
                                      })()}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 truncate">{lead.regiao}</p>
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                      <EntityTagPicker
                                        entityType="lead"
                                        entityId={lead.id}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <KanbanBoard
                              mercadoId={selectedMercadoId!}
                              leads={filteredLeads}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              <>
                {selectedMercadosForComparison.length >= 2 ? (
                  <Button
                    variant="default"
                    onClick={() => setCompareModalOpen(true)}
                  >
                    Comparar Selecionados ({selectedMercadosForComparison.length})
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Selecione 2-3 mercados para comparar
                  </span>
                )}
              </>
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

      {/* Dialog para Salvar Filtros */}
      <SaveFilterDialog
        open={saveFilterDialogOpen}
        onOpenChange={setSaveFilterDialogOpen}
        onSave={(name) => {
          const filtersJson = JSON.stringify({
            searchQuery,
            searchFields,
            selectedTagIds,
            statusFilter,
            mercadoFilters,
            clienteFilters,
            concorrenteFilters,
            leadFilters,
          });
          saveFilterMutation.mutate({ name, filtersJson });
        }}
      />

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

      {/* Modal de Comparação de Mercados */}
      <CompararMercadosModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        mercadoIds={selectedMercadosForComparison}
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

