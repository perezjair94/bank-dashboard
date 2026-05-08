export type Bank = 'nu' | 'nequi' | 'bancolombia' | 'unknown';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number | null;
  category: string;
  bank: Bank;
  source: string;
  raw: string;
};

export type Statement = {
  id: string;
  fileName: string;
  bank: Bank;
  pages: number;
  uploadedAt: number;
  transactions: Transaction[];
};
