import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilaTrabalho, type SelectedItem } from "@/components/FilaTrabalho";
import { ValidationModal } from "@/components/ValidationModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ListTodo,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "rich" | "discarded";

export default function CascadeView() {
  const [expandedMercadoId, setExpandedMercadoId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [filaOpen, setFilaOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [currentValidationItem, setCurrentValidationItem] = useState<any>(null);

  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({ search: "" });
  const utils = trpc.useUtils();

  const validateClienteMutation = trpc.clientes.updateValidation.useMutation({
    onSuccess: () => {
      utils.clientes.byMercado.invalidate();
      toast.success("Cliente validado com sucesso!");
    },
  });

  const validateConcorrenteMutation = trpc.concorrentes.updateValidation.useMutation({
    onSuccess: () => {
      utils.concorrentes.byMercado.invalidate();
      toast.success("Concorrente validado com sucesso!");
    },
  });

  const validateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      utils.leads.byMercado.invalidate();
      toast.success("Lead validado com sucesso!");
    },
  });

  // Persistir estado no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gestor-pav-selected-items");
    if (saved) {
      try {
        setSelectedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar itens salvos:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gestor-pav-selected-items", JSON.stringify(selectedItems));
  }, [selectedItems]);

  const toggleMercado = (mercadoId: number) => {
    setExpandedMercadoId(expandedMercadoId === mercadoId ? null : mercadoId);
    // Scroll suave para o mercado expandido
    if (expandedMercadoId !== mercadoId) {
      setTimeout(() => {
        const element = document.getElementById(`mercado-${mercadoId}`);
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const toggleItemSelection = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.type === item.type);
      if (exists) {
        return prev.filter((i) => !(i.id === item.id && i.type === item.type));
      } else {
        return [...prev, item];
      }
    });
  };

  const isItemSelected = (id: number, type: string) => {
    return selectedItems.some((i) => i.id === id && i.type === type);
  };

  const removeFromFila = (id: number, type: string) => {
    setSelectedItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const clearFila = () => {
    setSelectedItems([]);
    toast.info("Fila limpa");
  };

  const validateAll = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const item of selectedItems) {
        if (item.type === "cliente") {
          await validateClienteMutation.mutateAsync({
            id: item.id,
            status: "rich",
            notes: "Validado em lote",
          });
        } else if (item.type === "concorrente") {
          await validateConcorrenteMutation.mutateAsync({
            id: item.id,
            status: "rich",
            notes: "Validado em lote",
          });
        } else if (item.type === "lead") {
          await validateLeadMutation.mutateAsync({
            id: item.id,
            status: "rich",
            notes: "Validado em lote",
          });
        }
      }
      toast.success(`${selectedItems.length} itens validados com sucesso!`);
      setSelectedItems([]);
      setFilaOpen(false);
    } catch (error) {
      toast.error("Erro ao validar itens em lote");
    }
  };

  const discardAll = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const item of selectedItems) {
        if (item.type === "cliente") {
          await validateClienteMutation.mutateAsync({
            id: item.id,
            status: "discarded",
            notes: "Descartado em lote",
          });
        } else if (item.type === "concorrente") {
          await validateConcorrenteMutation.mutateAsync({
            id: item.id,
            status: "discarded",
            notes: "Descartado em lote",
          });
        } else if (item.type === "lead") {
          await validateLeadMutation.mutateAsync({
            id: item.id,
            status: "discarded",
            notes: "Descartado em lote",
          });
        }
      }
      toast.success(`${selectedItems.length} itens descartados`);
      setSelectedItems([]);
      setFilaOpen(false);
    } catch (error) {
      toast.error("Erro ao descartar itens em lote");
    }
  };

  const openValidationModal = (item: any, type: string) => {
    setCurrentValidationItem({ ...item, type });
    setValidationModalOpen(true);
  };

  const handleValidationSubmit = async (status: string, notes: string) => {
    if (!currentValidationItem) return;

    try {
      if (currentValidationItem.type === "cliente") {
        await validateClienteMutation.mutateAsync({
          id: currentValidationItem.id,
          status,
          notes,
        });
      } else if (currentValidationItem.type === "concorrente") {
        await validateConcorrenteMutation.mutateAsync({
          id: currentValidationItem.id,
          status,
          notes,
        });
      } else if (currentValidationItem.type === "lead") {
        await validateLeadMutation.mutateAsync({
          id: currentValidationItem.id,
          status,
          notes,
        });
      }
      setValidationModalOpen(false);
      setCurrentValidationItem(null);
    } catch (error) {
      toast.error("Erro ao validar item");
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Global */}
      <div className="border-b border-border/50 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo e Título */}
            <div>
              <h1 className="text-2xl font-semibold tracking-ultra-wide uppercase text-foreground">
                Gestor PAV
              </h1>
              <p className="text-sm text-muted-foreground">
                Navegação hierárquica · {mercados?.length || 0} mercados
              </p>
            </div>

            {/* Filtros de Status */}
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
                <Clock className="h-4 w-4 mr-1" />
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "rich" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("rich")}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Validados
              </Button>
              <Button
                variant={statusFilter === "discarded" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("discarded")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Descartados
              </Button>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilaOpen(true)}
                className="relative"
              >
                <ListTodo className="h-4 w-4 mr-2" />
                Fila
                {selectedItems.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {selectedItems.length}
                  </Badge>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Área de Navegação em Cascata */}
      <div className="container py-6">
        <div className="space-y-3">
          {mercados?.map((mercado) => (
            <MercadoCard
              key={mercado.id}
              mercado={mercado}
              isExpanded={expandedMercadoId === mercado.id}
              onToggle={() => toggleMercado(mercado.id)}
              statusFilter={statusFilter}
              getStatusBadge={getStatusBadge}
              selectedItems={selectedItems}
              toggleItemSelection={toggleItemSelection}
              isItemSelected={isItemSelected}
              openValidationModal={openValidationModal}
            />
          ))}
        </div>

        {mercados?.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum mercado encontrado
            </p>
          </div>
        )}
      </div>

      {/* Fila de Trabalho */}
      <FilaTrabalho
        isOpen={filaOpen}
        onClose={() => setFilaOpen(false)}
        items={selectedItems}
        onRemoveItem={removeFromFila}
        onClearAll={clearFila}
        onValidateAll={validateAll}
        onDiscardAll={discardAll}
      />

      {/* Modal de Validação */}
      {currentValidationItem && (
        <ValidationModal
          open={validationModalOpen}
          onOpenChange={(open) => {
            setValidationModalOpen(open);
            if (!open) setCurrentValidationItem(null);
          }}
          itemName={currentValidationItem.nome}
          currentStatus={currentValidationItem.validationStatus || "pending"}
          currentNotes={currentValidationItem.validationNotes || ""}
          onSubmit={handleValidationSubmit}
        />
      )}
    </div>
  );
}

