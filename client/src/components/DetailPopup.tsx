import { X, Building2, Mail, Phone, Globe, MapPin, Hash, FileText, Linkedin, Instagram, TrendingUp, Users, Package, Briefcase, Calendar, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: "cliente" | "concorrente" | "lead";
}

export function DetailPopup({ isOpen, onClose, item, type }: DetailPopupProps) {
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
      novo: { label: "Novo", color: "bg-blue-100 text-blue-700 border-blue-200" },
      em_contato: { label: "Em Contato", color: "bg-purple-100 text-purple-700 border-purple-200" },
      negociacao: { label: "Negociação", color: "bg-orange-100 text-orange-700 border-orange-200" },
      fechado: { label: "Fechado", color: "bg-green-100 text-green-700 border-green-200" },
      perdido: { label: "Perdido", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const stageInfo = stages[stage] || { label: stage, color: "bg-slate-100 text-slate-700 border-slate-200" };
    return <Badge className={stageInfo.color}>{stageInfo.label}</Badge>;
  };

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
          className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
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
                    <p className="text-sm text-slate-600 mt-0.5">{getTypeLabel()}</p>
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
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/50">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo Scrollável */}
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
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
                        <p className="text-sm font-medium text-slate-900 truncate">{item.cnpj}</p>
                      </div>
                    </div>
                  )}
                  {item.cnae && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">CNAE</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{item.cnae}</p>
                      </div>
                    </div>
                  )}
                  {item.porte && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Package className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Porte</p>
                        <p className="text-sm font-medium text-slate-900">{item.porte}</p>
                      </div>
                    </div>
                  )}
                  {item.setor && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Briefcase className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Setor</p>
                        <p className="text-sm font-medium text-slate-900">{item.setor}</p>
                      </div>
                    </div>
                  )}
                  {item.tipo && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Tipo</p>
                        <p className="text-sm font-medium text-slate-900">{item.tipo}</p>
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
                        <p className="text-xs text-slate-500 mb-1">Telefone</p>
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
                        <p className="text-xs text-slate-500 mb-1">LinkedIn</p>
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
                        <p className="text-xs text-slate-500 mb-1">Instagram</p>
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
                        <p className="text-xs text-slate-500 mb-1">Cidade/Estado</p>
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
                        <p className="text-sm font-medium text-slate-900">{item.regiao}</p>
                      </div>
                    </div>
                  )}
                </div>
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
              {(item.faturamentoEstimado || item.faturamentoDeclarado || item.numeroEstabelecimentos) && (
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
                            <p className="text-xs text-slate-500 mb-1">Faturamento Estimado</p>
                            <p className="text-sm font-medium text-slate-900">{item.faturamentoEstimado}</p>
                          </div>
                        </div>
                      )}
                      {item.faturamentoDeclarado && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">Faturamento Declarado</p>
                            <p className="text-sm font-medium text-slate-900">{item.faturamentoDeclarado}</p>
                          </div>
                        </div>
                      )}
                      {item.numeroEstabelecimentos && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Users className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">Número de Estabelecimentos</p>
                            <p className="text-sm font-medium text-slate-900">{item.numeroEstabelecimentos}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Validação */}
              {(item.validationNotes || item.validatedBy || item.validatedAt) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    VALIDAÇÃO
                  </h3>
                  <div className="space-y-3">
                    {item.validationNotes && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 mb-2 font-medium">Notas de Validação</p>
                        <p className="text-sm text-slate-900 leading-relaxed">{item.validationNotes}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.validatedBy && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Users className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">Validado por</p>
                            <p className="text-sm font-medium text-slate-900">{item.validatedBy}</p>
                          </div>
                        </div>
                      )}
                      {item.validatedAt && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 mb-1">Data de Validação</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(item.validatedAt).toLocaleDateString("pt-BR")}
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
                        <span className="text-sm font-medium text-slate-700">Classificação</span>
                        <Badge className="bg-blue-600 text-white">{item.qualidadeClassificacao}</Badge>
                      </div>
                      {item.qualidadeScore !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-600">Score de Qualidade</span>
                            <span className="text-sm font-bold text-blue-600">{item.qualidadeScore}%</span>
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
                    Criado em {new Date(item.createdAt).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(item.createdAt).toLocaleTimeString("pt-BR")}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer com Ações */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {/* Futuramente: botões de Editar, Validar, Descartar */}
          </div>
        </div>
      </div>
    </>
  );
}
