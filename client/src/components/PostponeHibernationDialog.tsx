import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostponeHibernationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: (days: number) => void;
  isLoading?: boolean;
}

export function PostponeHibernationDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
  isLoading = false,
}: PostponeHibernationDialogProps) {
  const [selectedDays, setSelectedDays] = useState<number>(30);

  const handleConfirm = () => {
    onConfirm(selectedDays);
  };

  const getNewHibernationDate = () => {
    return format(addDays(new Date(), selectedDays), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const options = [
    { days: 7, label: "7 dias", description: "Adiar por uma semana" },
    { days: 15, label: "15 dias", description: "Adiar por duas semanas" },
    { days: 30, label: "30 dias", description: "Adiar por um mês" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Adiar Hibernação
          </DialogTitle>
          <DialogDescription>
            Escolha por quanto tempo deseja adiar a hibernação do projeto <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opções de Prazo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Adiar por:</Label>
            <RadioGroup
              value={selectedDays.toString()}
              onValueChange={(value) => setSelectedDays(Number(value))}
            >
              {options.map((option) => (
                <div
                  key={option.days}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDays(option.days)}
                >
                  <RadioGroupItem value={option.days.toString()} id={`option-${option.days}`} />
                  <div className="flex-1">
                    <Label
                      htmlFor={`option-${option.days}`}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Preview da Nova Data */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Nova data prevista de hibernação:</p>
                <p className="text-lg font-bold text-blue-700 mt-1">{getNewHibernationDate()}</p>
                <p className="text-xs text-blue-600 mt-1">
                  O projeto será marcado como ativo novamente e o aviso será removido
                </p>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <p className="text-xs text-orange-700">
                Após o adiamento, o projeto voltará a ser monitorado. Se não houver atividade, 
                um novo aviso será enviado 7 dias antes da nova data de hibernação.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Adiando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Adiamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
