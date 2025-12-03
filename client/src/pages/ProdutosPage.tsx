import { Package, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function ProdutosPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Browse de Produtos"
        description="Explore e analise produtos"
        icon={Package}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Produtos' }
        ]}
      />

      <Card className="p-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Browse de Produtos</h3>
        <p className="text-muted-foreground mb-6">
          Funcionalidade em desenvolvimento
        </p>
        <Button
          variant="outline"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </Card>
    </div>
  );
}
