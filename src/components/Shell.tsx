import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Calendar as CalendarIcon,
  Menu,
  X,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/storage';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('finepay_dark') === 'true';
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finepay_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finepay_dark', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const bills = storage.bills.list();
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const alerts = bills
      .filter((bill: any) => {
        if (bill.isPaid) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate <= threeDaysFromNow;
      })
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    setNotifications(alerts);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bills', label: 'Minhas Contas', icon: Receipt },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:block z-40">
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Receipt className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FinePay</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400 px-4 mb-2 font-medium uppercase tracking-wider">Dados locais</p>
            <p className="text-xs text-slate-500 px-4">Suas contas ficam salvas neste dispositivo.</p>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Receipt className="text-indigo-600 w-6 h-6" />
          <span className="font-bold">FinePay</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] lg:hidden p-6"
          >
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-xl font-bold">FinePay</h1>
              <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-10 pb-20 lg:pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 text-sm">Gerencie suas finanças com facilidade</p>
            </div>
            <div className="flex gap-2 relative">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Alternar tema"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative ${isNotificationsOpen ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500/20' : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 lg:absolute lg:inset-auto"
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed lg:absolute top-16 right-4 lg:right-0 w-[calc(100vw-32px)] lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <h4 className="font-bold">Notificações</h4>
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase">
                            {notifications.length} Alertas
                          </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(n => {
                              const isOverdue = new Date(n.dueDate) < new Date();
                              return (
                                <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                                  <div className="flex gap-3">
                                    <div className={`p-2 rounded-lg h-fit ${isOverdue ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                      <Bell className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold truncate">{n.name}</p>
                                      <p className="text-xs text-slate-500">
                                        {isOverdue ? 'Vencida em ' : 'Vence em '}
                                        {new Date(n.dueDate).toLocaleDateString('pt-BR')}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setActiveTab('bills');
                                          setIsNotificationsOpen(false);
                                        }}
                                        className="text-[10px] font-bold text-indigo-600 mt-2 hover:underline"
                                      >
                                        VER DETALHES
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-10 text-center text-slate-400">
                              <Bell className="w-10 h-10 mx-auto mb-2 opacity-10" />
                              <p className="text-sm">Nenhum alerta pendente</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
