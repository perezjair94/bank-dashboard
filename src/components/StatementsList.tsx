import { useStore } from '../store';
import { BANK_LABEL } from '../lib/format';
import { Trash2, FileText } from 'lucide-react';

export function StatementsList() {
  const statements = useStore((s) => s.statements);
  const remove = useStore((s) => s.removeStatement);

  if (statements.length === 0) return null;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3">
      <h3 className="text-xs uppercase text-zinc-500 mb-2">Extractos cargados ({statements.length})</h3>
      <div className="space-y-1">
        {statements.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 text-sm py-1.5 px-2 hover:bg-zinc-900/60 rounded">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-zinc-300 truncate">{s.fileName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 shrink-0">{BANK_LABEL[s.bank]}</span>
              <span className="text-xs text-zinc-500 shrink-0">{s.transactions.length} mov.</span>
            </div>
            <button onClick={() => remove(s.id)} className="text-zinc-500 hover:text-red-400 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
