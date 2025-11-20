import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface MercadoAccordionCardProps {
  mercado: any;
  selectedProjectId: number | null;
}

export function MercadoAccordionCard({ mercado, selectedProjectId }: MercadoAccordionCardProps) {
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [detailPopupItem, setDetailPopupItem] = useState<any>(null);
  const [detailPopupType, setDetailPopupType] = useState<"cliente" | "concorrente" | "lead">("cliente");

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

  return (
    <>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={`mercado-${mercado.id}`} className="border border-border/40 rounded-lg mb-2">
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg [&[data-state=open]]:bg-muted/70 transition-colors">
            <div className="flex items-center gap-3 w-full">
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
            <Tabs defaultValue="clientes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clientes" className="text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes ({clientes.length})
                </TabsTrigger>
                <TabsTrigger value="concorrentes" className="text-sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Concorrentes ({concorrentes.length})
                </TabsTrigger>
                <TabsTrigger value="leads" className="text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Leads ({leads.length})
                </TabsTrigger>
              </TabsList>

              {/* Aba de Clientes */}
              <TabsContent value="clientes" className="mt-4 space-y-2">
                {clientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum cliente encontrado
                  </p>
                ) : (
                  clientes.map((cliente: any) => (
                    <div
                      key={cliente.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                      onClick={() => handleOpenDetail(cliente, "cliente")}
                    >
                      <div className="flex-1">
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
                {concorrentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum concorrente encontrado
                  </p>
                ) : (
                  concorrentes.map((concorrente: any) => (
                    <div
                      key={concorrente.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                      onClick={() => handleOpenDetail(concorrente, "concorrente")}
                    >
                      <div className="flex-1">
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
                {leads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lead encontrado
                  </p>
                ) : (
                  leads.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors"
                      onClick={() => handleOpenDetail(lead, "lead")}
                    >
                      <div className="flex-1">
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
