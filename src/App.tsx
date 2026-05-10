import { useState, useEffect } from 'react';
import Shell from './components/Shell';
import Dashboard from './components/dashboard/Dashboard';
import BillList from './components/bills/BillList';
import CalendarView from './components/calendar/CalendarView';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('finepay_user');
    const token = localStorage.getItem('finepay_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data: any) => {
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('finepay_user');
    localStorage.removeItem('finepay_token');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Shell 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={logout}
    >
      <div className="min-h-screen">
        {activeTab === 'dashboard' && <Dashboard onAddBill={() => setActiveTab('bills')} />}
        {activeTab === 'bills' && <BillList />}
        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </Shell>
  );
}
