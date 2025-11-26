'use client';
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Página em Desenvolvimento</h1>
        <p className="text-gray-600 mt-1">
          Esta funcionalidade está sendo implementada
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Em breve...
        </p>
      </div>
    </div>
  );
}
