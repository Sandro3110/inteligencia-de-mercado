import { X, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SelectedItem {
  id: number;
  type: "cliente" | "concorrente" | "lead";
  mercadoId: number;
  mercadoNome: string;
  nome: string;
  status: string;
}

interface FilaTrabalhoProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectedItem[];
  onRemoveItem: (id: number, type: string) => void;
  onClearAll: () => void;
  onValidateAll: () => void;
  onDiscardAll: () => void;
}

export function FilaTrabalho({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onValidateAll,
  onDiscardAll,
}: FilaTrabalhoProps) {
  if (!isOpen) return null;

  // Agrupar por mercado
  const itemsByMercado = items.reduce((acc, item) => {
    if (!acc[item.mercadoNome]) {
      acc[item.mercadoNome] = [];
    }
    acc[item.mercadoNome].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "cliente":
        return "Cliente";
      case "concorrente":
        return "Concorrente";
      case "lead":
        return "Lead";
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "cliente":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "concorrente":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "lead":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-background border-l border-border z-50 animate-in slide-in-from-right duration-300">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="section-title">Fila de Trabalho</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-140px)]">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum item na fila
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione itens para validar em lote
                  </p>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {Object.entries(itemsByMercado).map(([mercadoNome, mercadoItems]) => (
                      <div key={mercadoNome}>
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          {mercadoNome}
                        </h4>
                        <div className="space-y-2">
                          {mercadoItems.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {item.nome}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs mt-1 ${getTypeBadgeColor(item.type)}`}
                                  >
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 h-8 w-8"
                                  onClick={() => onRemoveItem(item.id, item.type)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Ações em Lote */}
                <div className="border-t border-border p-4 space-y-2">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={onValidateAll}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Validar Todos como Rico
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={onDiscardAll}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Descartar Todos
                  </Button>
                  <Button
                    className="w-full"
                    variant="ghost"
                    onClick={onClearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Fila
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

