
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
    <div className="flex h-screen w-full bg-dark-950 text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-dark-900/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative flex flex-col
      `}>
        {/* Logo Section */}
        <div className="h-24 flex items-center justify-center border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
             <div className="bg-gold-500 p-2 rounded-lg shadow-[0_0_15px_rgba(255,193,7,0.4)]">
                <Dumbbell className="w-6 h-6 text-black" />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-wider text-white">POWER PLUS</h1>
                <p className="text-[10px] text-gold-500 tracking-[0.2em] font-semibold">GYM SYSTEM</p>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                 className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gold-500 text-black font-bold shadow-[0_0_20px_rgba(255,193,7,0.2)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                 `}
               >
                 <Icon size={22} className={isActive ? 'animate-bounce-slight' : 'group-hover:scale-110 transition-transform'} />
                 <span className="relative z-10">{item.label}</span>
                 {isActive && <div className="absolute inset-0 bg-white/20 blur-xl"></div>}
               </button>
             );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button 
             onClick={() => onNavigate('settings')} 
             className={`flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl w-full transition-colors ${currentPage === 'settings' ? 'bg-white/10 text-white' : ''}`}
           >
              <Settings size={22} />
              <span>{t.settings}</span>
           </button>
           <button onClick={logout} className="flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl w-full mt-1 transition-colors group">
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t.logout}</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="absolute inset-0 bg-dark-950/95 z-0"></div>
        
        {/* Header */}
        <header className="h-20 bg-dark-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-40 relative">
           <div className="flex items-center gap-4">
             <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <Menu size={24} />
             </button>
             <h2 className="text-2xl font-bold text-white hidden md:block tracking-tight">
               {menuItems.find(i => i.id === currentPage)?.label || t.settings}
             </h2>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <button className="relative p-2 text-gray-400 hover:text-gold-500 transition-colors">
                 <Bell size={22} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="h-8 w-px bg-white/10 mx-1"></div>

              <button 
                onClick={() => setLanguage(language === 'EN' ? 'MM' : 'EN')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:border-gold-500/50 hover:bg-gold-500/10 transition-all group"
              >
                <span className="text-lg">{language === 'EN' ? '🇬🇧' : '🇲🇲'}</span>
                <span className="text-xs font-bold text-gray-300 group-hover:text-gold-400">{language}</span>
              </button>
              
              <div className="flex items-center gap-3 pl-2">
                 <div className="text-right hidden md:block">
                   <p className="text-sm font-bold text-white leading-tight">{user?.username}</p>
                   <p className="text-[10px] text-gold-500 font-bold uppercase tracking-wider">{user?.role}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 p-[2px] shadow-lg shadow-gold-500/20">
                    <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-gold-500">{user?.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scroll-smooth">
           <div className="max-w-7xl mx-auto h-full">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};
