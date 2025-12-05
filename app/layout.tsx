import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../client/src/index.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Intelmarket - Inteligência de Mercado',
  description: 'Plataforma de inteligência de mercado com importação, enriquecimento e análise de dados',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
