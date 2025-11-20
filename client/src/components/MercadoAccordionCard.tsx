import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EntityTagPicker } from "@/components/EntityTagPicker";
import { DetailPopup } from "@/components/DetailPopup";
import { calculateQualityScore, classifyQuality } from "@shared/qualityScore";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  Target,
  Building2,
  ChevronDown,
  Search,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel, exportToPDF, ExportData } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MercadoAccordionCardProps {
  mercado: any;
  selectedProjectId: number | null;
  isSelected?: boolean;
  onToggleSelection?: (mercadoId: number) => void;
}

export function MercadoAccordionCard({ 
  mercado, 
  selectedProjectId,
  isSelected = false,
  onToggleSelection 
}: MercadoAccordionCardProps) {
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [currentTab, setCurrentTab] = useState<"clientes" | "concorrentes" | "leads">("clientes");

  // Queries para buscar entidades do mercado
  const { data: clientesData } = trpc.clientes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const { data: concorrentesData } = trpc.concorrentes.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const { data: leadsData } = trpc.leads.byMercado.useQuery(
    { mercadoId: mercado.id },
    { enabled: !!selectedProjectId }
  );

  const clientes = clientesData?.data || [];
  const concorrentes = concorrentesData?.data || [];
  const leads = leadsData?.data || [];

  // Filtrar entidades pela busca
  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;
    const query = searchQuery.toLowerCase();
    return clientes.filter((c: any) => 
      c.empresa?.toLowerCase().includes(query) ||
      c.cnpj?.toLowerCase().includes(query) ||
      c.produtoPrincipal?.toLowerCase().includes(query) ||
      c.cidade?.toLowerCase().includes(query) ||
      c.uf?.toLowerCase().includes(query)
    );
  }, [clientes, searchQuery]);

  const filteredConcorrentes = useMemo(() => {
    if (!searchQuery.trim()) return concorrentes;
    const query = searchQuery.toLowerCase();
    return concorrentes.filter((c: any) => 
      c.nome?.toLowerCase().includes(query) ||
      c.cnpj?.toLowerCase().includes(query) ||
      c.produto?.toLowerCase().includes(query) ||
      c.cidade?.toLowerCase().includes(query)
    );
  }, [concorrentes, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter((l: any) => 
      l.nome?.toLowerCase().includes(query) ||
      l.cnpj?.toLowerCase().includes(query) ||
      l.setor?.toLowerCase().includes(query) ||
      l.tipo?.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  const getStatusIcon = (status: string | null) => {
    if (status === "rich") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "needs_adjustment") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (status === "discarded") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const handleOpenDetail = (item: any, type: "cliente" | "concorrente" | "lead") => {
    setDetailPopupItem(item);
    setDetailPopupType(type);
    setDetailPopupOpen(true);
  };

  const utils = trpc.useUtils();

  const toggleSelectAll = () => {
    let items: any[] = [];
    if (currentTab === "clientes") items = filteredClientes;
    else if (currentTab === "concorrentes") items = filteredConcorrentes;
    else items = filteredLeads;

    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i: any) => i.id)));
    }
  };

  const toggleItemSelection = (id: number) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const handleBatchValidate = async (status: "rich" | "needs_adjustment" | "discarded") => {
    if (selectedItems.size === 0) {
      toast.error("Nenhum item selecionado");
      return;
    }

    // TODO: Implementar validação em lote via tRPC
    toast.info(`Validação em lote será implementada em breve (${selectedItems.size} itens)`);
    setSelectedItems(new Set());
  };

  const handleExportTab = (format: "csv" | "excel" | "pdf") => {
    let data: any[] = [];
    let headers: string[] = [];
    let entityType = "";

    if (currentTab === "clientes") {
      data = filteredClientes;
      entityType = "clientes";
      headers = ["ID", "Empresa", "CNPJ", "Produto", "Segmentação", "Cidade", "UF", "Qualidade (%)", "Status"];
    } else if (currentTab === "concorrentes") {
      data = filteredConcorrentes;
      entityType = "concorrentes";
      headers = ["ID", "Nome", "CNPJ", "Produto", "Porte", "Qualidade (%)", "Status"];
    } else {
      data = filteredLeads;
      entityType = "leads";
      headers = ["ID", "Nome", "CNPJ", "Tipo", "Porte", "Região", "Qualidade (%)", "Status"];
    }

    const rows = data.map((item): (string | number)[] => {
      const qualityScore = calculateQualityScore(item);
      
      if (currentTab === "clientes") {
        return [
          item.id,
          `"${item.empresa || ""}"`,
          item.cnpj || "",
          `"${item.produtoPrincipal || ""}"`,
          item.segmentacaoB2bB2c || "",
          item.cidade || "",
          item.uf || "",
          qualityScore,
          item.validationStatus || "pending",
        ];
      } else if (currentTab === "concorrentes") {
        return [
          item.id,
          `"${item.nome || ""}"`,
          item.cnpj || "",
          `"${item.produto || ""}"`,
          item.porte || "",
          qualityScore,
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
          qualityScore,
          item.validationStatus || "pending",
        ];
      }
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `${mercado.nome}_${entityType}_${timestamp}`;

    const exportData: ExportData = {
      headers,
      rows,
      filename,
      title: `${mercado.nome} - ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      metadata: {
        "Data de Geração": new Date().toLocaleString("pt-BR"),
        "Mercado": mercado.nome,
        "Total de Registros": `${data.length}`,
      },
    };

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
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={`mercado-${mercado.id}`} className="border border-border/40 rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg [&[data-state=open]]:bg-muted/70 transition-colors">
            <div className="flex items-center gap-3 w-full">
              {/* Checkbox para seleção de comparação */}
              {onToggleSelection && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(mercado.id)}
                  />
                </div>
              )}
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold line-clamp-1">
                  {mercado.nome}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                    {mercado.segmentacao}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {clientes.length} clientes • {concorrentes.length} concorrentes • {leads.length} leads
                  </span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <EntityTagPicker entityType="mercado" entityId={mercado.id} />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4 pt-2">
            {/* Campo de Busca Interna */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar neste mercado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            <Tabs defaultValue="clientes" className="w-full" onValueChange={(value) => {
              setCurrentTab(value as "clientes" | "concorrentes" | "leads");
              setSelectedItems(new Set()); // Limpar seleção ao trocar de aba
            }}>
              <div className="flex items-center justify-between mb-2">
                <TabsList className="grid grid-cols-3 flex-1">
                <TabsTrigger value="clientes" className="text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes ({searchQuery ? filteredClientes.length : clientes.length})
                </TabsTrigger>
                <TabsTrigger value="concorrentes" className="text-sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Concorrentes ({searchQuery ? filteredConcorrentes.length : concorrentes.length})
                </TabsTrigger>
                <TabsTrigger value="leads" className="text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Leads ({searchQuery ? filteredLeads.length : leads.length})
                </TabsTrigger>
              </TabsList>

              {/* Ações em Lote */}
              <div className="flex items-center gap-2 ml-4">
                <Checkbox
                  checked={(() => {
                    let items: any[] = [];
                    if (currentTab === "clientes") items = filteredClientes;
                    else if (currentTab === "concorrentes") items = filteredConcorrentes;
                    else items = filteredLeads;
                    return selectedItems.size > 0 && selectedItems.size === items.length;
                  })()}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {selectedItems.size > 0 ? `${selectedItems.size} selecionados` : "Selecionar todos"}
                </span>

                {selectedItems.size > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBatchValidate("rich")}
                      className="h-7 px-2 text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Validar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Exportar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExportTab("csv")}>
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportTab("excel")}>
                          Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportTab("pdf")}>
                          PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

              {/* Aba de Clientes */}
              <TabsContent value="clientes" className="mt-4 space-y-2">
                {searchQuery && filteredClientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum resultado para "{searchQuery}"
                  </p>
                ) : filteredClientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum cliente encontrado
                  </p>
                ) : (
                  filteredClientes.map((cliente: any) => (
                    <div
                      key={cliente.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 group transition-colors"
                    >
                      <Checkbox
                        checked={selectedItems.has(cliente.id)}
                        onCheckedChange={() => toggleItemSelection(cliente.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleOpenDetail(cliente, "cliente")}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cliente.validationStatus)}
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                            {cliente.empresa}
                          </h4>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {cliente.segmentacaoB2bB2c}
                          </Badge>
                          {(() => {
                            const score = calculateQualityScore(cliente);
                            const quality = classifyQuality(score);
                            return (
                              <Badge variant={quality.variant} className={`text-[10px] px-1.5 py-0 ${quality.color}`}>
                                {score}%
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {cliente.produtoPrincipal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cliente.cidade}, {cliente.uf}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <EntityTagPicker entityType="cliente" entityId={cliente.id} />
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Aba de Concorrentes */}
              <TabsContent value="concorrentes" className="mt-4 space-y-2">
                {searchQuery && filteredConcorrentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum resultado para "{searchQuery}"
                  </p>
                ) : filteredConcorrentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum concorrente encontrado
                  </p>
                ) : (
                  filteredConcorrentes.map((concorrente: any) => (
                    <div
                      key={concorrente.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 group transition-colors"
                    >
                      <Checkbox
                        checked={selectedItems.has(concorrente.id)}
                        onCheckedChange={() => toggleItemSelection(concorrente.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleOpenDetail(concorrente, "concorrente")}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(concorrente.validationStatus)}
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                            {concorrente.nome}
                          </h4>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {concorrente.porte}
                          </Badge>
                          {(() => {
                            const score = calculateQualityScore(concorrente);
                            const quality = classifyQuality(score);
                            return (
                              <Badge variant={quality.variant} className={`text-[10px] px-1.5 py-0 ${quality.color}`}>
                                {score}%
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {concorrente.produto}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <EntityTagPicker entityType="concorrente" entityId={concorrente.id} />
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Aba de Leads */}
              <TabsContent value="leads" className="mt-4 space-y-2">
                {searchQuery && filteredLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum resultado para "{searchQuery}"
                  </p>
                ) : filteredLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lead encontrado
                  </p>
                ) : (
                  filteredLeads.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 group transition-colors"
                    >
                      <Checkbox
                        checked={selectedItems.has(lead.id)}
                        onCheckedChange={() => toggleItemSelection(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleOpenDetail(lead, "lead")}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(lead.validationStatus)}
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                            {lead.nome}
                          </h4>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {lead.tipo}
                          </Badge>
                          {(() => {
                            const score = calculateQualityScore(lead);
                            const quality = classifyQuality(score);
                            return (
                              <Badge variant={quality.variant} className={`text-[10px] px-1.5 py-0 ${quality.color}`}>
                                {score}%
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {lead.setor}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <EntityTagPicker entityType="lead" entityId={lead.id} />
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Modal de Detalhes */}
      <DetailPopup
        isOpen={detailPopupOpen}
        onClose={() => setDetailPopupOpen(false)}
        item={detailPopupItem}
        type={detailPopupType}
      />
    </>
  );
}
