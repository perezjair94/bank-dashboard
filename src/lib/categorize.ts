export type CategoryRule = {
  category: string;
  patterns: RegExp[];
};

export const CATEGORY_RULES: CategoryRule[] = [
  { category: 'Mercado', patterns: [/tiendas?\s*ara/i, /\bd1\b/i, /\bara\b/i, /justo\s*&?\s*bueno/i, /exito/i, /jumbo/i, /carulla/i, /olimpica/i, /mercado/i, /supermercado/i] },
  { category: 'Combustible', patterns: [/\beds\b/i, /terpel/i, /esso/i, /mobil/i, /biocomb/i, /gasolina/i] },
  { category: 'Restaurantes', patterns: [/rappi/i, /didi\s*food/i, /mcdonald/i, /burger/i, /kfc/i, /dominos/i, /pizza/i, /restaurante/i, /chola/i, /sushi/i, /batidos/i] },
  { category: 'Transporte', patterns: [/uber/i, /didi/i, /cabify/i, /indriver/i, /taxi/i, /transmilenio/i] },
  { category: 'Streaming', patterns: [/netflix/i, /spotify/i, /disney/i, /hbo/i, /prime\s*video/i, /youtube\s*premium/i, /apple\.com\/bill/i, /apple\.com\s*bill/i] },
  { category: 'Tecnologia', patterns: [/microsoft/i, /apple/i, /google/i, /openai/i, /github/i, /aws/i, /digitalocean/i, /vercel/i, /dollarcity/i] },
  { category: 'Servicios', patterns: [/epm\b/i, /factura/i, /comcel/i, /claro/i, /movistar/i, /tigo/i, /agua/i, /luz/i, /energia/i, /gas\s*natural/i, /internet/i] },
  { category: 'Salud', patterns: [/farmacia/i, /drogas?\s*la|drogueria/i, /eps\b/i, /sura/i, /sanitas/i, /clinica/i, /hospital/i] },
  { category: 'Retiros ATM', patterns: [/retiro\s*en\s*cajero/i, /retiro\s*en\s*corresponsal/i, /\batm\b/i] },
  { category: 'Transferencias enviadas', patterns: [/^enviaste\s*a/i, /envio\s*con/i, /^para\s+/i] },
  { category: 'Transferencias recibidas', patterns: [/^recibiste\s*de/i, /recibi\s*por/i, /pago\s*recibido/i, /recarga\s*desde/i] },
  { category: 'Pagos QR', patterns: [/pago\s*en\s*qr/i] },
  { category: 'Impuestos', patterns: [/gravamen/i, /4x1000/i, /retefuente/i, /impuesto/i] },
  { category: 'Intereses', patterns: [/pago\s*de\s*intereses/i, /rendimiento/i] },
  { category: 'Tarjeta de credito', patterns: [/sistecredito/i, /serfinanza/i, /cuota\s*tarjeta/i] },
  { category: 'Cajitas / Ahorro', patterns: [/cajita/i, /caj[ií]ta/i, /respaldo\s*tarjeta/i, /abre\s*caminos/i] },
  { category: 'Compras', patterns: [/compra\s*en/i] },
];

export function categorize(description: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(description))) return rule.category;
  }
  return 'Otros';
}
