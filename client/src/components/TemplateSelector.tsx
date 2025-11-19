import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (templateId: number, config: any) => void;
  selectedTemplateId?: number;
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const { data: templates, isLoading } = trpc.templates.byId.useQuery(1); // Placeholder - templates router não existe

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando templates...</div>;
  }

  if (!templates) {
    return <div className="text-center text-muted-foreground">Nenhum template disponível</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates && [templates].map((template: any) => {
        const isSelected = selectedTemplateId === template.id;
        const config = JSON.parse(template.config);

        return (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'border-primary border-2 bg-primary/5' : ''
            }`}
            onClick={() => onSelect(template.id, config)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {template.name}
                    {template.isDefault === 1 && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Padrão
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Segmentação:</span>
                  <Badge variant="outline">{config.targetSegmentation}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Score mínimo:</span>
                  <span className="font-medium">{config.minQualityScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">APIs:</span>
                  <span className="font-medium">{config.dataApis?.length || 0} fontes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
