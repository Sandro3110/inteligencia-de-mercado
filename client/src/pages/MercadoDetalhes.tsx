import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ValidationModal } from "@/components/ValidationModal";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X,
} from "lucide-react";
import { ProjectSelector } from "@/components/ProjectSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MercadoDetalhes() {
  const [, params] = useRoute("/mercado/:id");
  const [, setLocation] = useLocation();
  const mercadoId = params?.id ? parseInt(params.id) : 0;
  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    type: 'cliente' | 'concorrente' | 'lead';
    id: number;
    name: string;
    currentStatus?: string;
    currentNotes?: string;
  }>({ open: false, type: 'cliente', id: 0, name: '' });

  // Estados de paginação
  const [clientesPage, setClientesPage] = useState(1);
  const [concorrentesPage, setConcorrentesPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qualidadeFilter, setQualidadeFilter] = useState("all");
  const [ufFilter, setUfFilter] = useState("all");
  const [porteFilter, setPorteFilter] = useState("all");

  const utils = trpc.useUtils();
  
  // Buscar projeto selecionado do localStorage
  const selectedProjectId = parseInt(localStorage.getItem("selectedProjectId") || "0");

  // Funções de filtragem (definidas antes do uso)
  const filterClientes = (clientes: any[]) => {
    return clientes.filter((cliente) => {
      // Busca global
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          cliente.nome?.toLowerCase().includes(search) ||
          cliente.cnpj?.toLowerCase().includes(search) ||
          cliente.produtoPrincipal?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (statusFilter !== "all") {
        if (cliente.validationStatus !== statusFilter) return false;
      }

      // Filtro de UF
      if (ufFilter !== "all") {
        if (cliente.uf !== ufFilter) return false;
      }

      // Filtro de porte
      if (porteFilter !== "all") {
        if (cliente.porte !== porteFilter) return false;
      }

      return true;
    });
  };

  const filterConcorrentes = (concorrentes: any[]) => {
    return concorrentes.filter((conc) => {
      // Busca global
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          conc.nome?.toLowerCase().includes(search) ||
          conc.cnpj?.toLowerCase().includes(search) ||
          conc.produto?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (statusFilter !== "all") {
        if (conc.validationStatus !== statusFilter) return false;
      }

      // Filtro de qualidade
      if (qualidadeFilter !== "all") {
        if (conc.qualidadeClassificacao !== qualidadeFilter) return false;
      }

      // Filtro de porte
      if (porteFilter !== "all") {
        if (conc.porte !== porteFilter) return false;
      }

      return true;
    });
  };

  const filterLeads = (leads: any[]) => {
    return leads.filter((lead) => {
      // Busca global
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          lead.nome?.toLowerCase().includes(search) ||
          lead.cnpj?.toLowerCase().includes(search) ||
          lead.tipo?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (statusFilter !== "all") {
        if (lead.validationStatus !== statusFilter) return false;
      }

      // Filtro de qualidade
      if (qualidadeFilter !== "all") {
        if (lead.qualidadeClassificacao !== qualidadeFilter) return false;
      }

      // Filtro de porte
      if (porteFilter !== "all") {
        if (lead.porte !== porteFilter) return false;
      }

      return true;
    });
  };
  
  // Buscar todos os mercados do projeto para o seletor
  const { data: mercados } = trpc.mercados.list.useQuery(
    { projectId: selectedProjectId, search: "" },
    { enabled: !!selectedProjectId }
  );

  const { data: mercado, isLoading: loadingMercado } = trpc.mercados.byId.useQuery(mercadoId);
  const { data: clientesResponse, isLoading: loadingClientes } = trpc.clientes.byMercado.useQuery({ mercadoId, page: clientesPage, pageSize });
  const { data: concorrentesResponse, isLoading: loadingConcorrentes } = trpc.concorrentes.byMercado.useQuery({ mercadoId, page: concorrentesPage, pageSize });
  const { data: leadsResponse, isLoading: loadingLeads } = trpc.leads.byMercado.useQuery({ mercadoId, page: leadsPage, pageSize });
  
  // Extrair arrays dos objetos paginados e aplicar filtros
  const clientesRaw = clientesResponse?.data || [];
  const concorrentesRaw = concorrentesResponse?.data || [];
  const leadsRaw = leadsResponse?.data || [];

  const clientes = filterClientes(clientesRaw);
  const concorrentes = filterConcorrentes(concorrentesRaw);
  const leads = filterLeads(leadsRaw);

  const updateClienteMutation = trpc.clientes.updateValidation.useMutation({
    onSuccess: () => {
      utils.clientes.byMercado.invalidate({ mercadoId });
      utils.dashboard.stats.invalidate();
      toast.success('Cliente validado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao validar cliente');
    },
  });

  const updateConcorrenteMutation = trpc.concorrentes.updateValidation.useMutation({
    onSuccess: () => {
      utils.concorrentes.byMercado.invalidate({ mercadoId });
      utils.dashboard.stats.invalidate();
      toast.success('Concorrente validado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao validar concorrente');
    },
  });

  const updateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate({ mercadoId });
      utils.dashboard.stats.invalidate();
      toast.success('Lead validado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao validar lead');
    },
  });

  const handleValidation = (status: string, notes: string) => {
    const { type, id } = validationModal;
    
    if (type === 'cliente') {
      updateClienteMutation.mutate({ id, status, notes });
    } else if (type === 'concorrente') {
      updateConcorrenteMutation.mutate({ id, status, notes });
    } else if (type === 'lead') {
      updateLeadMutation.mutate({ id, status, notes });
    }
  };

  const openValidationModal = (
    type: 'cliente' | 'concorrente' | 'lead',
    id: number,
    name: string,
    currentStatus?: string,
    currentNotes?: string
  ) => {
    setValidationModal({ open: true, type, id, name, currentStatus, currentNotes });
  };

  if (loadingMercado) {
    return (
      <div className="min-h-screen ml-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mercado) {
    return (
      <div className="min-h-screen ml-60 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">Mercado não encontrado</p>
          <Link href="/mercados">
            <Button>Voltar para Mercados</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Função para scroll to top ao mudar de página
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funções de paginação
  const handleClientesPageChange = (newPage: number) => {
    setClientesPage(newPage);
    scrollToTop();
  };

  const handleConcorrentesPageChange = (newPage: number) => {
    setConcorrentesPage(newPage);
    scrollToTop();
  };

  const handleLeadsPageChange = (newPage: number) => {
    setLeadsPage(newPage);
    scrollToTop();
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setClientesPage(1);
    setConcorrentesPage(1);
    setLeadsPage(1);
    scrollToTop();
  };

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setQualidadeFilter("all");
    setUfFilter("all");
    setPorteFilter("all");
    setClientesPage(1);
    setConcorrentesPage(1);
    setLeadsPage(1);
  };

  // Funções de filtragem já definidas acima

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "rich":
        return (
          <Badge className="badge-rich">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Rico
          </Badge>
        );
      case "needs_adjustment":
        return (
          <Badge className="badge-needs-adjustment">
            <AlertCircle className="h-3 w-3 mr-1" />
            Precisa Ajuste
          </Badge>
        );
      case "discarded":
        return (
          <Badge className="badge-discarded">
            <XCircle className="h-3 w-3 mr-1" />
            Descartado
          </Badge>
        );
      default:
        return (
          <Badge className="badge-pending">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              <Link href="/mercados">
                <Button variant="ghost" size="icon" className="hover-lift">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h2 className="section-title mb-2">Detalhes do Mercado</h2>
                {/* Seletor de Mercados */}
                <Select
                  value={mercadoId.toString()}
                  onValueChange={(value) => setLocation(`/mercado/${value}`)}
                >
                  <SelectTrigger className="w-full max-w-2xl">
                    <SelectValue placeholder="Selecione um mercado" />
                  </SelectTrigger>
                  <SelectContent>
                    {mercados?.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.nome}</span>
                          {m.segmentacao && (
                            <Badge variant="outline" className="text-xs">
                              {m.segmentacao}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ProjectSelector />
          </div>
          <Breadcrumbs items={[
            { label: "Mercados" },
            { label: mercado.nome }
          ]} />
          
          {/* Segmentação e Categoria */}
          <div className="flex items-center gap-2 mb-4">
            {mercado.segmentacao && (
              <span className="pill-badge">
                <span className="status-dot info"></span>
                {mercado.segmentacao}
              </span>
            )}
            {mercado.categoria && (
              <span className="text-sm text-muted-foreground">{mercado.categoria}</span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-white border-slate-200 shadow-sm-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clientesResponse?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{concorrentesResponse?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Concorrentes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leadsResponse?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Leads</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="border-b border-border/50 bg-slate-50">
        <div className="container py-4">
          <div className="flex flex-col gap-4">
            {/* Linha 1: Busca e Botão Limpar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, CNPJ ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>

            {/* Linha 2: Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
              </div>

              {/* Filtro de Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="rich">Validados</SelectItem>
                  <SelectItem value="discarded">Descartados</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de Qualidade */}
              <Select value={qualidadeFilter} onValueChange={setQualidadeFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Qualidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Bom">Bom</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Ruim">Ruim</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de UF */}
              <Select value={ufFilter} onValueChange={setUfFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas UFs</SelectItem>
                  <SelectItem value="SP">SP</SelectItem>
                  <SelectItem value="RJ">RJ</SelectItem>
                  <SelectItem value="MG">MG</SelectItem>
                  <SelectItem value="RS">RS</SelectItem>
                  <SelectItem value="PR">PR</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="BA">BA</SelectItem>
                  <SelectItem value="PE">PE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="GO">GO</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de Porte */}
              <Select value={porteFilter} onValueChange={setPorteFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Portes</SelectItem>
                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>

              {/* Contador de Resultados */}
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {clientes.length + concorrentes.length + leads.length} resultados
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container py-8">
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="clientes">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="concorrentes">
              <Target className="h-4 w-4 mr-2" />
              Concorrentes
            </TabsTrigger>
            <TabsTrigger value="leads">
              <TrendingUp className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Clientes Tab */}
          <TabsContent value="clientes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes ({Array.isArray(clientes) ? clientes.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingClientes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Segmentação</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(clientes) && clientes.map((cliente: any) => (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p>{cliente.nome}</p>
                                {cliente.siteOficial && (
                                  <a
                                    href={cliente.siteOficial}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Site
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{cliente.produtoPrincipal || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{cliente.segmentacaoB2bB2c || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              {cliente.cidade && cliente.uf && (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {cliente.cidade}, {cliente.uf}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {cliente.email && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Mail className="h-3 w-3" />
                                    {cliente.email}
                                  </div>
                                )}
                                {cliente.telefone && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Phone className="h-3 w-3" />
                                    {cliente.telefone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(cliente.validationStatus || "pending")}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openValidationModal(
                                  'cliente',
                                  cliente.id,
                                  cliente.nome,
                                  cliente.validationStatus || undefined,
                                  cliente.validationNotes || undefined
                                )}
                              >
                                Validar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Paginação de Clientes */}
                {!loadingClientes && clientesResponse && (
                  <Pagination
                    currentPage={clientesPage}
                    totalPages={Math.ceil((clientesResponse.total || 0) / pageSize)}
                    totalItems={clientesResponse.total || 0}
                    pageSize={pageSize}
                    onPageChange={handleClientesPageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Concorrentes Tab */}
          <TabsContent value="concorrentes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Concorrentes ({Array.isArray(concorrentes) ? concorrentes.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingConcorrentes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Porte</TableHead>
                          <TableHead>Faturamento</TableHead>
                          <TableHead>Qualidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(concorrentes) && concorrentes.map((conc: any) => (
                          <TableRow key={conc.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p>{conc.nome}</p>
                                {conc.site && (
                                  <a
                                    href={conc.site}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Site
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{conc.produto || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{conc.porte || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{conc.faturamentoEstimado || "-"}</span>
                            </TableCell>
                            <TableCell>
                              {conc.qualidadeScore && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{conc.qualidadeScore}/10</span>
                                  <Badge variant="secondary">{conc.qualidadeClassificacao}</Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(conc.validationStatus || "pending")}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openValidationModal(
                                  'concorrente',
                                  conc.id,
                                  conc.nome,
                                  conc.validationStatus || undefined,
                                  conc.validationNotes || undefined
                                )}
                              >
                                Validar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Paginação de Concorrentes */}
                {!loadingConcorrentes && concorrentesResponse && (
                  <Pagination
                    currentPage={concorrentesPage}
                    totalPages={Math.ceil((concorrentesResponse.total || 0) / pageSize)}
                    totalItems={concorrentesResponse.total || 0}
                    pageSize={pageSize}
                    onPageChange={handleConcorrentesPageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Leads ({Array.isArray(leads) ? leads.length : 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Porte</TableHead>
                          <TableHead>Região</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead>Qualidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(leads) && leads.map((lead: any) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p>{lead.nome}</p>
                                {lead.site && (
                                  <a
                                    href={lead.site}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Site
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.tipo || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{lead.porte || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{lead.regiao || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {lead.email && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Mail className="h-3 w-3" />
                                    {lead.email}
                                  </div>
                                )}
                                {lead.telefone && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Phone className="h-3 w-3" />
                                    {lead.telefone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {lead.qualidadeScore && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{lead.qualidadeScore}/10</span>
                                  <Badge variant="secondary">{lead.qualidadeClassificacao}</Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(lead.validationStatus || "pending")}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openValidationModal(
                                  'lead',
                                  lead.id,
                                  lead.nome,
                                  lead.validationStatus || undefined,
                                  lead.validationNotes || undefined
                                )}
                              >
                                Validar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Paginação de Leads */}
                {!loadingLeads && leadsResponse && (
                  <Pagination
                    currentPage={leadsPage}
                    totalPages={Math.ceil((leadsResponse.total || 0) / pageSize)}
                    totalItems={leadsResponse.total || 0}
                    pageSize={pageSize}
                    onPageChange={handleLeadsPageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Validation Modal */}
      <ValidationModal
        open={validationModal.open}
        onOpenChange={(open) => setValidationModal({ ...validationModal, open })}
        onSubmit={handleValidation}
        itemName={validationModal.name}
        currentStatus={validationModal.currentStatus}
        currentNotes={validationModal.currentNotes}
      />
    </div>
  );
}

