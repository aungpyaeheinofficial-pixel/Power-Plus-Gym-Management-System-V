
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { StaffPage } from './pages/Staff';
import { CheckInPage } from './pages/CheckIn';
import { ReportsPage } from './pages/Reports';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <Members />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'staff': return <StaffPage />;
      case 'checkin': return <CheckInPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <Settings onNavigate={setCurrentPage} />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
      <style>{`
        /* Global Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-right {
           from { opacity: 0; transform: translateX(20px); }
           to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
      `}</style>
    </AppProvider>
  );
};

export default App;
