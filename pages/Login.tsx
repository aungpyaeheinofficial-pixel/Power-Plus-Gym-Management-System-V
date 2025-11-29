
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
    <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-fade-in-up">
           <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,193,7,0.4)]">
                 <Dumbbell className="w-10 h-10 text-black" />
              </div>
           </div>

           <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-white tracking-tight">{t.loginTitle}</h1>
             <p className="text-gold-500 font-medium tracking-widest text-sm mt-1 uppercase">{t.loginSubtitle}</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5">
             <div>
                <input 
                  type="text" 
                  placeholder={t.username}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
             </div>
             <div>
                <input 
                  type="password" 
                  placeholder={t.password}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
                />
             </div>

             <div className="flex items-center justify-between text-sm text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="accent-gold-500 w-4 h-4 rounded" />
                   Remember me
                </label>
                <a href="#" className="hover:text-gold-500 transition-colors">Forgot Password?</a>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <>
                   {t.loginBtn} <ArrowRight size={20} />
                 </>
               )}
             </button>
           </form>

           <div className="mt-8 flex justify-center">
             <button 
                onClick={() => setLanguage(language === 'EN' ? 'MM' : 'EN')}
                className="text-gray-500 hover:text-white text-sm font-medium transition-colors"
             >
               Switch to {language === 'EN' ? 'Myanmar' : 'English'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
