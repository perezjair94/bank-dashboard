import { create } from 'zustand';
import type { Statement, Transaction } from './lib/types';
import { db } from './lib/db';

export type Filters = {
  search: string;
  exclude: string;
  category: string | null;
  type: 'all' | 'debit' | 'credit';
  bank: string | null;
  from: string | null;
  to: string | null;
  minAmount: number | null;
  maxAmount: number | null;
};

type State = {
  statements: Statement[];
  filters: Filters;
  loaded: boolean;
  load: () => Promise<void>;
  addStatement: (s: Statement) => Promise<void>;
  removeStatement: (id: string) => Promise<void>;
  setFilters: (p: Partial<Filters>) => void;
  resetFilters: () => void;
};

const defaultFilters: Filters = {
  search: '',
  exclude: '',
  category: null,
  type: 'all',
  bank: null,
  from: null,
  to: null,
  minAmount: null,
  maxAmount: null,
};

export const useStore = create<State>((set, get) => ({
  statements: [],
  filters: defaultFilters,
  loaded: false,
  load: async () => {
    const statements = await db.statements.orderBy('uploadedAt').reverse().toArray();
    set({ statements, loaded: true });
  },
  addStatement: async (s) => {
    await db.statements.put(s);
    set({ statements: [s, ...get().statements.filter((x) => x.id !== s.id)] });
  },
  removeStatement: async (id) => {
    await db.statements.delete(id);
    set({ statements: get().statements.filter((s) => s.id !== id) });
  },
  setFilters: (p) => set({ filters: { ...get().filters, ...p } }),
  resetFilters: () => set({ filters: defaultFilters }),
}));

export function filterTransactions(statements: Statement[], f: Filters): Transaction[] {
  const all = statements.flatMap((s) => s.transactions);
  let search: RegExp | null = null;
  let exclude: RegExp | null = null;
  try { if (f.search) search = new RegExp(f.search, 'i'); } catch { /* invalid regex */ }
  try { if (f.exclude) exclude = new RegExp(f.exclude, 'i'); } catch { /* invalid regex */ }
  return all
    .filter((t) => {
      if (search && !search.test(t.description)) return false;
      if (exclude && exclude.test(t.description)) return false;
      if (f.category && t.category !== f.category) return false;
      if (f.type !== 'all' && t.type !== f.type) return false;
      if (f.bank && t.bank !== f.bank) return false;
      if (f.from && t.date < f.from) return false;
      if (f.to && t.date > f.to) return false;
      const abs = Math.abs(t.amount);
      if (f.minAmount !== null && abs < f.minAmount) return false;
      if (f.maxAmount !== null && abs > f.maxAmount) return false;
      return true;
    })
    .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
}
