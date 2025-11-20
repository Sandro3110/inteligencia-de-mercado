import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Building2, ArrowLeft, TrendingUp, Users, Download, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectSelector } from "@/components/ProjectSelector";

export default function Mercados() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [segmentacao, setSegmentacao] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { selectedProjectId } = useSelectedProject();
  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({ 
    search, 
    categoria: categoria || undefined,
    segmentacao: segmentacao || undefined
  });
  const exportMutation = trpc.export.mercados.useMutation();

  const handleExport = async () => {
    if (!selectedProjectId) {
      toast.error('Selecione um projeto primeiro');
      return;
    }
    
    try {
      toast.info('Gerando arquivo Excel...');
      const result = await exportMutation.mutateAsync({ projectId: selectedProjectId });
      
      // Converter base64 para blob e fazer download
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Mercados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar mercados');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ml-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover-lift">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="section-title">Lista de Mercados</h2>
              <h1 className="text-2xl font-semibold text-foreground">
                {mercados?.length || 0} Mercados Únicos
              </h1>
            </div>
            </div>
            <ProjectSelector />
          </div>
          <Breadcrumbs items={[{ label: "Mercados" }]} />

          {/* Search e Exportar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou categoria..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {exportMutation.isPending ? 'Exportando...' : 'Exportar Excel'}
              </Button>
            </div>
            
            {/* Painel de Filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria/CNAE</label>
                    <Input
                      placeholder="Ex: Tecnologia, Saúde..."
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Segmentação</label>
                    <select
                      value={segmentacao}
                      onChange={(e) => setSegmentacao(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="">Todos</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCategoria("");
                        setSegmentacao("");
                      }}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
                {(categoria || segmentacao) && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    {[categoria && `Categoria: ${categoria}`, segmentacao && `Segmentação: ${segmentacao}`]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mercados Grid */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mercados?.map((mercado) => (
            <Link key={mercado.id} href={`/mercado/${mercado.id}`}>
              <Card className="glass-card cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="pill-badge">
                      <span className="status-dot info"></span>
                      {mercado.segmentacao || 'N/A'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                    {mercado.nome}
                  </h3>

                  {mercado.categoria && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {mercado.categoria}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{mercado.quantidadeClientes || 0} clientes</span>
                    </div>
                    {mercado.crescimentoAnual && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">{mercado.crescimentoAnual.substring(0, 10)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {mercados?.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum mercado encontrado
            </p>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou limpar os filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

