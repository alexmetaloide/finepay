import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  MoreVertical,
  X,
  CreditCard,
  Calendar,
  Tag,
  FileText,
  ChevronDown,
  Pencil
} from 'lucide-react';
import { api } from '../../lib/api';

export default function BillList() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pago' | 'pendente' | 'atrasado'>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'moradia',
    notes: '',
    recurrence: 'none'
  };

  const [formData, setFormData] = useState(initialFormState);

  const categories = ['moradia', 'educação', 'transporte', 'alimentação', 'lazer', 'assinaturas', 'outros'];

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    try {
      const data = await api.bills.list();
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePaid = async (bill: any) => {
    try {
      await api.bills.update(bill.id, { isPaid: !bill.isPaid });
      fetchBills();
    } catch (err) {
      alert("Erro ao atualizar status");
    }
  };

  const handleEdit = (bill: any) => {
    setEditingId(bill.id);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      category: bill.category,
      notes: bill.notes || '',
      recurrence: bill.recurrence || 'none'
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja excluir esta conta?")) return;
    try {
      await api.bills.delete(id);
      fetchBills();
    } catch (err) {
      alert("Erro ao excluir");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.bills.fullUpdate(editingId, {
          ...formData,
          amount: parseFloat(formData.amount as string)
        });
      } else {
        await api.bills.create({
          ...formData,
          amount: parseFloat(formData.amount as string)
        });
      }
      
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchBills();
    } catch (err) {
      alert("Erro ao salvar conta");
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(search.toLowerCase());
    const isOverdue = new Date(bill.dueDate) < new Date() && !bill.isPaid;
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'pago') return matchesSearch && bill.isPaid;
    if (filter === 'pendente') return matchesSearch && !bill.isPaid && !isOverdue;
    if (filter === 'atrasado') return matchesSearch && isOverdue;
    return matchesSearch;
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text" 
            placeholder="Buscar contas..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <select 
              value={filter}
              onChange={(e: any) => setFilter(e.target.value)}
              className="w-full md:w-40 pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-900 dark:text-slate-100"
            >
               <option value="all">Todos Status</option>
               <option value="pendente">Pendente</option>
               <option value="pago">Pago</option>
               <option value="atrasado">Em Atraso</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
          
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormState);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">NOVA CONTA</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Conta</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBills.map((bill) => {
                 const isOverdue = new Date(bill.dueDate) < new Date() && !bill.isPaid;
                 return (
                  <tr key={bill.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${bill.isPaid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                           <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white capitalize">{bill.name}</p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                             <Tag className="w-3 h-3" /> {bill.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {bill.isPaid ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full w-fit uppercase tracking-wide">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                        </span>
                      ) : isOverdue ? (
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full w-fit uppercase tracking-wide">
                          <AlertCircle className="w-3.5 h-3.5" /> Atrasado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full w-fit uppercase tracking-wide">
                          <Circle className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                       </p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                         {bill.recurrence === 'none' ? 'Pagamento Único' : `Recorrência: ${bill.recurrence}`}
                       </p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-mono font-bold text-lg">
                         R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleTogglePaid(bill)}
                          title={bill.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                          className={`p-2 rounded-lg transition-all ${bill.isPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(bill)}
                          title="Editar despesa"
                          className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100 transition-all"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bill.id)}
                          title="Excluir despesa"
                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                 );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-medium">Nenhum registro encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden scale-in-center">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingId ? 'Editar Conta' : 'Cadastrar Conta'}</h3>
                <p className="text-sm text-slate-500">
                  {editingId ? 'Atualize as informações da despesa' : 'Adicione uma nova despesa ao FinePay'}
                </p>
              </div>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Nome da Conta</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="Ex: Aluguel, Internet..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input 
                      required
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      type="number" 
                      step="0.01"
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Vencimento</label>
                  <input 
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Categoria</label>
                <div className="relative">
                   <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none capitalize font-medium text-slate-900 dark:text-slate-100"
                   >
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Recorrência</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['none', 'mensal', 'quinzenal', 'semanal', 'anual'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({...formData, recurrence: option})}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        formData.recurrence === option 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {option === 'none' ? 'Único' : option}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                {editingId ? 'ATUALIZAR CONTA' : 'SALVAR CONTA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
