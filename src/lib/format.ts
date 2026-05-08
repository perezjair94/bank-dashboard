export const fmt = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function money(n: number) {
  return fmt.format(n);
}

export function shortDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
}

export const BANK_LABEL: Record<string, string> = {
  nu: 'Nu',
  nequi: 'Nequi',
  bancolombia: 'Bancolombia',
  unknown: 'Desconocido',
};
