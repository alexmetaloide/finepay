import { useState, useEffect } from 'react';
import Shell from './components/Shell';
import Dashboard from './components/dashboard/Dashboard';
import BillList from './components/bills/BillList';
import CalendarView from './components/calendar/CalendarView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Shell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="min-h-screen">
        {activeTab === 'dashboard' && <Dashboard onAddBill={() => setActiveTab('bills')} />}
        {activeTab === 'bills' && <BillList />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </Shell>
  );
}
