'use client';

import { useState } from "react";
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  FileText,
  Linkedin,
  Instagram,
  TrendingUp,
  Users,
  Package,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  History,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import MiniMap from "@/components/MiniMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: "cliente" | "concorrente" | "lead";
}

export function DetailPopup({ isOpen, onClose, item, type }: DetailPopupProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const utils = trpc.useUtils();

  // Queries
  const { data: history = [] } = trpc.clientes.history.useQuery(
    { id: item?.id },
    { enabled: isOpen && type === "cliente" && !!item?.id }
  );

  const { data: concorrenteHistory = [] } = trpc.concorrentes.history.useQuery(
    { id: item?.id },
    { enabled: isOpen && type === "concorrente" && !!item?.id }
  );

  const { data: leadHistory = [] } = trpc.leads.history.useQuery(
    { id: item?.id },
    { enabled: isOpen && type === "lead" && !!item?.id }
  );

  const { data: produtos = [] } = trpc.clientes.produtos.useQuery(
    { id: item?.id },
    { enabled: isOpen && type === "cliente" && !!item?.id }
  );

  // Mutations
  const validateMutation = trpc.clientes.updateValidation.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.clientes.list.invalidate();
      utils.clientes.byMercado.invalidate();
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const validateConcorrenteMutation =
    trpc.concorrentes.updateValidation.useMutation({
      onSuccess: () => {
        toast.success("Status atualizado com sucesso!");
        utils.concorrentes.list.invalidate();
        utils.concorrentes.byMercado.invalidate();
        onClose();
      },
      onError: () => {
        toast.error("Erro ao atualizar status");
      },
    });

  const validateLeadMutation = trpc.leads.updateValidation.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.leads.list.invalidate();
      utils.leads.byMercado.invalidate();
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  if (!isOpen || !item) return null;

  const getTypeLabel = () => {
    switch (type) {
      case "cliente":
        return "Cliente";
      case "concorrente":
        return "Concorrente";
      case "lead":
        return "Lead";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "rich":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Rico
          </Badge>
        );
      case "needs_adjustment":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Precisa Ajuste
          </Badge>
        );
      case "discarded":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Descartado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </Badge>
        );
    }
  };

  const getLeadStageBadge = (stage: string) => {
    const stages: Record<string, { label: string; color: string }> = {
      novo: {
        label: "Novo",
        color: "bg-blue-100 text-blue-700 border-blue-200",
      },
      em_contato: {
        label: "Em Contato",
        color: "bg-purple-100 text-purple-700 border-purple-200",
      },
      negociacao: {
        label: "Negociação",
        color: "bg-orange-100 text-orange-700 border-orange-200",
      },
      fechado: {
        label: "Fechado",
        color: "bg-green-100 text-green-700 border-green-200",
      },
      perdido: {
        label: "Perdido",
        color: "bg-red-100 text-red-700 border-red-200",
      },
    };
    const stageInfo = stages[stage] || {
      label: stage,
      color: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return <Badge className={stageInfo.color}>{stageInfo.label}</Badge>;
  };

  const handleValidate = () => {
    if (type === "cliente") {
      validateMutation.mutate({ id: item.id, status: "rich" });
    } else if (type === "concorrente") {
      validateConcorrenteMutation.mutate({ id: item.id, status: "rich" });
    } else if (type === "lead") {
      validateLeadMutation.mutate({ id: item.id, status: "rich" });
    }
  };

  const handleDiscard = () => {
    if (type === "cliente") {
      validateMutation.mutate({
        id: item.id,
        status: "discarded",
        notes: "Descartado pelo usuário",
      });
    } else if (type === "concorrente") {
      validateConcorrenteMutation.mutate({
        id: item.id,
        status: "discarded",
        notes: "Descartado pelo usuário",
      });
    } else if (type === "lead") {
      validateLeadMutation.mutate({
        id: item.id,
        status: "discarded",
        notes: "Descartado pelo usuário",
      });
    }
    setShowDiscardDialog(false);
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "created":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "updated":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "enriched":
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case "validated":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const currentHistory =
    type === "cliente"
      ? history
      : type === "concorrente"
        ? concorrenteHistory
        : leadHistory;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Pop-up Central */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {item.nome || item.empresa}
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {getTypeLabel()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(item.validationStatus || "pending")}
                  {item.segmentacaoB2bB2c && (
                    <Badge variant="outline" className="bg-white">
                      {item.segmentacaoB2bB2c}
                    </Badge>
                  )}
                  {item.segmentacao && (
                    <Badge variant="outline" className="bg-white">
                      {item.segmentacao}
                    </Badge>
                  )}
                  {item.leadStage && getLeadStageBadge(item.leadStage)}
                  {item.qualidadeScore !== undefined && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Score: {item.qualidadeScore}%
                    </Badge>
                  )}
                  {type === "cliente" && produtos.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {produtos.length} produto{produtos.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-white/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="flex-1">
            <div className="border-b border-slate-200 px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="details" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="w-4 h-4" />
                  Histórico ({currentHistory.length})
                </TabsTrigger>
                {type === "cliente" && (
                  <TabsTrigger value="produtos" className="gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Produtos ({produtos.length})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Conteúdo Scrollável */}
            <ScrollArea className="h-[calc(90vh-280px)]">
              {/* Aba Detalhes */}
              <TabsContent value="details" className="p-6 space-y-6 mt-0">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    INFORMAÇÕES BÁSICAS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.cnpj && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Hash className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">CNPJ</p>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.cnpj}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.cnae && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">CNAE</p>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.cnae}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.porte && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Package className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Porte</p>
                          <p className="text-sm font-medium text-slate-900">
                            {item.porte}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.setor && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Briefcase className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Setor</p>
                          <p className="text-sm font-medium text-slate-900">
                            {item.setor}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.tipo && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Building2 className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Tipo</p>
                          <p className="text-sm font-medium text-slate-900">
                            {item.tipo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contato */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    CONTATO
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(item.site || item.siteOficial) && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Globe className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Website</p>
                          <a
                            href={item.site || item.siteOficial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline truncate block"
                          >
                            {item.site || item.siteOficial}
                          </a>
                        </div>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Mail className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Email</p>
                          <a
                            href={`mailto:${item.email}`}
                            className="text-sm font-medium text-blue-600 hover:underline truncate block"
                          >
                            {item.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {item.telefone && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Phone className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">
                            Telefone
                          </p>
                          <a
                            href={`tel:${item.telefone}`}
                            className="text-sm font-medium text-slate-900"
                          >
                            {item.telefone}
                          </a>
                        </div>
                      </div>
                    )}
                    {item.linkedin && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Linkedin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">
                            LinkedIn
                          </p>
                          <a
                            href={item.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline truncate block"
                          >
                            Ver perfil
                          </a>
                        </div>
                      </div>
                    )}
                    {item.instagram && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Instagram className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">
                            Instagram
                          </p>
                          <a
                            href={item.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline truncate block"
                          >
                            Ver perfil
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Localização */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    LOCALIZAÇÃO
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(item.cidade || item.uf) && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">
                            Cidade/Estado
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {[item.cidade, item.uf].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.regiao && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">Região</p>
                          <p className="text-sm font-medium text-slate-900">
                            {item.regiao}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mini Mapa */}
                  {(item.latitude || item.longitude) && (
                    <div className="mt-4">
                      <MiniMap
                        latitude={item.latitude}
                        longitude={item.longitude}
                        title={item.nome || item.empresa}
                        height={250}
                        linkToFullMap={true}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Produtos e Serviços */}
                {(item.produto || item.produtoPrincipal) && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        PRODUTOS E SERVIÇOS
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-900 leading-relaxed">
                          {item.produto || item.produtoPrincipal}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Informações Financeiras */}
                {(item.faturamentoEstimado ||
                  item.faturamentoDeclarado ||
                  item.numeroEstabelecimentos) && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        INFORMAÇÕES FINANCEIRAS
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.faturamentoEstimado && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Faturamento Estimado
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {item.faturamentoEstimado}
                              </p>
                            </div>
                          </div>
                        )}
                        {item.faturamentoDeclarado && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Faturamento Declarado
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {item.faturamentoDeclarado}
                              </p>
                            </div>
                          </div>
                        )}
                        {item.numeroEstabelecimentos && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Users className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Número de Estabelecimentos
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {item.numeroEstabelecimentos}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Validação */}
                {(item.validationNotes ||
                  item.validatedBy ||
                  item.validatedAt) && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      VALIDAÇÃO
                    </h3>
                    <div className="space-y-3">
                      {item.validationNotes && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700 mb-2 font-medium">
                            Notas de Validação
                          </p>
                          <p className="text-sm text-slate-900 leading-relaxed">
                            {item.validationNotes}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.validatedBy && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Users className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Validado por
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {item.validatedBy}
                              </p>
                            </div>
                          </div>
                        )}
                        {item.validatedAt && (
                          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Data de Validação
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(item.validatedAt).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Qualidade */}
                {item.qualidadeClassificacao && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        QUALIDADE
                      </h3>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Classificação
                          </span>
                          <Badge className="bg-blue-600 text-white">
                            {item.qualidadeClassificacao}
                          </Badge>
                        </div>
                        {item.qualidadeScore !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">
                                Score de Qualidade
                              </span>
                              <span className="text-sm font-bold text-blue-600">
                                {item.qualidadeScore}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${item.qualidadeScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Metadados */}
                {item.createdAt && (
                  <>
                    <Separator />
                    <div className="text-xs text-slate-500 text-center">
                      Criado em{" "}
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(item.createdAt).toLocaleTimeString("pt-BR")}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Aba Histórico */}
              <TabsContent value="history" className="p-6 mt-0">
                {currentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      Nenhum histórico de alterações
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentHistory.map((change: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getChangeIcon(change.changeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {change.field === "_created"
                                  ? "Criação"
                                  : `Campo: ${change.field}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                {change.changedBy} •{" "}
                                {new Date(change.changedAt).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {change.changeType}
                            </Badge>
                          </div>
                          {change.field !== "_created" && (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <div className="p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-xs text-red-700 mb-1">
                                  Anterior
                                </p>
                                <p className="text-sm text-slate-900 truncate">
                                  {change.oldValue || (
                                    <span className="text-slate-400 italic">
                                      vazio
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="p-2 bg-green-50 border border-green-200 rounded">
                                <p className="text-xs text-green-700 mb-1">
                                  Novo
                                </p>
                                <p className="text-sm text-slate-900 truncate">
                                  {change.newValue || (
                                    <span className="text-slate-400 italic">
                                      vazio
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Aba Produtos (apenas para clientes) */}
              {type === "cliente" && (
                <TabsContent value="produtos" className="p-6 mt-0">
                  {produtos.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">
                        Nenhum produto cadastrado
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {produtos.map((produto: any) => (
                        <div
                          key={produto.id}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {produto.nome}
                            </h4>
                            <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          </div>
                          {produto.descricao && (
                            <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                              {produto.descricao}
                            </p>
                          )}
                          {produto.categoria && (
                            <Badge variant="outline" className="text-xs mb-2">
                              {produto.categoria}
                            </Badge>
                          )}
                          {produto.mercadoNome && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                              <Building2 className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-600 truncate">
                                {produto.mercadoNome}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 ml-auto flex-shrink-0" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </ScrollArea>
          </Tabs>

          {/* Footer com Ações */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {item.validationStatus !== "rich" && (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleValidate}
                  disabled={
                    validateMutation.isPending ||
                    validateConcorrenteMutation.isPending ||
                    validateLeadMutation.isPending
                  }
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Validar como Rico
                </Button>
              )}
              {item.validationStatus !== "discarded" && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDiscardDialog(true)}
                  disabled={
                    validateMutation.isPending ||
                    validateConcorrenteMutation.isPending ||
                    validateLeadMutation.isPending
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Descartar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Descarte */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar {getTypeLabel()}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja descartar{" "}
              <strong>{item.nome || item.empresa}</strong>? Esta ação marcará o
              registro como descartado e ele não aparecerá mais nos filtros
              ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
