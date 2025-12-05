import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Entidade {
  id: number;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  website: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  setor: string | null;
  porte: string | null;
}

interface EditEntidadeDialogProps {
  entidade: Entidade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditEntidadeDialog({ entidade, open, onOpenChange, onSuccess }: EditEntidadeDialogProps) {
  const [formData, setFormData] = useState({
    nome: entidade.nome || '',
    cnpj: entidade.cnpj || '',
    email: entidade.email || '',
    telefone: entidade.telefone || '',
    celular: entidade.celular || '',
    website: entidade.website || '',
    endereco: entidade.endereco || '',
    cidade: entidade.cidade || '',
    estado: entidade.estado || '',
    cep: entidade.cep || '',
    setor: entidade.setor || '',
    porte: entidade.porte || '',
  });

  const utils = trpc.useUtils();
  const atualizarMutation = trpc.entidade.atualizar.useMutation({
    onSuccess: () => {
      toast.success('Entidade atualizada com sucesso!');
      utils.entidade.listar.invalidate();
      utils.entidade.obterPorId.invalidate({ id: entidade.id });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar entidade: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Email inválido');
      return;
    }

    if (formData.cnpj && !formData.cnpj.match(/^\d{14}$/)) {
      toast.error('CNPJ deve conter 14 dígitos');
      return;
    }

    // Enviar dados
    atualizarMutation.mutate({
      id: entidade.id,
      ...formData,
      email: formData.email || null,
      telefone: formData.telefone || null,
      celular: formData.celular || null,
      website: formData.website || null,
      endereco: formData.endereco || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      cep: formData.cep || null,
      setor: formData.setor || null,
      porte: formData.porte || null,
    });
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const portes = ['Micro', 'Pequeno', 'Médio', 'Grande'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entidade</DialogTitle>
          <DialogDescription>
            Atualize os dados cadastrais da entidade. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome da entidade"
              required
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, '') })}
              placeholder="00000000000000"
              maxLength={14}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contato@empresa.com.br"
            />
          </div>

          {/* Telefone e Celular */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 3000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                placeholder="(11) 90000-0000"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.empresa.com.br"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, número, complemento"
            />
          </div>

          {/* Cidade, Estado, CEP */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value.replace(/\D/g, '') })}
                placeholder="00000000"
                maxLength={8}
              />
            </div>
          </div>

          {/* Setor e Porte */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input
                id="setor"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                placeholder="Varejo, Tecnologia, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porte">Porte</Label>
              <Select value={formData.porte} onValueChange={(value) => setFormData({ ...formData, porte: value })}>
                <SelectTrigger id="porte">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {portes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={atualizarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={atualizarMutation.isPending}>
              {atualizarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
