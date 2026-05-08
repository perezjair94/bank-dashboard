import type { Transaction } from '../lib/types';
import { Download } from 'lucide-react';

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ transactions }: { transactions: Transaction[] }) {
  const exportJson = () => download('transacciones.json', JSON.stringify(transactions, null, 2), 'application/json');
  const exportCsv = () => {
    const head = ['date', 'description', 'amount', 'type', 'category', 'bank', 'balance', 'source'];
    const rows = transactions.map((t) =>
      head.map((k) => {
        const v = t[k as keyof Transaction] ?? '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(','),
    );
    download('transacciones.csv', [head.join(','), ...rows].join('\n'), 'text/csv');
  };

  const btn = 'flex items-center gap-1.5 text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded';
  return (
    <div className="flex gap-2">
      <button onClick={exportCsv} className={btn}><Download className="w-3.5 h-3.5" /> CSV</button>
      <button onClick={exportJson} className={btn}><Download className="w-3.5 h-3.5" /> JSON</button>
    </div>
  );
}
