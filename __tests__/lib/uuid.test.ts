import { nuevaLlave } from '@/lib/uuid';

const FORMATO_ODOO = /^[A-Za-z0-9_-]{8,64}$/;

describe('nuevaLlave', () => {
  test('genera llaves con el formato que exige Odoo y distintas entre sí', () => {
    const llaves = new Set(Array.from({ length: 200 }, () => nuevaLlave()));
    expect(llaves.size).toBe(200);
    llaves.forEach((l) => expect(l).toMatch(FORMATO_ODOO));
  });

  test('funciona sin crypto.randomUUID (contextos no seguros)', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: { getRandomValues: original.getRandomValues.bind(original) }, configurable: true });
    try {
      expect(nuevaLlave()).toMatch(FORMATO_ODOO);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });

  test('funciona incluso sin crypto', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      expect(nuevaLlave()).toMatch(FORMATO_ODOO);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });
});
