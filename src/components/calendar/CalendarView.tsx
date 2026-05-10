import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { storage, type Bill } from '../../lib/storage';
import { Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CalendarView() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    setBills(storage.bills.list());
  }, []);

  const getBillsForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD sem problemas de fuso
    return bills.filter(b => b.dueDate === dateStr);
  };

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const dayBills = getBillsForDate(date);
      if (dayBills.length > 0) {
        const hasUnpaid = dayBills.some(b => !b.isPaid);
        return (
          <div className="flex justify-center mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${hasUnpaid ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
          </div>
        );
      }
    }
    return null;
  };

  const selectedDayBills = getBillsForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <style>{`
          .react-calendar {
            width: 100%;
            border: none;
            background: transparent;
            font-family: inherit;
          }
          .react-calendar__navigation {
            margin-bottom: 2rem;
          }
          .react-calendar__navigation button {
            color: #6366f1;
            font-weight: bold;
            font-size: 1.2rem;
            border-radius: 12px;
          }
          .react-calendar__navigation button:hover {
            background-color: #f1f5f9;
          }
          .dark .react-calendar__navigation button:hover {
            background-color: #1e293b;
          }
          .dark .react-calendar__month-view__days__day {
            color: #f1f5f9;
          }
          .react-calendar__tile {
            padding: 1.5rem 0.5rem;
            border-radius: 16px;
            font-weight: 500;
          }
          .react-calendar__tile--now {
            background: #eef2ff !important;
            color: #6366f1 !important;
          }
          .dark .react-calendar__tile--now {
            background: #312e81 !important;
            color: #a5b4fc !important;
          }
          .react-calendar__tile--active {
            background: #6366f1 !important;
            color: white !important;
            box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
          }
          .react-calendar__month-view__weekdays__weekday {
            text-transform: uppercase;
            font-size: 0.7rem;
            font-weight: 700;
            color: #94a3b8;
            text-decoration: none;
          }
        `}</style>
        <Calendar
          onChange={(val: any) => setSelectedDate(val)}
          value={selectedDate}
          tileContent={tileContent}
          locale="pt-BR"
        />
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-500" />
            Contas em {selectedDate.toLocaleDateString('pt-BR')}
          </h4>

          <div className="space-y-4">
            {selectedDayBills.length > 0 ? selectedDayBills.map(bill => (
              <div key={bill.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-slate-800 dark:text-white capitalize">{bill.name}</h5>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold uppercase text-slate-500">
                    {bill.category}
                  </span>
                  {bill.isPaid ? (
                    <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Pago
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 text-xs font-bold uppercase">
                      <AlertCircle className="w-4 h-4" /> Pendente
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium">Nenhuma conta para este dia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
