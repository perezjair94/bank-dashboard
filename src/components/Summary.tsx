import type { Transaction } from '../lib/types';
import { money } from '../lib/format';

export function Summary({ transactions }: { transactions: Transaction[] }) {
  const debits = transactions.filter((t) => t.type === 'debit');
  const credits = transactions.filter((t) => t.type === 'credit');
  const totalDebit = debits.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalCredit = credits.reduce((s, t) => s + t.amount, 0);
  const net = totalCredit - totalDebit;

  const cards = [
    { label: 'Movimientos', value: String(transactions.length), color: 'text-zinc-100' },
    { label: 'Ingresos', value: money(totalCredit), color: 'text-emerald-400', sub: `${credits.length} mov.` },
    { label: 'Gastos', value: money(totalDebit), color: 'text-red-400', sub: `${debits.length} mov.` },
    { label: 'Neto', value: money(net), color: net >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">{c.label}</div>
          <div className={`text-2xl font-semibold mt-1 ${c.color}`}>{c.value}</div>
          {c.sub && <div className="text-xs text-zinc-500 mt-1">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
