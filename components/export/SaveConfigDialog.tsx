'use client';

/**
 * Dialog para salvar configurações de exportação como template
 * Item 9 do módulo de exportação inteligente
 */

import { useState, useCallback } from 'react';
import { Save, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ExportConfig {
  context?: string;
  filters?: Record<string, unknown>;
  fields?: string[];
  format?: string;
  outputType?: string;
  depth?: string;
  relationshipMode?: string;
}

interface SavedConfig {
  name: string;
  description: string;
  isPublic: boolean;
  config: ExportConfig;
}

interface SaveConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: SavedConfig) => void | Promise<void>;
  currentConfig: ExportConfig;
}

export function SaveConfigDialog({ open, onClose, onSave, currentConfig }: SaveConfigDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        isPublic,
        config: currentConfig,
      });

      // Toast de sucesso
      toast.success('✅ Configuração salva!', {
        description: `Template "${name.trim()}" salvo com sucesso.`,
        duration: 3000,
      });

      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('❌ Erro ao salvar', {
        description: 'Não foi possível salvar a configuração. Tente novamente.',
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  }, [name, description, isPublic, currentConfig, onSave, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvar Configuração de Exportação
          </DialogTitle>
          <DialogDescription>
            Salve esta configuração como template para reutilizar em futuras exportações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome do Template <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Clientes B2B São Paulo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-slate-500">{name.length}/100 caracteres</p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva quando usar este template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-slate-500">{description.length}/500 caracteres</p>
          </div>

          {/* Visibilidade */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              {isPublic ? (
                <Unlock className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-slate-600 mt-0.5" />
              )}
              <div>
                <Label htmlFor="public" className="cursor-pointer">
                  {isPublic ? 'Template Público' : 'Template Privado'}
                </Label>
                <p className="text-xs text-slate-600 mt-1">
                  {isPublic
                    ? 'Outros usuários do projeto poderão usar este template'
                    : 'Apenas você terá acesso a este template'}
                </p>
              </div>
            </div>
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Preview da configuração */}
          <details className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <summary className="text-xs font-semibold text-slate-900 cursor-pointer">
              Preview da Configuração
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              {currentConfig.context && (
                <div>
                  <span className="font-semibold">Contexto:</span>{' '}
                  <span className="text-slate-600">{currentConfig.context}</span>
                </div>
              )}
              {currentConfig.format && (
                <div>
                  <span className="font-semibold">Formato:</span>{' '}
                  <span className="text-slate-600">{currentConfig.format.toUpperCase()}</span>
                </div>
              )}
              {currentConfig.outputType && (
                <div>
                  <span className="font-semibold">Tipo:</span>{' '}
                  <span className="text-slate-600">{currentConfig.outputType}</span>
                </div>
              )}
              {currentConfig.fields && (
                <div>
                  <span className="font-semibold">Campos:</span>{' '}
                  <span className="text-slate-600">{currentConfig.fields.length} selecionados</span>
                </div>
              )}
            </div>
          </details>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
