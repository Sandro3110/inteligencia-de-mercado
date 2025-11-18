import { X, Building2, Mail, Phone, Globe, MapPin, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        return <Badge className="badge-rich">Rico</Badge>;
      case "needs_adjustment":
        return <Badge className="badge-needs-adjustment">Precisa Ajuste</Badge>;
      case "discarded":
        return <Badge className="badge-discarded">Descartado</Badge>;
      default:
        return <Badge className="badge-pending">Pendente</Badge>;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Pop-up Central */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-border/50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {item.nome || item.empresa}
                    </h2>
                    <p className="text-sm text-muted-foreground">{getTypeLabel()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {getStatusBadge(item.validationStatus || "pending")}
                  {item.segmentacao && (
                    <span className="pill-badge">
                      <span className="status-dot info"></span>
                      {item.segmentacao}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo Scrollável */}
          <ScrollArea className="h-[calc(85vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="section-title mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.cnpj && (
                    <div className="flex items-start gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">CNPJ</p>
                        <p className="text-sm font-medium text-foreground">{item.cnpj}</p>
                      </div>
                    </div>
                  )}
                  {item.site && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Website</p>
                        <a
                          href={item.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {item.site}
                        </a>
                      </div>
                    </div>
                  )}
                  {item.siteOficial && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Website</p>
                        <a
                          href={item.siteOficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {item.siteOficial}
                        </a>
                      </div>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {item.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {item.telefone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <a
                          href={`tel:${item.telefone}`}
                          className="text-sm font-medium text-foreground"
                        >
                          {item.telefone}
                        </a>
                      </div>
                    </div>
                  )}
                  {(item.cidade || item.uf) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Localização</p>
                        <p className="text-sm font-medium text-foreground">
                          {[item.cidade, item.uf].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {item.regiao && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Região</p>
                        <p className="text-sm font-medium text-foreground">{item.regiao}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Negócio */}
              {(item.produto || item.produtoPrincipal || item.porte || item.setor || item.cnae) && (
                <div>
                  <h3 className="section-title mb-3">Informações de Negócio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(item.produto || item.produtoPrincipal) && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Produto/Serviço</p>
                          <p className="text-sm font-medium text-foreground">
                            {item.produto || item.produtoPrincipal}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.porte && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Porte</p>
                          <p className="text-sm font-medium text-foreground">{item.porte}</p>
                        </div>
                      </div>
                    )}
                    {item.setor && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Setor</p>
                          <p className="text-sm font-medium text-foreground">{item.setor}</p>
                        </div>
                      </div>
                    )}
                    {item.cnae && (
                      <div className="flex items-start gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">CNAE</p>
                          <p className="text-sm font-medium text-foreground">{item.cnae}</p>
                        </div>
                      </div>
                    )}
                    {item.faturamentoEstimado && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Faturamento Estimado</p>
                          <p className="text-sm font-medium text-foreground">
                            {item.faturamentoEstimado}
                          </p>
                        </div>
                      </div>
                    )}
                    {item.tipo && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="text-sm font-medium text-foreground">{item.tipo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Qualidade */}
              {(item.qualidadeScore || item.qualidadeClassificacao) && (
                <div>
                  <h3 className="section-title mb-3">Qualidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.qualidadeScore && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${item.qualidadeScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {item.qualidadeScore}%
                          </span>
                        </div>
                      </div>
                    )}
                    {item.qualidadeClassificacao && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Classificação</p>
                        <Badge variant="outline">{item.qualidadeClassificacao}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observações de Validação */}
              {item.validationNotes && (
                <div>
                  <h3 className="section-title mb-3">Observações de Validação</h3>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {item.validationNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Redes Sociais */}
              {(item.linkedin || item.instagram) && (
                <div>
                  <h3 className="section-title mb-3">Redes Sociais</h3>
                  <div className="flex items-center gap-3">
                    {item.linkedin && (
                      <a
                        href={item.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {item.instagram && (
                      <a
                        href={item.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer com Ações */}
          <div className="border-t border-border/50 p-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

