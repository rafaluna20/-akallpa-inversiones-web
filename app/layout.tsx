import type { Metadata } from 'next';
import { Inter, Roboto_Slab } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const slab = Roboto_Slab({ subsets: ['latin'], variable: '--font-slab', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Akallpa Inversiones', template: '%s · Akallpa Inversiones' },
  description: 'Portal de inversionistas de Akallpa: sigue tus proyectos, cierres mensuales y estado de cuenta.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${slab.variable}`}>
      <body className="bg-slate-950 font-sans text-gray-100 antialiased">{children}</body>
    </html>
  );
}
