'use client';

import clsx from 'clsx';
import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

/** Botón de envío que se deshabilita mientras el formulario se procesa (evita dobles clics). */
export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        'w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-bold text-white shadow-lg',
        'transition-all hover:from-blue-600 hover:to-purple-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {pending ? 'Procesando…' : children}
    </button>
  );
}
