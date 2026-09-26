import type { Metadata } from 'next';
import { PT_Sans, Roboto_Slab } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

// Las mismas tipografías de Inversiones Pro.
const ptSans = PT_Sans({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-pt-sans', display: 'swap' });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-roboto-slab', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Akallpa Inversiones', template: '%s · Akallpa Inversiones' },
  description: 'Portal de inversionistas de Akallpa: sigue tus proyectos, cierres mensuales y estado de cuenta.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${ptSans.variable} ${robotoSlab.variable}`}>
      <body className="bg-slate-950 font-sans text-gray-100 antialiased">{children}</body>
    </html>
  );
}