// Componente MercadoCard
interface MercadoCardProps {
  mercado: any;
  isExpanded: boolean;
  onToggle: () => void;
  statusFilter: StatusFilter;
  getStatusBadge: (status: string) => ReactElement;
  selectedItems: SelectedItem[];
  toggleItemSelection: (item: SelectedItem) => void;
  isItemSelected: (id: number, type: string) => boolean;
  openValidationModal: (item: any, type: string) => void;
}

function MercadoCard({
  mercado,
  isExpanded,
  onToggle,
  statusFilter,
  getStatusBadge,
  selectedItems,
  toggleItemSelection,
  isItemSelected,
  openValidationModal,
}: MercadoCardProps) {
  const { data: clientes } = trpc.clientes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: isExpanded }
  );
  const { data: concorrentes } = trpc.concorrentes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: isExpanded }
  );
  const { data: leads } = trpc.leads.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: isExpanded }
  );

  // Filtrar por status
  const filteredClientes = clientes?.filter(
    (c) => statusFilter === "all" || c.validationStatus === statusFilter
  );
  const filteredConcorrentes = concorrentes?.filter(
    (c) => statusFilter === "all" || c.validationStatus === statusFilter
  );
  const filteredLeads = leads?.filter(
    (l) => statusFilter === "all" || l.validationStatus === statusFilter
  );

  return (
    <div id={`mercado-${mercado.id}`}>
      {/* Card do Mercado */}
      <Card
        className={`glass-card cursor-pointer transition-all duration-300 ${
          isExpanded ? "border-primary border-2" : ""
        }`}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {mercado.nome}
                </h3>
                <div className="flex items-center gap-2">
                  {mercado.segmentacao && (
                    <span className="pill-badge">
                      <span className="status-dot info"></span>
                      {mercado.segmentacao}
                    </span>
                  )}
                  {mercado.categoria && (
                    <span className="text-sm text-muted-foreground">
                      {mercado.categoria}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contadores */}
            <div className="flex items-center gap-6 mr-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{mercado.quantidadeClientes || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-600">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">~8</span>
                </div>
                <p className="text-xs text-muted-foreground">Concorrentes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">~10</span>
                </div>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
            </div>

            {/* Ícone de Expansão */}
            <div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="mt-3 ml-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
          {/* Coluna 1: Clientes */}
          <Card className="glass-card-subtle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="section-title text-sm">Clientes</h4>
                <Badge variant="outline" className="text-xs">
                  {filteredClientes?.length || 0}
                </Badge>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClientes?.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={isItemSelected(cliente.id, "cliente")}
                        onCheckedChange={() =>
                          toggleItemSelection({
                            id: cliente.id,
                            type: "cliente",
                            mercadoId: mercado.id,
                            mercadoNome: mercado.nome,
                            nome: cliente.nome,
                            status: cliente.validationStatus || "pending",
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {cliente.nome}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(cliente.validationStatus || "pending")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openValidationModal(cliente, "cliente");
                        }}
                      >
                        Validar
                      </Button>
                    </div>
                  </div>
                ))}
                {(!filteredClientes || filteredClientes.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum cliente encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Concorrentes */}
          <Card className="glass-card-subtle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="section-title text-sm">Concorrentes</h4>
                <Badge variant="outline" className="text-xs">
                  {filteredConcorrentes?.length || 0}
                </Badge>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConcorrentes?.map((concorrente) => (
                  <div
                    key={concorrente.id}
                    className="p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={isItemSelected(concorrente.id, "concorrente")}
                        onCheckedChange={() =>
                          toggleItemSelection({
                            id: concorrente.id,
                            type: "concorrente",
                            mercadoId: mercado.id,
                            mercadoNome: mercado.nome,
                            nome: concorrente.nome,
                            status: concorrente.validationStatus || "pending",
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {concorrente.nome}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(concorrente.validationStatus || "pending")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openValidationModal(concorrente, "concorrente");
                        }}
                      >
                        Validar
                      </Button>
                    </div>
                  </div>
                ))}
                {(!filteredConcorrentes || filteredConcorrentes.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum concorrente encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coluna 3: Leads */}
          <Card className="glass-card-subtle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="section-title text-sm">Leads</h4>
                <Badge variant="outline" className="text-xs">
                  {filteredLeads?.length || 0}
                </Badge>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLeads?.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={isItemSelected(lead.id, "lead")}
                        onCheckedChange={() =>
                          toggleItemSelection({
                            id: lead.id,
                            type: "lead",
                            mercadoId: mercado.id,
                            mercadoNome: mercado.nome,
                            nome: lead.nome,
                            status: lead.validationStatus || "pending",
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lead.nome}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(lead.validationStatus || "pending")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openValidationModal(lead, "lead");
                        }}
                      >
                        Validar
                      </Button>
                    </div>
                  </div>
                ))}
                {(!filteredLeads || filteredLeads.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lead encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

