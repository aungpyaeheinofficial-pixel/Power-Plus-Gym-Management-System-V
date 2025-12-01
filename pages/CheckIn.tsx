
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Search, UserCheck, QrCode, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Member } from '../types';

export const CheckInPage: React.FC = () => {
  const { members, addCheckIn, checkIns, language } = useApp();
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [lastSuccess, setLastSuccess] = useState<Member | null>(null);

  // Search Logic
  const matchingMembers = searchQuery.length > 1 
      ? members.filter(m => 
          m.fullNameEN.toLowerCase().includes(searchQuery.toLowerCase()) || 
          m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery)
        ).slice(0, 5)
      : [];

  const handleSelectMember = (m: Member) => {
      setSelectedMember(m);
      setSearchQuery('');
  };

  const processCheckIn = () => {
      if (selectedMember) {
          addCheckIn({
              id: Date.now().toString(),
              memberId: selectedMember.id,
              checkInTime: new Date().toISOString(),
              method: 'Manual'
          });
          setLastSuccess(selectedMember);
          setSelectedMember(null);
          setTimeout(() => setLastSuccess(null), 3000);
      }
  };

  const getDaysRemaining = (end: string) => {
      const diff = new Date(end).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Main Check-In Area */}
        <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-3xl border-2 border-white/5 relative overflow-visible min-h-[500px]">
                {/* Search Bar */}
                <div className="relative z-20 mb-10">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Member Check-in</h2>
                    <div className="relative max-w-lg mx-auto">
                        <input 
                            type="text" 
                            placeholder="Search by Name, ID, or Phone..."
                            className="w-full bg-dark-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none shadow-xl"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
                        
                        {/* Dropdown Results */}
                        {matchingMembers.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                                {matchingMembers.map(m => (
                                    <div 
                                        key={m.id}
                                        onClick={() => handleSelectMember(m)}
                                        className="p-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                    >
                                        <img src={m.photoUrl} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-white text-sm">{m.fullNameEN}</p>
                                            <p className="text-xs text-gold-500">{m.memberId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Member Verification Card */}
                {selectedMember ? (
                    <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 text-center animate-scale-up relative">
                        <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><XCircle size={24}/></button>
                        
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-gold-400 to-gold-600 mx-auto mb-4">
                            <img src={selectedMember.photoUrl} className="w-full h-full rounded-full object-cover border-4 border-dark-900" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedMember.fullNameEN}</h2>
                        <p className="text-gold-500 font-bold mb-6">{selectedMember.memberId}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/30 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                <p className={`font-bold ${getDaysRemaining(selectedMember.endDate) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {getDaysRemaining(selectedMember.endDate) < 0 ? 'Expired' : 'Active'}
                                </p>
                            </div>
                            <div className="bg-black/30 p-3 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase">Days Left</p>
                                <p className="font-bold text-white">{getDaysRemaining(selectedMember.endDate)} Days</p>
                            </div>
                        </div>

                        {getDaysRemaining(selectedMember.endDate) < 0 ? (
                            <button className="w-full bg-red-500/20 text-red-500 font-bold py-4 rounded-xl cursor-not-allowed border border-red-500/50">
                                Membership Expired
                            </button>
                        ) : (
                            <button onClick={processCheckIn} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2">
                                <UserCheck size={24} /> Confirm Check-In
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center mt-20 opacity-30">
                        <QrCode size={64} className="mx-auto mb-4" />
                        <p>Search member or scan QR to check in</p>
                    </div>
                )}
                
                {/* Success Overlay */}
                {lastSuccess && (
                    <div className="absolute inset-0 bg-dark-950/90 backdrop-blur flex items-center justify-center z-50 animate-fade-in">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                                <CheckCircle size={48} className="text-black" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
                            <p className="text-xl text-gold-500">{lastSuccess.fullNameEN}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Stats & Logs */}
        <div className="space-y-6 flex flex-col h-full">
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-gold-500"/> Today's Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-white">{checkIns.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Total Visits</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-gold-500">12</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Current</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col min-h-0">
                <h3 className="font-bold text-white mb-4">Recent Log</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {checkIns.slice().reverse().map((c, i) => {
                         const m = members.find(mem => mem.id === c.memberId);
                         return (
                            <div key={i} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0">
                                <img src={m?.photoUrl} className="w-10 h-10 rounded-full bg-white/10 object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-white truncate">{m?.fullNameEN}</p>
                                    <p className="text-xs text-gray-500">{new Date(c.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">In</span>
                            </div>
                         );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};
