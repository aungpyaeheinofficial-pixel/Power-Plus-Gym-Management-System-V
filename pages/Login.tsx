import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Dumbbell, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, language, setLanguage } = useApp();
  const t = TRANSLATIONS[language];
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({ 
        id: '1', 
        username: username || 'Admin', 
        role: 'admin',
        fullName: 'Administrator'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-brand-black font-sans transition-colors duration-300">
      {/* Dynamic Background with Yellow Accent */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 dark:opacity-20 grayscale"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 dark:from-brand-black dark:via-brand-black/90 dark:to-brand-black/40"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-yellow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-yellow/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="premium-card p-10 rounded-3xl border border-gray-200 dark:border-brand-yellow/20 shadow-2xl backdrop-blur-xl animate-fade-in-up bg-white/80 dark:bg-brand-black/50">
           <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-brand-yellow/20 blur-xl rounded-full transform scale-150"></div>
              <div className="w-24 h-24 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,235,59,0.4)] relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                 <Dumbbell className="w-12 h-12 text-black" />
              </div>
           </div>

           <div className="text-center mb-10">
             <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase italic transform -skew-x-6">{t.loginTitle}</h1>
             <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-[2px] w-8 bg-brand-yellow"></div>
                <p className="text-brand-yellow font-bold tracking-[0.2em] text-xs uppercase">{t.loginSubtitle}</p>
                <div className="h-[2px] w-8 bg-brand-yellow"></div>
             </div>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
             <div className="group">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block group-focus-within:text-brand-yellow transition-colors">{t.username}</label>
                <input 
                  type="text" 
                  className="w-full bg-white dark:bg-black/60 border-2 border-gray-200 dark:border-brand-border rounded-xl px-4 py-4 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-yellow focus:ring-0 outline-none transition-all font-medium text-lg shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
             </div>
             <div className="group">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block group-focus-within:text-brand-yellow transition-colors">{t.password}</label>
                <input 
                  type="password" 
                  className="w-full bg-white dark:bg-black/60 border-2 border-gray-200 dark:border-brand-border rounded-xl px-4 py-4 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-yellow focus:ring-0 outline-none transition-all font-medium text-lg shadow-sm"
                  placeholder="••••••••"
                />
             </div>

             <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2">
                <label className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
                   <input type="checkbox" className="accent-brand-yellow w-4 h-4 rounded border-gray-300 dark:border-brand-border bg-white dark:bg-black" />
                   <span className="font-medium">Remember me</span>
                </label>
                <a href="#" className="hover:text-brand-yellow transition-colors font-bold">Forgot Password?</a>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <>
                   <span className="text-lg uppercase tracking-wide">{t.loginBtn}</span> 
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
           </form>

           <div className="mt-8 flex justify-center border-t border-gray-200 dark:border-white/5 pt-6">
             <button 
                onClick={() => setLanguage(language === 'EN' ? 'MM' : 'EN')}
                className="text-gray-500 hover:text-brand-yellow text-sm font-bold transition-colors flex items-center gap-2"
             >
                <span>{language === 'EN' ? '🇺🇸' : '🇲🇲'}</span>
                Switch to {language === 'EN' ? 'Myanmar' : 'English'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};