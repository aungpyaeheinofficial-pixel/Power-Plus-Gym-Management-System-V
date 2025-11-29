
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Save, Store, CreditCard, Database, RotateCcw, Plus, Trash2, Edit, AlertTriangle, Download, Upload, Check } from 'lucide-react';
import { MembershipType } from '../types';

interface SettingsProps {
  onNavigate?: (page: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { language, membershipTypes, addMembershipType, updateMembershipType, deleteMembershipType, resetSystem, exportBackup, restoreBackup } = useApp();
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'General' | 'Packages' | 'System'>('General');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // General Settings State
  const [gymInfo, setGymInfo] = useState({
      name: 'Power Plus Gym',
      address: '123 Main Street, Yangon',
      phone: '09-123456789'
  });

  // Membership Editing State
  const [editingPlan, setEditingPlan] = useState<MembershipType | null>(null);
  
  // Clear Data Modal State
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleUpdatePlan = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPlan) return;
      if (membershipTypes.some(m => m.id === editingPlan.id)) {
          updateMembershipType(editingPlan.id, editingPlan);
      } else {
          addMembershipType(editingPlan);
      }
      setEditingPlan(null);
  };

  const handleAddNewPlan = () => {
      setEditingPlan({
          id: Date.now().toString(),
          nameEN: '',
          nameMM: '',
          durationDays: 30,
          price: 0,
          isActive: true,
          colorCode: '#FFD700'
      });
  };

  const handleResetDemo = () => {
       if (window.confirm("This will erase current data and load demo data. Continue?")) {
          resetSystem('Demo');
          alert("Demo data loaded!");
      }
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (window.confirm("Restore from backup? Current data will be overwritten.")) {
              restoreBackup(file);
              alert("Restored successfully!");
          }
      }
  };

  // Clear Data Flow
  const initiateClearData = () => {
      setShowClearDialog(true);
  };

  const handleClearAllData = () => {
      resetSystem('Clear');
      setShowClearDialog(false);
      alert(language === 'MM' ? 'ဒေတာအားလုံးရှင်းပြီးပါပြီ' : '✓ All data cleared successfully');
      if (onNavigate) {
          onNavigate('dashboard');
      }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">{language === 'MM' ? 'စနစ်အပြင်အဆင်' : 'System Settings'}</h1>
                <p className="text-gray-400 text-sm">Configure your gym, manage plans, and system data.</p>
            </div>
            
            <div className="bg-dark-900 border border-white/10 p-1 rounded-xl flex">
                {(['General', 'Packages', 'System'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === 'General' && (
            <div className="glass-panel p-8 rounded-2xl animate-fade-in border-t-4 border-gold-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500">
                        <Store size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Gym Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Gym Name</label>
                        <input 
                            type="text" 
                            value={gymInfo.name} 
                            onChange={e => setGymInfo({...gymInfo, name: e.target.value})}
                            className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Phone Contact</label>
                        <input 
                            type="text" 
                            value={gymInfo.phone} 
                            onChange={e => setGymInfo({...gymInfo, phone: e.target.value})}
                            className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-400 text-sm mb-2">Address</label>
                        <textarea 
                            value={gymInfo.address} 
                            onChange={e => setGymInfo({...gymInfo, address: e.target.value})}
                            className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none h-24 resize-none"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="flex items-center gap-2 bg-gold-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-gold-400 transition-colors">
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'Packages' && (
            <div className="space-y-6 animate-fade-in">
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Membership Packages</h3>
                                <p className="text-gray-400 text-xs">Manage your pricing plans</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAddNewPlan}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors border border-white/10"
                        >
                            <Plus size={18} />
                            Add Plan
                        </button>
                    </div>

                    <div className="space-y-3">
                        {membershipTypes.map(plan => (
                            <div key={plan.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: plan.colorCode }}></div>
                                    <div>
                                        <h4 className="font-bold text-white">{plan.nameEN}</h4>
                                        <p className="text-xs text-gray-400">{plan.nameMM} • {plan.durationDays} Days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="font-mono text-gold-500 font-bold">{plan.price.toLocaleString()} Ks</span>
                                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingPlan(plan)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit size={16} /></button>
                                        <button onClick={() => deleteMembershipType(plan.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edit/Add Modal for Plans */}
                {editingPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-dark-900 border border-white/10 w-full max-w-md rounded-2xl p-6 animate-scale-up">
                            <h3 className="font-bold text-xl text-white mb-4">{editingPlan.id.length > 10 ? 'New Package' : 'Edit Package'}</h3>
                            <form onSubmit={handleUpdatePlan} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Name (English)</label>
                                    <input required value={editingPlan.nameEN} onChange={e => setEditingPlan({...editingPlan, nameEN: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Name (Myanmar)</label>
                                    <input value={editingPlan.nameMM} onChange={e => setEditingPlan({...editingPlan, nameMM: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none font-sans" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Price (Ks)</label>
                                        <input type="number" required value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Duration (Days)</label>
                                        <input type="number" required value={editingPlan.durationDays} onChange={e => setEditingPlan({...editingPlan, durationDays: Number(e.target.value)})} className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Color Code</label>
                                    <div className="flex gap-2">
                                        {['#FFD700', '#3b82f6', '#22c55e', '#ef4444', '#ec4899', '#a855f7'].map(c => (
                                            <button 
                                                key={c}
                                                type="button"
                                                onClick={() => setEditingPlan({...editingPlan, colorCode: c})}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${editingPlan.colorCode === c ? 'border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-colors">Save Plan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'System' && (
             <div className="space-y-6">
                {/* Backup & Restore */}
                <div className="glass-panel p-8 rounded-2xl animate-fade-in border-t-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Backup & Restore</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={exportBackup} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-colors flex items-center justify-between group">
                            <div>
                                <h4 className="font-bold text-white mb-1">Export Backup</h4>
                                <p className="text-xs text-gray-400">Download JSON file</p>
                            </div>
                            <Download className="text-gray-500 group-hover:text-gold-500 transition-colors" />
                        </button>

                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".json" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleRestore}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-colors flex items-center justify-between group">
                                <div>
                                    <h4 className="font-bold text-white mb-1">Restore Data</h4>
                                    <p className="text-xs text-gray-400">Upload JSON file</p>
                                </div>
                                <Upload className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-panel p-8 rounded-2xl animate-fade-in border-t-4 border-red-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Danger Zone</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-red-500/10">
                            <div>
                                <h4 className="font-bold text-white">Reset to Demo Data</h4>
                                <p className="text-xs text-gray-400">Useful for testing functionality</p>
                            </div>
                            <button onClick={handleResetDemo} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
                                <RotateCcw size={16} /> Load Demo
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                            <div>
                                <h4 className="font-bold text-red-400">{language === 'MM' ? 'ဒေတာအားလုံးရှင်းလင်းမည်' : 'Clear All Data'}</h4>
                                <p className="text-xs text-red-400/70">Permanently delete everything</p>
                            </div>
                            <button onClick={initiateClearData} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center gap-2 font-bold">
                                <Trash2 size={16} /> {language === 'MM' ? 'ဒေတာအားလုံးရှင်းလင်းမည်' : 'Clear All Data'}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* Clear Data Confirmation Dialog */}
        {showClearDialog && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-dark-900 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center animate-scale-up shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                        {language === 'MM' ? '⚠️ ဒေတာအားလုံးရှင်းလင်းမည်?' : '⚠️ Clear All Data?'}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-6">
                        {language === 'MM' 
                            ? 'စနစ်မှ ဒေတာအားလုံးကို ဖျက်ပစ်မည်မှာ သေချာပါသလား?' 
                            : 'Are you sure you want to delete all data from the system?'
                        }
                    </p>

                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 mb-6 text-left">
                        <p className="text-gray-300 text-sm mb-3 font-bold">This will permanently remove:</p>
                        <ul className="text-sm text-gray-400 space-y-2">
                            <li className="flex items-center gap-2"><Check size={14} className="text-red-500"/> All Members</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-red-500"/> All Products (Inventory)</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-red-500"/> All Staff Records</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-red-500"/> All Attendance Records</li>
                        </ul>
                    </div>

                    <p className="text-red-500 font-bold mb-8 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                        <AlertTriangle size={16} />
                        {language === 'MM' ? 'ပြန်ပြင်၍မရပါ' : 'This action cannot be undone!'}
                    </p>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowClearDialog(false)} 
                            className="flex-1 py-4 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-bold transition-colors"
                        >
                            {language === 'MM' ? 'မဖျက်ပါ' : 'Cancel'}
                        </button>
                        <button 
                            onClick={handleClearAllData} 
                            className="flex-1 py-4 rounded-xl bg-red-600 text-white hover:bg-red-500 font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            {language === 'MM' ? 'အားလုံးဖျက်မည်' : 'Delete Everything'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
