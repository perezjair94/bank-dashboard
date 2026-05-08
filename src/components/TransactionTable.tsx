import type { Transaction } from '../lib/types';
import { money, shortDate, BANK_LABEL } from '../lib/format';

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 sticky top-0">
            <tr className="text-left text-zinc-400 text-xs uppercase">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Banco</th>
              <th className="px-3 py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-zinc-500">Sin transacciones</td></tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800 hover:bg-zinc-900/60">
                <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{shortDate(t.date)}</td>
                <td className="px-3 py-2 text-zinc-200">{t.description}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{t.category}</span>
                </td>
                <td className="px-3 py-2 text-zinc-400 text-xs">{BANK_LABEL[t.bank] ?? t.bank}</td>
                <td className={`px-3 py-2 text-right font-mono whitespace-nowrap ${t.type === 'debit' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {t.type === 'debit' ? '-' : '+'}{money(Math.abs(t.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
