import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";

export type SearchField = 
  | "nome"
  | "cnpj"
  | "produto"
  | "cidade"
  | "uf"
  | "email"
  | "telefone"
  | "observacoes";

interface SearchFieldOption {
  value: SearchField;
  label: string;
  description: string;
}

const FIELD_OPTIONS: SearchFieldOption[] = [
  { value: "nome", label: "Nome/Empresa", description: "Buscar em nome de mercados, clientes, concorrentes e leads" },
  { value: "cnpj", label: "CNPJ", description: "Buscar em CNPJ de todas as entidades" },
  { value: "produto", label: "Produto/Categoria", description: "Buscar em produtos e categorias" },
  { value: "cidade", label: "Cidade", description: "Buscar em cidade de clientes" },
  { value: "uf", label: "Estado (UF)", description: "Buscar em UF de clientes" },
  { value: "email", label: "Email", description: "Buscar em emails de contato" },
  { value: "telefone", label: "Telefone", description: "Buscar em telefones de contato" },
  { value: "observacoes", label: "Observações", description: "Buscar em observações e notas" },
];

interface SearchFieldSelectorProps {
  selectedFields: SearchField[];
  onFieldsChange: (fields: SearchField[]) => void;
}

export function SearchFieldSelector({
  selectedFields,
  onFieldsChange,
}: SearchFieldSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleField = (field: SearchField) => {
    if (selectedFields.includes(field)) {
      onFieldsChange(selectedFields.filter((f) => f !== field));
    } else {
      onFieldsChange([...selectedFields, field]);
    }
  };

  const selectAll = () => {
    onFieldsChange(FIELD_OPTIONS.map((opt) => opt.value));
  };

  const clearAll = () => {
    onFieldsChange([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Configurar campos de busca"
        >
          <Settings className="w-4 h-4" />
          {selectedFields.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
            >
              {selectedFields.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">Buscar em campos</h4>
              <p className="text-xs text-muted-foreground">
                Selecione onde procurar a expressão
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-7 px-2 text-xs"
              >
                Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 px-2 text-xs"
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {FIELD_OPTIONS.map((option) => {
              const isSelected = selectedFields.includes(option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-start gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
                  onClick={() => toggleField(option.value)}
                >
                  <Checkbox checked={isSelected} className="mt-0.5" />
                  <div className="flex-1">
                    <label className="text-sm font-medium cursor-pointer">
                      {option.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedFields.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded">
              ⚠️ Nenhum campo selecionado. A busca não retornará resultados.
            </div>
          )}

          {selectedFields.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Campos selecionados ({selectedFields.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedFields.map((field) => {
                  const option = FIELD_OPTIONS.find((opt) => opt.value === field);
                  return (
                    <Badge
                      key={field}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5"
                    >
                      {option?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleField(field);
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
