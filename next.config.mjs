/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuração para Vercel
  output: 'standalone',
  
  // Configuração de imagens
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuração de headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Configuração de webpack
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    // Fix para Drizzle ORM - externalizar TODOS os dialetos não usados
    config.externals.push(
      'bun:sqlite',
      '@libsql/client',
      '@neondatabase/serverless',
      'mysql2',
      'mysql2/promise',
      '@planetscale/database',
      'better-sqlite3',
      'sql.js',
      '@vercel/postgres'
    );
    return config;
  },
  
  // Configuração experimental
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Desabilitar telemetria
  telemetry: false,
  
  // Otimizações de build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
