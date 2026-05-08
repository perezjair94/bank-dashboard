import { useState, useCallback } from 'react';
import { parsePdf, PdfPasswordRequired } from '../lib/parser';
import { useStore } from '../store';
import { Upload, Loader2 } from 'lucide-react';

export function PdfUploader() {
  const addStatement = useStore((s) => s.addStatement);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setBusy(true);
      setError(null);
      try {
        for (const file of Array.from(files)) {
          if (!file.name.toLowerCase().endsWith('.pdf')) continue;
          const buf = await file.arrayBuffer();
          let password: string | undefined;
          let result;
          for (let attempts = 0; attempts < 3; attempts++) {
            try {
              result = await parsePdf(buf.slice(0), file.name, password);
              break;
            } catch (err) {
              if (err instanceof PdfPasswordRequired) {
                const msg = err.retry
                  ? `Contraseña incorrecta para ${file.name}. Reintentar:`
                  : `Contraseña para ${file.name}:`;
                const pw = window.prompt(msg);
                if (!pw) throw new Error('Cancelado');
                password = pw;
              } else {
                throw err;
              }
            }
          }
          if (!result) throw new Error('No se pudo abrir el PDF');
          await addStatement({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            fileName: file.name,
            bank: result.bank,
            pages: result.pages,
            uploadedAt: Date.now(),
            transactions: result.transactions,
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        setBusy(false);
      }
    },
    [addStatement],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
        dragOver ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 bg-zinc-900/40'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        id="pdf-input"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <label htmlFor="pdf-input" className="cursor-pointer flex flex-col items-center gap-2">
        {busy ? (
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        ) : (
          <Upload className="w-8 h-8 text-zinc-400" />
        )}
        <div className="text-zinc-200 font-medium">
          {busy ? 'Procesando...' : 'Arrastrá PDFs o hacé click'}
        </div>
        <div className="text-xs text-zinc-500">
          Detección automática de banco · todo client-side
        </div>
      </label>
      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
    </div>
  );
}
