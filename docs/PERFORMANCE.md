# ⚡ Guia de Performance

Este documento descreve as otimizações de performance implementadas no projeto.

## 📋 Índice

- [Otimizações de Build](#otimizações-de-build)
- [Otimizações de Imagens](#otimizações-de-imagens)
- [Otimizações de Bundle](#otimizações-de-bundle)
- [Caching](#caching)
- [Métricas de Performance](#métricas-de-performance)

---

## 🏗️ Otimizações de Build

### SWC Minification

O projeto utiliza **SWC** para minificação, que é 7x mais rápido que Terser.

```typescript
// next.config.ts
swcMinify: true
```

### Turbopack (Dev)

Em desenvolvimento, o projeto usa **Turbopack** para builds mais rápidos.

```typescript
// next.config.ts
experimental: {
  turbo: {
    // ...
  }
}
```

### React Strict Mode

Ativado para detectar problemas potenciais em desenvolvimento.

```typescript
// next.config.ts
reactStrictMode: true
```

---

## 🖼️ Otimizações de Imagens

### Formatos Modernos

Imagens são automaticamente convertidas para **AVIF** e **WebP**, que oferecem melhor compressão.

```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp']
}
```

### Responsive Images

Múltiplos tamanhos de imagem são gerados para diferentes dispositivos.

```typescript
// next.config.ts
deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
```

### Lazy Loading

Todas as imagens usam lazy loading por padrão.

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy" // Default
/>
```

### Cache de Longo Prazo

Imagens são cacheadas por 1 ano.

```typescript
// next.config.ts
minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year
```

---

## 📦 Otimizações de Bundle

### Code Splitting

Next.js automaticamente faz code splitting por página.

### Dynamic Imports

Para componentes pesados, use dynamic imports:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if not needed
});
```

### Tree Shaking

Importe apenas o necessário de bibliotecas:

```tsx
// ❌ Bad
import _ from 'lodash';

// ✅ Good
import debounce from 'lodash/debounce';
```

### Bundle Analysis

Analise o tamanho do bundle:

```bash
npm run build
npx @next/bundle-analyzer
```

---

## 💾 Caching

### Static Generation

Páginas estáticas são geradas no build e servidas do CDN.

```tsx
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### API Route Caching

Cache responses de API routes:

```tsx
// app/api/data/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### Redis Caching

Use Redis para cache de dados frequentes:

```typescript
import { redis } from '@/lib/redis';

// Get from cache
const cached = await redis.get('key');
if (cached) return JSON.parse(cached);

// Fetch and cache
const data = await fetchData();
await redis.set('key', JSON.stringify(data), 'EX', 3600);
```

---

## 📊 Métricas de Performance

### Core Web Vitals

O projeto monitora as métricas Core Web Vitals:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Lighthouse Score

**Metas:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### Monitoramento

Use Sentry para monitorar performance em produção:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  tracesSampleRate: 0.1, // 10% of transactions
});
```

---

## 🚀 Best Practices

### Fonts

Use `next/font` para otimizar fonts:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

<body className={inter.className}>
```

### Prefetching

Next.js automaticamente prefetch links visíveis:

```tsx
import Link from 'next/link';

<Link href="/about" prefetch={true}>
  About
</Link>
```

### Streaming

Use Suspense para streaming de conteúdo:

```tsx
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

### Third-Party Scripts

Use `next/script` para otimizar scripts de terceiros:

```tsx
import Script from 'next/script';

<Script
  src="https://example.com/script.js"
  strategy="lazyOnload"
/>
```

---

## 📈 Resultados

Com essas otimizações, o projeto alcança:

- **Build Time:** < 2 minutos
- **First Load JS:** < 200KB
- **Lighthouse Performance:** > 90
- **LCP:** < 2s
- **TTI:** < 3s

---

## 🔧 Ferramentas

- **Lighthouse:** Auditoria de performance
- **WebPageTest:** Testes de performance detalhados
- **Bundle Analyzer:** Análise de bundle size
- **Sentry:** Monitoramento de performance em produção
