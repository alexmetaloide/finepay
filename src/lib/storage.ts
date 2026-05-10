// Camada de persistência local — substitui todas as chamadas à API
// Dados salvos no localStorage como JSON

const BILLS_KEY = 'finepay_bills';

export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  notes: string;
  recurrence: string;
  isPaid: boolean;
  createdAt: string;
}

function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(BILLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBills(bills: Bill[]): void {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

function nextId(bills: Bill[]): number {
  return bills.length > 0 ? Math.max(...bills.map(b => b.id)) + 1 : 1;
}

export const storage = {
  bills: {
    list(): Bill[] {
      return loadBills().sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    },

    create(data: Omit<Bill, 'id' | 'isPaid' | 'createdAt'>): Bill {
      const bills = loadBills();
      const newBill: Bill = {
        ...data,
        id: nextId(bills),
        isPaid: false,
        createdAt: new Date().toISOString(),
      };
      saveBills([...bills, newBill]);
      return newBill;
    },

    update(id: number, patch: Partial<Bill>): void {
      const bills = loadBills().map(b => (b.id === id ? { ...b, ...patch } : b));
      saveBills(bills);
    },

    delete(id: number): void {
      saveBills(loadBills().filter(b => b.id !== id));
    },
  },

  stats() {
    const bills = loadBills();
    const now = new Date().toISOString().split('T')[0];
    return {
      totalPending: bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0),
      totalPaid: bills.filter(b => b.isPaid).reduce((s, b) => s + b.amount, 0),
      overdueCount: bills.filter(b => b.dueDate < now && !b.isPaid).length,
    };
  },
};
