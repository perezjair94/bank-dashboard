import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import type { Transaction } from '../lib/types';
import { money, shortDate } from '../lib/format';

const COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#8b5cf6', '#84cc16'];

export function Charts({ transactions }: { transactions: Transaction[] }) {
  const debits = useMemo(() => transactions.filter((t) => t.type === 'debit'), [transactions]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of debits) map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [debits]);

  const byDay = useMemo(() => {
    const map = new Map<string, { date: string; gastos: number; ingresos: number }>();
    for (const t of transactions) {
      const e = map.get(t.date) ?? { date: t.date, gastos: 0, ingresos: 0 };
      if (t.type === 'debit') e.gastos += Math.abs(t.amount);
      else e.ingresos += t.amount;
      map.set(t.date, e);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const balanceLine = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    let acc = 0;
    return sorted.map((t) => { acc += t.amount; return { date: t.date, balance: Math.round(acc) }; });
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <ChartCard title="Gastos por categoría">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
              {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => money(Number(v))} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Movimientos por día">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tickFormatter={shortDate} stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => money(Number(v))} labelFormatter={(l) => shortDate(String(l))} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="ingresos" fill="#10b981" />
            <Bar dataKey="gastos" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Balance acumulado" wide>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={balanceLine}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tickFormatter={shortDate} stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => money(Number(v))} labelFormatter={(l) => shortDate(String(l))} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="balance" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

const tooltipStyle = { background: '#18181b', border: '1px solid #27272a', borderRadius: 6 };

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 ${wide ? 'lg:col-span-2' : ''}`}>
      <h3 className="text-sm font-medium text-zinc-300 mb-2">{title}</h3>
      {children}
    </div>
  );
}
