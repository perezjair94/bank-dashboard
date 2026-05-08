import { useEffect, useMemo } from 'react';
import { useStore, filterTransactions } from './store';
import { PdfUploader } from './components/PdfUploader';
import { Filters } from './components/Filters';
import { Summary } from './components/Summary';
import { TransactionTable } from './components/TransactionTable';
import { Charts } from './components/Charts';
import { StatementsList } from './components/StatementsList';
import { ExportButtons } from './components/ExportButtons';

function App() {
  const load = useStore((s) => s.load);
  const loaded = useStore((s) => s.loaded);
  const statements = useStore((s) => s.statements);
  const filters = useStore((s) => s.filters);
  const transactions = useMemo(() => filterTransactions(statements, filters), [statements, filters]);

  useEffect(() => { load(); }, [load]);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Cargando...</div>;
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Bank Dashboard</h1>
          <p className="text-sm text-zinc-500">Análisis privado de extractos bancarios — todo en tu navegador</p>
        </div>
        <ExportButtons transactions={transactions} />
      </header>

      <PdfUploader />
      <StatementsList />

      {statements.length > 0 ? (
        <>
          <Summary transactions={transactions} />
          <Filters />
          <Charts transactions={transactions} />
          <TransactionTable transactions={transactions} />
        </>
      ) : null}
    </div>
  );
}

export default App;
