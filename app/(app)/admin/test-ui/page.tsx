'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestUIPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🧪 Teste de Componentes UI</h1>

      {/* Teste 1: Botões */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Botões (shadcn)</CardTitle>
          <CardDescription>Se aparecerem estilizados → Tailwind funciona</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="default">Botão Default</Button>
          <Button variant="destructive">Botão Destructive</Button>
          <Button variant="outline">Botão Outline</Button>
        </CardContent>
      </Card>

      {/* Teste 2: Badges */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Badges (shadcn)</CardTitle>
          <CardDescription>Devem aparecer com cores</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Badge>Badge Default</Badge>
          <Badge variant="secondary">Badge Secondary</Badge>
          <Badge variant="destructive">Badge Destructive</Badge>
        </CardContent>
      </Card>

      {/* Teste 3: Classes Tailwind */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Classes Tailwind Puras</CardTitle>
          <CardDescription>Devem aparecer estilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
            Div com bg-blue-500 (Tailwind v4)
          </div>
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            Div com bg-red-500 (Tailwind v4)
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg">
            Div com bg-green-500 (Tailwind v4)
          </div>
        </CardContent>
      </Card>

      {/* Teste 4: HTML Puro */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          4. HTML Puro (controle)
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>Este sempre deve aparecer</p>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Botão HTML Puro
        </button>
      </div>

      {/* Resultado */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2">📊 Diagnóstico:</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Se TODOS aparecem estilizados → Tailwind v4 OK, problema resolvido</li>
          <li>⚠️ Se apenas HTML puro aparece → Tailwind v4 não está funcionando</li>
          <li>🔴 Se nada aparece → Problema maior no build</li>
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="/admin/users"
          className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Voltar para Admin/Users
        </a>
      </div>
    </div>
  );
}
