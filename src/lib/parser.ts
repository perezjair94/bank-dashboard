import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Bank, Transaction } from './types';
import { categorize } from './categorize';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MONTHS_ES: Record<string, string> = {
  ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
  jul: '07', ago: '08', sep: '09', set: '09', oct: '10', nov: '11', dic: '12',
};

export type ParseResult = {
  bank: Bank;
  pages: number;
  transactions: Transaction[];
  rawText: string;
};

export class PdfPasswordRequired extends Error {
  retry: boolean;
  constructor(retry: boolean) {
    super(retry ? 'Contraseña incorrecta' : 'PDF protegido con contraseña');
    this.retry = retry;
  }
}

export async function parsePdf(
  data: ArrayBuffer,
  fileName: string,
  password?: string,
): Promise<ParseResult> {
  let doc;
  try {
    const task = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      password,
      disableFontFace: true,
    });
    doc = await task.promise;
  } catch (err: unknown) {
    const e = err as { name?: string; code?: number };
    if (e?.name === 'PasswordException') {
      throw new PdfPasswordRequired(e.code === 2);
    }
    throw err;
  }

  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY: number | null = null;
    let line = '';
    const items = content.items as Array<{ str: string; transform?: number[]; hasEOL?: boolean }>;
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      if (!item || typeof item.str !== 'string') continue;
      const y = item.transform ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        text += line.trim() + '\n';
        line = '';
      }
      line += item.str + (item.hasEOL ? '\n' : ' ');
      lastY = y;
    }
    if (line) text += line.trim() + '\n';
    text += '\n';
  }

  const bank = detectBank(text);
  const transactions = extractTransactions(text, bank, fileName);

  return { bank, pages: doc.numPages, transactions, rawText: text };
}

export function detectBank(text: string): Bank {
  const t = text.toLowerCase();
  if (/nu\s*colombia|nu\s*financiera|cuenta\s*nu/.test(t)) return 'nu';
  if (/nequi|dep[oó]sito\s*de\s*bajo\s*monto/.test(t) || /bre-b/.test(t)) return 'nequi';
  if (/bancolombia/.test(t)) return 'bancolombia';
  return 'unknown';
}

function detectYear(text: string): string {
  const m = text.match(/\b(20\d{2})\b/);
  return m ? m[1] : String(new Date().getFullYear());
}

function normalizeDate(raw: string, periodYear: string): string | null {
  const mEs = raw.match(/^(\d{1,2})\s+([a-zñ]{3,4})\.?$/i);
  if (mEs) {
    const mo = MONTHS_ES[mEs[2].toLowerCase().slice(0, 3)];
    if (mo) return `${periodYear}-${mo}-${mEs[1].padStart(2, '0')}`;
  }
  const slash = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slash) return `${slash[1]}-${slash[2]}-${slash[3]}`;
  const slash2 = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash2) return `${slash2[3]}-${slash2[2]}-${slash2[1]}`;
  const dash = raw.match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
  if (dash) {
    let y = dash[3];
    if (y.length === 2) y = (parseInt(y) > 50 ? '19' : '20') + y;
    return `${y}-${dash[2]}-${dash[1]}`;
  }
  return null;
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  let s = raw.replace(/[^\d,.-]/g, '');
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (s.includes(',')) {
    const parts = s.split(',');
    if (parts[parts.length - 1].length === 2) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function applySign(raw: string, n: number): number {
  const isNeg = raw.includes('-');
  const isPos = /^\+/.test(raw);
  const abs = Math.abs(n);
  if (isNeg) return -abs;
  if (isPos) return abs;
  return n;
}

function extractTransactions(text: string, bank: Bank, fileName: string): Transaction[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const txs: Transaction[] = [];
  const periodYear = detectYear(text);

  const nuRe = /^(\d{1,2}\s+[a-zñ]{3,4}\.?)\s{2,}(.+?)\s{2,}([+-]?\$[\d.,]+)\s*$/i;
  const nuReLoose = /^(\d{1,2}\s+[a-zñ]{3,4}\.?)\s+(.+?)\s+([+-]?\$[\d.,]+)\s*$/i;
  const nequiRe = /^(\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\$[+-]?[\d.,]+)\s+(\$[\d.,]+)\s*$/;
  const numericRe = /^(\d{2}[/-]\d{2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2})\s+(.+?)\s+(-?[\d.,]+)(?:\s+(-?[\d.,]+))?$/;

  let idx = 0;
  for (const line of lines) {
    let date: string | null = null;
    let description = '';
    let amountRaw = '';
    let balance: number | null = null;

    let m = line.match(nequiRe);
    if (m) {
      date = normalizeDate(m[1], periodYear);
      description = m[2].trim();
      amountRaw = m[3];
      balance = parseAmount(m[4]);
    } else if ((m = line.match(nuRe) || line.match(nuReLoose))) {
      date = normalizeDate(m[1], periodYear);
      description = m[2].trim();
      amountRaw = m[3];
    } else if ((m = line.match(numericRe))) {
      date = normalizeDate(m[1], periodYear);
      description = m[2].trim();
      amountRaw = m[3];
      balance = m[4] ? parseAmount(m[4]) : null;
    }

    if (!date) continue;
    const parsed = parseAmount(amountRaw);
    if (parsed === null) continue;
    const amount = applySign(amountRaw, parsed);

    txs.push({
      id: `${fileName}-${idx++}-${date}`,
      date,
      description,
      amount,
      type: amount < 0 ? 'debit' : 'credit',
      balance,
      category: categorize(description),
      bank,
      source: fileName,
      raw: line,
    });
  }
  return txs;
}
