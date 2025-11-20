import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ValidationModal } from "@/components/ValidationModal";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectSelector } from "@/components/ProjectSelector";

export default function MercadoDetalhes() {
  const [, params] = useRoute("/mercado/:id");
  const mercadoId = params?.id ? parseInt(params.id) : 0;
  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    type: 'cliente' | 'concorrente' | 'lead';
    id: number;
    name: string;
    currentStatus?: string;
    currentNotes?: string;
  }>({ open: false, type: 'cliente', id: 0, name: '' });

  const utils = trpc.useUtils();

  const { data: mercado, isLoading: loadingMercado } = trpc.mercados.byId.useQuery(mercadoId);
  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.byMercado.useQuery({ mercadoId });
  const { data: concorrentes, isLoading: loadingConcorrentes } = trpc.concorrentes.byMercado.useQuery({ mercadoId });
  const { data: leads, isLoading: loadingLeads } = trpc.leads.byMercado.useQuery({ mercadoId });

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
            <div className="flex items-center gap-4">
              <Link href="/mercados">
                <Button variant="ghost" size="icon" className="hover-lift">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h2 className="section-title">Detalhes do Mercado</h2>
                <h1 className="text-2xl font-semibold text-foreground">{mercado.nome}</h1>
              </div>
            </div>
            <ProjectSelector />
          </div>
          <Breadcrumbs items={[
            { label: "Mercados", href: "/mercados" },
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
            <Card className="glass-card-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Array.isArray(clientes) ? clientes.length : 0}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Array.isArray(concorrentes) ? concorrentes.length : 0}</p>
                  <p className="text-sm text-muted-foreground">Concorrentes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card-subtle">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Array.isArray(leads) ? leads.length : 0}</p>
                  <p className="text-sm text-muted-foreground">Leads</p>
                </div>
              </CardContent>
            </Card>
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

