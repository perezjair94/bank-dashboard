import Dexie, { type Table } from 'dexie';
import type { Statement } from './types';

class BankDB extends Dexie {
  statements!: Table<Statement, string>;

  constructor() {
    super('bank-dashboard');
    this.version(1).stores({
      statements: 'id, fileName, bank, uploadedAt',
    });
  }
}

export const db = new BankDB();
