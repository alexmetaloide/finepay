import { useState, useMemo } from 'react';
import {
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  Plus,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { storage } from '../../lib/storage';

export default function Dashboard({ onAddBill }: { onAddBill: () => void }) {
  const bills = storage.bills.list();

  const getCycle = (dueDateString: string) => {
    const date = new Date(dueDateString);
    const day = date.getUTCDate();
    return (day >= 5 && day < 20) ? 'cycle1' : 'cycle2';
  };

  const { cycle1Bills, cycle2Bills, totalExpenses, totalPaid, totalPending } = useMemo(() => {
    const c1 = bills.filter(b => getCycle(b.dueDate) === 'cycle1');
    const c2 = bills.filter(b => getCycle(b.dueDate) === 'cycle2');

    let expenses = 0;
    let paid = 0;
    let pending = 0;

    bills.forEach(b => {
      expenses += b.amount;
      if (b.isPaid) paid += b.amount;
      else pending += b.amount;
    });

    return { cycle1Bills: c1, cycle2Bills: c2, totalExpenses: expenses, totalPaid: paid, totalPending: pending };
  }, [bills]);

  const cycleData = [
    { name: 'Ciclo 5-20', total: cycle1Bills.reduce((sum, b) => sum + b.amount, 0), paid: cycle1Bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0) },
    { name: 'Ciclo 20-5', total: cycle2Bills.reduce((sum, b) => sum + b.amount, 0), paid: cycle2Bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Total Despesas" value={totalExpenses} icon={DollarSign} color="slate" />
        <SummaryCard title="Já Pago" value={totalPaid} icon={CheckCircle2} color="emerald" />
        <SummaryCard title="A Pagar" value={totalPending} icon={AlertCircle} color="rose" />
        <SummaryCard title="%" target={10000} value={totalExpenses} icon={ArrowUpRight} color="indigo" isPercentage />
      </div>

      {bills.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <TrendingDown className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-slate-500 mb-6">Adicione suas contas para visualizar o dashboard</p>
          <button
            onClick={onAddBill}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 mx-auto transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-5 h-5" />
            ADICIONAR CONTA
          </button>
        </div>
      )}

      {bills.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CycleSection title="Ciclo 05 - 20" bills={cycle1Bills} />
            <CycleSection title="Ciclo 20 - 05" bills={cycle2Bills} />
          </div>

          {/* Comparison Chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Comparativo de Ciclos
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Despesas" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="paid" name="Já Pago" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, isPercentage = false, target }: any) {
  const displayValue = isPercentage
    ? ((value / target) * 100).toFixed(1) + '%'
    : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const colors = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className={`p-3 rounded-xl w-fit mb-4 ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm text-slate-500 font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 tracking-tight">{displayValue}</p>
    </div>
  );
}

function CycleSection({ title, bills }: any) {
  const total = bills.reduce((sum: number, b: any) => sum + b.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-lg">{title}</h4>
        <div className="text-sm font-bold text-slate-500">Total: R$ {total.toFixed(2)}</div>
      </div>
      <div className="space-y-4">
        {bills.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Nenhuma conta neste ciclo</p>
        ) : (
          bills
            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((bill: any) => {
              const isOverdue = new Date(bill.dueDate) < new Date() && !bill.isPaid;
              return (
                <div key={bill.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-indigo-600 truncate flex-1">{bill.name}</div>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${isOverdue ? 'bg-rose-100 text-rose-600' : bill.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {isOverdue ? 'Atrasado' : bill.isPaid ? 'Pago' : 'Pendente'}
                  </div>
                  <div className="font-bold">R$ {bill.amount.toFixed(2)}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
