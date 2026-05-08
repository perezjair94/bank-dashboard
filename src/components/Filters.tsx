import { useStore } from '../store';
import { CATEGORY_RULES } from '../lib/categorize';
import { BANK_LABEL } from '../lib/format';
import { X } from 'lucide-react';

export function Filters() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const reset = useStore((s) => s.resetFilters);
  const statements = useStore((s) => s.statements);
  const banks = Array.from(new Set(statements.map((s) => s.bank)));

  const input = 'bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none';

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-200">Filtros</h3>
        <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
          <X className="w-3 h-3" /> Limpiar
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <input
          className={input}
          placeholder="Buscar (regex)"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
        <input
          className={input}
          placeholder="Excluir (regex)"
          value={filters.exclude}
          onChange={(e) => setFilters({ exclude: e.target.value })}
        />
        <select
          className={input}
          value={filters.category ?? ''}
          onChange={(e) => setFilters({ category: e.target.value || null })}
        >
          <option value="">Todas las categorías</option>
          {CATEGORY_RULES.map((r) => (
            <option key={r.category} value={r.category}>{r.category}</option>
          ))}
          <option value="Otros">Otros</option>
        </select>
        <select
          className={input}
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value as 'all' | 'debit' | 'credit' })}
        >
          <option value="all">Débito + Crédito</option>
          <option value="debit">Débito (gastos)</option>
          <option value="credit">Crédito (ingresos)</option>
        </select>
        <select
          className={input}
          value={filters.bank ?? ''}
          onChange={(e) => setFilters({ bank: e.target.value || null })}
        >
          <option value="">Todos los bancos</option>
          {banks.map((b) => <option key={b} value={b}>{BANK_LABEL[b] ?? b}</option>)}
        </select>
        <input type="date" className={input} value={filters.from ?? ''} onChange={(e) => setFilters({ from: e.target.value || null })} />
        <input type="date" className={input} value={filters.to ?? ''} onChange={(e) => setFilters({ to: e.target.value || null })} />
        <div className="flex gap-1">
          <input type="number" placeholder="Min" className={input + ' w-full'} value={filters.minAmount ?? ''} onChange={(e) => setFilters({ minAmount: e.target.value ? parseFloat(e.target.value) : null })} />
          <input type="number" placeholder="Max" className={input + ' w-full'} value={filters.maxAmount ?? ''} onChange={(e) => setFilters({ maxAmount: e.target.value ? parseFloat(e.target.value) : null })} />
        </div>
      </div>
    </div>
  );
}
