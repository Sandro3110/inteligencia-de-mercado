import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configurações de performance
  reactStrictMode: true,
  
  // Turbopack para dev (mais rápido que Webpack)
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },

  // Configuração de headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // Webpack config para bibliotecas específicas
  webpack: (config, { isServer }) => {
    // Leaflet precisa de configuração especial
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Configuração para arquivos SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Transpile packages específicos
  transpilePackages: [
    'react-leaflet',
    'leaflet',
    'leaflet.heat',
    'leaflet.markercluster',
  ],
};

export default nextConfig;
