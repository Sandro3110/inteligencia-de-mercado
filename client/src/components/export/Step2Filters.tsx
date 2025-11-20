import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportState } from "@/pages/ExportWizard";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Step2FiltersProps {
  state: ExportState;
  setState: React.Dispatch<React.SetStateAction<ExportState>>;
}

export default function Step2Filters({ state, setState }: Step2FiltersProps) {
  const estados = ['SP', 'MG', 'RJ', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF'];
  const portes = ['micro', 'pequena', 'média', 'grande'];
  const statusOptions = ['validado', 'pendente', 'descartado'];

  const addState = (uf: string) => {
    const current = state.filters.geography?.states || [];
    if (!current.includes(uf)) {
      setState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          geography: {
            ...prev.filters.geography,
            states: [...current, uf]
          }
        }
      }));
    }
  };

  const removeState = (uf: string) => {
    const current = state.filters.geography?.states || [];
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        geography: {
          ...prev.filters.geography,
          states: current.filter(s => s !== uf)
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Refine os Filtros
        </h2>
        <p className="text-slate-600">
          Ajuste os critérios extraídos pela IA ou adicione novos filtros manualmente.
        </p>
      </div>

      {/* Geografia */}
      <div className="space-y-3">
        <Label>Geografia</Label>
        
        <div>
          <Label htmlFor="states" className="text-sm text-slate-600">Estados</Label>
          <Select onValueChange={addState}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar estado..." />
            </SelectTrigger>
            <SelectContent>
              {estados.map(uf => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {state.filters.geography?.states?.map(uf => (
              <Badge key={uf} variant="secondary" className="pl-2 pr-1">
                {uf}
                <button
                  onClick={() => removeState(uf)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Qualidade */}
      <div className="space-y-3">
        <Label>Qualidade</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minScore" className="text-sm text-slate-600">Score Mínimo (0-100)</Label>
            <Input
              id="minScore"
              type="number"
              min="0"
              max="100"
              value={state.filters.quality?.minScore || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  quality: {
                    ...prev.filters.quality,
                    minScore: Number(e.target.value)
                  }
                }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="completeness" className="text-sm text-slate-600">Completude Mínima (%)</Label>
            <Input
              id="completeness"
              type="number"
              min="0"
              max="100"
              value={state.filters.quality?.completeness || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  quality: {
                    ...prev.filters.quality,
                    completeness: Number(e.target.value)
                  }
                }
              }))}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-slate-600 mb-2 block">Status</Label>
          <div className="flex gap-4">
            {statusOptions.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  checked={state.filters.quality?.status?.includes(status)}
                  onCheckedChange={(checked) => {
                    const current = state.filters.quality?.status || [];
                    setState(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        quality: {
                          ...prev.filters.quality,
                          status: checked
                            ? [...current, status]
                            : current.filter(s => s !== status)
                        }
                      }
                    }));
                  }}
                />
                <label htmlFor={status} className="text-sm capitalize cursor-pointer">
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Porte */}
      <div className="space-y-3">
        <Label>Porte da Empresa</Label>
        <div className="flex gap-4">
          {portes.map(porte => (
            <div key={porte} className="flex items-center space-x-2">
              <Checkbox
                id={porte}
                checked={state.filters.size?.porte?.includes(porte)}
                onCheckedChange={(checked) => {
                  const current = state.filters.size?.porte || [];
                  setState(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      size: {
                        ...prev.filters.size,
                        porte: checked
                          ? [...current, porte]
                          : current.filter(p => p !== porte)
                      }
                    }
                  }));
                }}
              />
              <label htmlFor={porte} className="text-sm capitalize cursor-pointer">
                {porte}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Faturamento */}
      <div className="space-y-3">
        <Label>Faturamento Estimado (R$)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="revenueMin" className="text-sm text-slate-600">Mínimo</Label>
            <Input
              id="revenueMin"
              type="number"
              placeholder="Ex: 1000000"
              value={state.filters.size?.revenue?.min || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  size: {
                    ...prev.filters.size,
                    revenue: {
                      ...prev.filters.size?.revenue,
                      min: Number(e.target.value)
                    }
                  }
                }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="revenueMax" className="text-sm text-slate-600">Máximo</Label>
            <Input
              id="revenueMax"
              type="number"
              placeholder="Ex: 10000000"
              value={state.filters.size?.revenue?.max || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  size: {
                    ...prev.filters.size,
                    revenue: {
                      ...prev.filters.size?.revenue,
                      max: Number(e.target.value)
                    }
                  }
                }
              }))}
            />
          </div>
        </div>
      </div>

      {/* Temporal */}
      <div className="space-y-3">
        <Label>Período</Label>
        <div>
          <Label htmlFor="updatedWithin" className="text-sm text-slate-600">
            Atualizados nos últimos (dias)
          </Label>
          <Input
            id="updatedWithin"
            type="number"
            placeholder="Ex: 30"
            value={state.filters.temporal?.updatedWithin || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                temporal: {
                  ...prev.filters.temporal,
                  updatedWithin: Number(e.target.value)
                }
              }
            }))}
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 mb-2">Filtros Aplicados</h4>
        <div className="text-sm text-slate-600 space-y-1">
          {state.filters.geography?.states && state.filters.geography.states.length > 0 && (
            <div>• Estados: {state.filters.geography.states.join(', ')}</div>
          )}
          {state.filters.quality?.minScore && (
            <div>• Score mínimo: {state.filters.quality.minScore}</div>
          )}
          {state.filters.size?.porte && state.filters.size.porte.length > 0 && (
            <div>• Porte: {state.filters.size.porte.join(', ')}</div>
          )}
          {state.filters.temporal?.updatedWithin && (
            <div>• Últimos {state.filters.temporal.updatedWithin} dias</div>
          )}
          {Object.keys(state.filters).length === 0 && (
            <div className="text-slate-400">Nenhum filtro aplicado</div>
          )}
        </div>
      </div>
    </div>
  );
}
