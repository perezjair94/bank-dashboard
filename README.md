# Bank Dashboard

A privacy-first personal finance dashboard. Drop in your bank statements (PDF) and get your transactions parsed, categorized and charted — **entirely in the browser**. No backend, no uploads, no accounts: your financial data never leaves your machine.

Built for Colombian banks (Nu, Nequi, Bancolombia), whose statements are only available as PDFs.

## Features

- **PDF parsing in the browser** with `pdf.js`, including **password-protected statements** (prompts for the password and retries).
- **Automatic bank detection** from the statement text, with a parser per format (Nu, Nequi, and a generic date/amount parser as fallback).
- **Robust amount parsing** for mixed number formats (`1.234,56`, `1,234.56`, `$+50.000`) and signed debits/credits.
- **Rule-based categorization** (groceries, transport, subscriptions, utilities, taxes, transfers…) using regex rules that are easy to extend in [`src/lib/categorize.ts`](src/lib/categorize.ts).
- **Local persistence** with IndexedDB (Dexie): statements survive page reloads, and re-uploading the same file replaces it instead of duplicating it.
- **Filters** by text, excluded terms, category, type, bank, date range and amount range.
- **Charts** (Recharts): spending by category, daily income vs. expenses, and cumulative balance.
- **Export** the filtered transactions to CSV or JSON.

## Tech stack

| Layer | Tools |
|---|---|
| UI | React 19 · TypeScript · Tailwind CSS v4 · lucide-react |
| State | Zustand |
| Storage | IndexedDB via Dexie |
| PDF | pdfjs-dist |
| Charts | Recharts |
| Tooling | Vite · ESLint (typescript-eslint, react-hooks) |

## How it works

```
PDF file ──► pdf.js text extraction ──► line reconstruction (by Y position)
         ──► bank detection ──► per-bank regex parsers ──► Transaction[]
         ──► categorization ──► IndexedDB ──► Zustand store ──► filters ──► charts / table / export
```

The key design decision is **zero server**: parsing bank statements involves highly sensitive data, so everything — text extraction, parsing, storage — runs client-side.

## Project structure

```
src/
├── lib/
│   ├── parser.ts       # PDF text extraction, bank detection, transaction parsing
│   ├── categorize.ts   # Regex-based category rules
│   ├── db.ts           # Dexie (IndexedDB) schema
│   ├── format.ts       # Currency/date formatting
│   └── types.ts
├── components/         # Uploader, filters, summary cards, charts, table, export
├── store.ts            # Zustand store + filtering logic
└── App.tsx
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Roadmap

- Support more banks (Bancolombia-specific parser, Davivienda, credit card statements)
- User-editable categories and rules
- Month-over-month comparison and budgets
