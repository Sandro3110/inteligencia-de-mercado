'use client';

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string, notes: string) => void;
  itemName: string;
  currentStatus?: string;
  currentNotes?: string;
}

export function ValidationModal({
  open,
  onOpenChange,
  onSubmit,
  itemName,
  currentStatus = "pending",
  currentNotes = "",
}: ValidationModalProps) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);

  const handleSubmit = () => {
    onSubmit(status, notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Validar Item</DialogTitle>
          <DialogDescription>
            Valide e adicione observações para: <strong>{itemName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Status de Validação</Label>
            <RadioGroup value={status} onValueChange={setStatus}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="rich" id="rich" />
                <Label
                  htmlFor="rich"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Rico</p>
                    <p className="text-xs text-muted-foreground">
                      Dados completos e validados
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem
                  value="needs_adjustment"
                  id="needs_adjustment"
                />
                <Label
                  htmlFor="needs_adjustment"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="font-medium">Precisa Ajuste</p>
                    <p className="text-xs text-muted-foreground">
                      Requer correções ou complementos
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="discarded" id="discarded" />
                <Label
                  htmlFor="discarded"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Descartado</p>
                    <p className="text-xs text-muted-foreground">
                      Dados incorretos ou irrelevantes
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre este item..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Validação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
