
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  LayoutDashboard, Users, ShoppingCart, BarChart3, 
  UserCheck, Settings, LogOut, Menu, Dumbbell, 
  Package, UserCog, Bell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout, language, setLanguage } = useApp();
  const t = TRANSLATIONS[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'members', icon: Users, label: t.members },
    { id: 'pos', icon: ShoppingCart, label: t.pos },
    { id: 'inventory', icon: Package, label: t.inventory },
    { id: 'checkin', icon: UserCheck, label: t.checkin },
    { id: 'staff', icon: UserCog, label: t.staff },
    { id: 'reports', icon: BarChart3, label: t.reports },
  ];

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 bg-brand-black text-brand-text">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl border-r transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-brand-black to-brand-black
        border-brand-border
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative flex flex-col shadow-2xl
      `}>
        {/* Logo Section */}
        <div className="h-24 flex items-center justify-center border-b border-brand-border bg-brand-black">
          <div className="flex items-center gap-3">
             <div className="bg-brand-yellow p-2.5 rounded-xl shadow-[0_0_20px_rgba(255,235,59,0.3)]">
                <Dumbbell className="w-6 h-6 text-black" />
             </div>
             <div>
                <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase transform -skew-x-6">POWER PLUS</h1>
                <p className="text-[10px] text-brand-yellow tracking-[0.3em] font-bold uppercase text-center bg-white/5 rounded py-0.5 mt-0.5">GYM SYSTEM</p>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="mb-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Main Menu</div>
          {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentPage === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                 }}
                 className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden font-bold
                  ${isActive 
                    ? 'bg-gradient-to-r from-brand-yellow to-brand-highlight text-black shadow-[0_4px_16px_rgba(255,235,59,0.25)]' 
                    : 'text-gray-400 hover:bg-brand-surface hover:text-brand-yellow'}
                 `}
               >
                 <Icon size={22} className={isActive ? 'animate-bounce-slight' : 'group-hover:scale-110 transition-transform'} />
                 <span className="relative z-10">{item.label}</span>
                 {isActive && <div className="absolute right-4 w-2 h-2 rounded-full bg-black animate-pulse"></div>}
               </button>
             );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/30">
           <button 
             onClick={() => onNavigate('settings')} 
             className={`flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-brand-surface rounded-xl w-full transition-colors font-medium ${currentPage === 'settings' ? 'bg-brand-surface text-white' : ''}`}
           >
              <Settings size={22} />
              <span>{t.settings}</span>
           </button>
           <button onClick={logout} className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-900/10 rounded-xl w-full mt-1 transition-colors group font-bold">
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t.logout}</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden main-bg bg-brand-black">
        <div className="absolute inset-0 bg-brand-black/90 z-0 pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-20 bg-brand-black/80 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-6 z-40 relative">
           <div className="flex items-center gap-4">
             <button className="lg:hidden text-white p-2 hover:bg-brand-surface rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <Menu size={24} />
             </button>
             <h2 className="text-2xl font-black text-brand-yellow hidden md:block tracking-tight uppercase transform -skew-x-6">
               {menuItems.find(i => i.id === currentPage)?.label || t.settings}
             </h2>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <button className="relative p-2 text-gray-400 hover:text-brand-yellow transition-colors">
                 <Bell size={22} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-brand-yellow rounded-full animate-pulse shadow-[0_0_10px_#FFEB3B]"></span>
              </button>

              <button 
                onClick={() => setLanguage(language === 'EN' ? 'MM' : 'EN')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-surface hover:border-brand-yellow/50 transition-all group"
              >
                <span className="text-lg">{language === 'EN' ? '🇬🇧' : '🇲🇲'}</span>
                <span className="text-xs font-bold text-gray-300 group-hover:text-brand-yellow">{language}</span>
              </button>
              
              <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
                 <div className="text-right hidden md:block">
                   <p className="text-sm font-bold text-white leading-tight">{user?.username}</p>
                   <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">{user?.role}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-brand-yellow p-[2px] shadow-[0_0_15px_rgba(255,235,59,0.3)]">
                    <div className="w-full h-full rounded-full bg-brand-surface flex items-center justify-center overflow-hidden">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-brand-yellow">{user?.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scroll-smooth">
           <div className="max-w-[1600px] mx-auto h-full">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};
