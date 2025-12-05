import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Mercado {
  id: number;
  nome: string;
  categoria?: string;
  segmentacao?: string;
  tamanhoMercado?: string;
  crescimentoAnual?: string;
  tendencias?: string;
  principaisPlayers?: string;
  sentimento?: string;
  scoreAtratividade?: number;
  nivelSaturacao?: string;
  oportunidades?: string;
  riscos?: string;
  recomendacaoEstrategica?: string;
}

interface EditMercadoDialogProps {
  mercado: Mercado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMercadoDialog({
  mercado,
  open,
  onOpenChange,
  onSuccess,
}: EditMercadoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    segmentacao: '',
    tamanhoMercado: '',
    crescimentoAnual: '',
    tendencias: '',
    principaisPlayers: '',
    sentimento: '',
    scoreAtratividade: '',
    nivelSaturacao: '',
    oportunidades: '',
    riscos: '',
    recomendacaoEstrategica: '',
  });

  // Preencher formulário quando mercado mudar
  useEffect(() => {
    if (mercado) {
      setFormData({
        nome: mercado.nome || '',
        categoria: mercado.categoria || '',
        segmentacao: mercado.segmentacao || '',
        tamanhoMercado: mercado.tamanhoMercado || '',
        crescimentoAnual: mercado.crescimentoAnual || '',
        tendencias: mercado.tendencias || '',
        principaisPlayers: mercado.principaisPlayers || '',
        sentimento: mercado.sentimento || '',
        scoreAtratividade: mercado.scoreAtratividade?.toString() || '',
        nivelSaturacao: mercado.nivelSaturacao || '',
        oportunidades: mercado.oportunidades || '',
        riscos: mercado.riscos || '',
        recomendacaoEstrategica: mercado.recomendacaoEstrategica || '',
      });
    }
  }, [mercado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mercado) return;
    
    setLoading(true);
    
    try {
      // Preparar dados para envio
      const dados: any = {
        id: mercado.id,
        nome: formData.nome,
        categoria: formData.categoria || undefined,
        segmentacao: formData.segmentacao || undefined,
        tamanhoMercado: formData.tamanhoMercado || undefined,
        crescimentoAnual: formData.crescimentoAnual || undefined,
        tendencias: formData.tendencias || undefined,
        principaisPlayers: formData.principaisPlayers || undefined,
        sentimento: formData.sentimento || undefined,
        scoreAtratividade: formData.scoreAtratividade ? parseInt(formData.scoreAtratividade) : undefined,
        nivelSaturacao: formData.nivelSaturacao || undefined,
        oportunidades: formData.oportunidades || undefined,
        riscos: formData.riscos || undefined,
        recomendacaoEstrategica: formData.recomendacaoEstrategica || undefined,
      };
      
      // TODO: Implementar chamada TRPC mercado.atualizar
      // await trpc.mercados.atualizar.mutate(dados);
      
      toast.success('Mercado atualizado com sucesso!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao atualizar mercado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Mercado</DialogTitle>
          <DialogDescription>
            Atualize as informações do mercado {mercado?.nome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>

          {/* Categoria e Segmentação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                placeholder="Ex: Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmentacao">Segmentação</Label>
              <Input
                id="segmentacao"
                value={formData.segmentacao}
                onChange={(e) => handleChange('segmentacao', e.target.value)}
                placeholder="Ex: B2B"
              />
            </div>
          </div>

          {/* Tamanho do Mercado e Crescimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tamanhoMercado">Tamanho do Mercado</Label>
              <Input
                id="tamanhoMercado"
                value={formData.tamanhoMercado}
                onChange={(e) => handleChange('tamanhoMercado', e.target.value)}
                placeholder="Ex: R$ 10 bilhões"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crescimentoAnual">Crescimento Anual</Label>
              <Input
                id="crescimentoAnual"
                value={formData.crescimentoAnual}
                onChange={(e) => handleChange('crescimentoAnual', e.target.value)}
                placeholder="Ex: 15% a.a."
              />
            </div>
          </div>

          {/* Tendências */}
          <div className="space-y-2">
            <Label htmlFor="tendencias">Tendências</Label>
            <Textarea
              id="tendencias"
              value={formData.tendencias}
              onChange={(e) => handleChange('tendencias', e.target.value)}
              rows={3}
              placeholder="Principais tendências do mercado..."
            />
          </div>

          {/* Principais Players */}
          <div className="space-y-2">
            <Label htmlFor="principaisPlayers">Principais Players</Label>
            <Textarea
              id="principaisPlayers"
              value={formData.principaisPlayers}
              onChange={(e) => handleChange('principaisPlayers', e.target.value)}
              rows={3}
              placeholder="Principais empresas atuantes..."
            />
          </div>

          {/* Análise: Sentimento, Score, Saturação */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sentimento">Sentimento</Label>
              <Select
                value={formData.sentimento}
                onValueChange={(value) => handleChange('sentimento', value)}
              >
                <SelectTrigger id="sentimento">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positivo">Positivo</SelectItem>
                  <SelectItem value="Neutro">Neutro</SelectItem>
                  <SelectItem value="Negativo">Negativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scoreAtratividade">Score Atratividade (0-100)</Label>
              <Input
                id="scoreAtratividade"
                type="number"
                min="0"
                max="100"
                value={formData.scoreAtratividade}
                onChange={(e) => handleChange('scoreAtratividade', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivelSaturacao">Nível Saturação</Label>
              <Select
                value={formData.nivelSaturacao}
                onValueChange={(value) => handleChange('nivelSaturacao', value)}
              >
                <SelectTrigger id="nivelSaturacao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixo">Baixo</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Oportunidades */}
          <div className="space-y-2">
            <Label htmlFor="oportunidades">Oportunidades</Label>
            <Textarea
              id="oportunidades"
              value={formData.oportunidades}
              onChange={(e) => handleChange('oportunidades', e.target.value)}
              rows={3}
              placeholder="Principais oportunidades identificadas..."
            />
          </div>

          {/* Riscos */}
          <div className="space-y-2">
            <Label htmlFor="riscos">Riscos</Label>
            <Textarea
              id="riscos"
              value={formData.riscos}
              onChange={(e) => handleChange('riscos', e.target.value)}
              rows={3}
              placeholder="Principais riscos identificados..."
            />
          </div>

          {/* Recomendação Estratégica */}
          <div className="space-y-2">
            <Label htmlFor="recomendacaoEstrategica">Recomendação Estratégica</Label>
            <Textarea
              id="recomendacaoEstrategica"
              value={formData.recomendacaoEstrategica}
              onChange={(e) => handleChange('recomendacaoEstrategica', e.target.value)}
              rows={3}
              placeholder="Recomendações estratégicas..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
