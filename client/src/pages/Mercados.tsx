import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Building2, ArrowLeft, TrendingUp, Users } from "lucide-react";

export default function Mercados() {
  const [search, setSearch] = useState("");
  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({ search });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
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

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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

