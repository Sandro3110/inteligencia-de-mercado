import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  User,
  FileText,
  BarChart3,
  Sparkles,
  Package,
  Search,
  Shield,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EditEntidadeDialog } from './EditEntidadeDialog';

interface Entidade {
  id: number;
  tipo: string;
  nome: string;
  nome_fantasia: string | null;
  razao_social?: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  celular?: string | null;
  website?: string | null;
  endereco?: string | null;
  cidade: string | null;
  uf: string | null;
  cep?: string | null;
  pais?: string | null;
  setor: string | null;
  porte: string | null;
  faturamento?: string | null;
  numero_funcionarios?: number | null;
  descricao?: string | null;
  observacoes?: string | null;
  score_qualidade?: number | null;
  score_qualidade_dados: number | null;
  validacao_cnpj: boolean | null;
  validacao_email: boolean | null;
  validacao_telefone: boolean | null;
  enriquecido_em: string | null;
  enriquecido_por: string | null;
  origem_data: string;
  created_at: string;
  updated_at: string;
}

interface EntidadeDetailsSheetProps {
  entidade: Entidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EntidadeDetailsSheet({
  entidade,
  open,
  onOpenChange,
}: EntidadeDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState('cadastrais');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!entidade) return null;

  // Helper para formatar campos vazios
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };

  // Helper para formatar data
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Helper para badge de status
  const getStatusBadge = (tipo: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      cliente: { label: 'Cliente', variant: 'default' },
      lead: { label: 'Lead', variant: 'secondary' },
      concorrente: { label: 'Concorrente', variant: 'destructive' },
    };
    const { label, variant } = config[tipo] || { label: tipo, variant: 'default' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Helper para badge de validação
  const getValidationBadge = (field: string, value: any) => {
    if (!value || value === '') {
      return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Faltando</Badge>;
    }
    return <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>;
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {entidade.nome || 'Sem nome'}
              </SheetTitle>
              <SheetDescription className="mt-2 flex items-center gap-2">
                {getStatusBadge(entidade.tipo)}
                {entidade.cnpj && (
                  <Badge variant="outline" className="font-mono">
                    {entidade.cnpj}
                  </Badge>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cadastrais" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Cadastrais
            </TabsTrigger>
            <TabsTrigger value="qualidade" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Qualidade
            </TabsTrigger>
            <TabsTrigger value="enriquecimento" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Enriquecimento
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid w-full grid-cols-3 mt-2">
            <TabsTrigger value="produtos" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="rastreabilidade" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              Rastreabilidade
            </TabsTrigger>
            <TabsTrigger value="acoes" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Ações
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: DADOS CADASTRAIS */}
          <TabsContent value="cadastrais" className="space-y-4 mt-4">
            {/* Identificação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Nome Fantasia</label>
                  <p className="font-medium">{formatValue(entidade.nome_fantasia)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Razão Social</label>
                  <p className="font-medium">{formatValue(entidade.razao_social)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CNPJ</label>
                  <p className="font-mono font-medium">{formatValue(entidade.cnpj)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <div className="mt-1">{getStatusBadge(entidade.tipo)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="font-medium break-all">{formatValue(entidade.email)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Telefone</label>
                  <p className="font-medium">{formatValue(entidade.telefone)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Celular</label>
                  <p className="font-medium">{formatValue(entidade.celular)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Website</label>
                  <p className="font-medium break-all">{formatValue(entidade.website)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Endereço</label>
                  <p className="font-medium">{formatValue(entidade.endereco)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cidade</label>
                  <p className="font-medium">{formatValue(entidade.cidade)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">UF</label>
                  <p className="font-medium">{formatValue(entidade.uf)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CEP</label>
                  <p className="font-mono font-medium">{formatValue(entidade.cep)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">País</label>
                  <p className="font-medium">{formatValue(entidade.pais)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações Empresariais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Informações Empresariais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Setor</label>
                  <p className="font-medium">{formatValue(entidade.setor)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Porte</label>
                  <p className="font-medium">{formatValue(entidade.porte)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Faturamento</label>
                  <p className="font-medium">{formatValue(entidade.faturamento)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Funcionários</label>
                  <p className="font-medium">{formatValue(entidade.numero_funcionarios)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dados Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dados Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <p className="font-medium text-xs leading-relaxed">
                    {formatValue(entidade.descricao)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Observações</label>
                  <p className="font-medium text-xs leading-relaxed">
                    {formatValue(entidade.observacoes)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: QUALIDADE DE DADOS */}
          <TabsContent value="qualidade" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Score de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">
                    {entidade.score_qualidade || 0}%
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${entidade.score_qualidade || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entidade.score_qualidade != null
                        ? entidade.score_qualidade >= 80
                          ? 'Excelente qualidade'
                          : entidade.score_qualidade >= 60
                          ? 'Boa qualidade'
                          : entidade.score_qualidade >= 40
                          ? 'Qualidade média'
                          : 'Qualidade baixa'
                        : 'Sem avaliação'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Validação de Campos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Nome</span>
                    {getValidationBadge('nome', entidade.nome)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CNPJ</span>
                    {getValidationBadge('cnpj', entidade.cnpj)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    {getValidationBadge('email', entidade.email)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telefone</span>
                    {getValidationBadge('telefone', entidade.telefone)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Endereço</span>
                    {getValidationBadge('endereco', entidade.endereco)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cidade</span>
                    {getValidationBadge('cidade', entidade.cidade)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Setor</span>
                    {getValidationBadge('setor', entidade.setor)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Porte</span>
                    {getValidationBadge('porte', entidade.porte)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Campos Faltantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs">
                  {!entidade.razao_social && <p>• Razão Social</p>}
                  {!entidade.email && <p>• Email</p>}
                  {!entidade.telefone && <p>• Telefone</p>}
                  {!entidade.endereco && <p>• Endereço</p>}
                  {!entidade.setor && <p>• Setor</p>}
                  {!entidade.porte && <p>• Porte</p>}
                  {!entidade.website && <p>• Website</p>}
                  {entidade.razao_social &&
                    entidade.email &&
                    entidade.telefone &&
                    entidade.endereco &&
                    entidade.setor &&
                    entidade.porte &&
                    entidade.website && (
                      <p className="text-green-600 font-medium">
                        ✓ Todos os campos principais preenchidos
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3: ENRIQUECIMENTO IA */}
          <TabsContent value="enriquecimento" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Status de Enriquecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {entidade.enriquecido_em ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Enriquecido com IA</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">Não enriquecido</span>
                    </>
                  )}
                </div>
                {entidade.enriquecido_em && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Última atualização: {formatDate(entidade.enriquecido_em)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações de Enriquecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer com IA
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Dados
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Buscar na Web
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 4: PRODUTOS E MERCADOS */}
          <TabsContent value="produtos" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produtos Relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nenhum produto vinculado a esta entidade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Mercados de Atuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nenhum mercado vinculado a esta entidade.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 5: RASTREABILIDADE */}
          <TabsContent value="rastreabilidade" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Origem dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Fonte</label>
                  <p className="font-medium">{formatValue(entidade.origem_data)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Data de Importação</label>
                  <p className="font-medium">{formatDate(entidade.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Última Atualização</label>
                  <p className="font-medium">{formatDate(entidade.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Criado por</label>
                  <p className="font-medium">{formatValue(entidade.created_by)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Atualizado por</label>
                  <p className="font-medium">{formatValue(entidade.updated_by)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 6: AÇÕES */}
          <TabsContent value="acoes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ações Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Dados
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer com IA
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Website
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Dados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Entidade
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>

    {/* Modal de Edição - Fora do Sheet para evitar conflito de z-index */}
    <EditEntidadeDialog
      entidade={entidade}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      onSuccess={() => {
        // Refresh automático via invalidate no mutation
      }}
    />
    </>
  );
}
