import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_MEMBERSHIP_TYPES } from '../constants';
import { Search, UserPlus, Camera, Edit, Trash2, Phone, Calendar, User, X, Check, MapPin, Mail, CreditCard, CheckCircle, LayoutGrid, List } from 'lucide-react';
import { Member } from '../types';

export const Members: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, addTransaction, language } = useApp();
  const t = TRANSLATIONS[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Hidden file input ref for card photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // New/Edit Member Form State
  const initialFormState: Partial<Member> = {
    fullNameEN: '',
    fullNameMM: '',
    phone: '',
    membershipTypeId: '2', // Default 1 Month
    gender: 'Male',
    photoUrl: '',
    address: '',
    email: ''
  };
  const [formData, setFormData] = useState<Partial<Member>>(initialFormState);

  // Helper: Calculate Status
  const isMemberActive = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  };

  // Filter Logic
  const filteredMembers = members.filter(m => {
    const isActive = isMemberActive(m.endDate);
    const statusMatch = 
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? isActive :
      !isActive; // Inactive

    const searchLower = searchTerm.toLowerCase();
    const searchMatch = 
      m.fullNameEN.toLowerCase().includes(searchLower) ||
      (m.fullNameMM && m.fullNameMM.includes(searchLower)) ||
      m.phone.includes(searchLower) ||
      m.memberId.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

  // Handlers
  const handlePhotoClick = (memberId: string) => {
    setUploadTargetId(memberId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTargetId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateMember(uploadTargetId, { photoUrl: base64String });
        setUploadTargetId(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const type = MOCK_MEMBERSHIP_TYPES.find(t => t.id === formData.membershipTypeId);
    if (!type) return;

    const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + type.durationDays);

    if (formData.id) {
      // Edit
      updateMember(formData.id, {
        ...formData,
        endDate: endDate.toISOString().split('T')[0]
      });
    } else {
      // Add
      const newMember: Member = {
        id: Date.now().toString(),
        memberId: `GM00${members.length + 1}`,
        fullNameEN: formData.fullNameEN || '',
        fullNameMM: formData.fullNameMM || '',
        phone: formData.phone || '',
        photoUrl: formData.photoUrl || '',
        membershipTypeId: formData.membershipTypeId!,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'Active',
        joinDate: startDate.toISOString().split('T')[0],
        gender: formData.gender as any || 'Male',
        address: formData.address,
        email: formData.email
      };
      
      addMember(newMember);
      
      // Auto-create initial transaction
      addTransaction({
        id: Date.now().toString(),
        invoiceNumber: `INV-${Date.now()}`,
        type: 'Membership',
        items: [{ name: type.nameEN, quantity: 1, price: type.price, type: 'Membership' }],
        subtotal: type.price,
        discount: 0,
        total: type.price,
        paymentMethod: 'Cash',
        date: new Date().toISOString(),
        processedBy: 'Admin',
        memberId: newMember.id,
        memberName: newMember.fullNameEN
      });
    }
    closeModal();
  };

  const openEditModal = (member: Member) => {
    setFormData(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const handleFormImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Hidden File Input for Card Uploads */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Top Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Search */}
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search members..."
            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Filter Buttons */}
          <div className="flex bg-dark-900 p-1 rounded-xl border border-white/10 overflow-hidden">
            {(['All', 'Active', 'Inactive'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === filter 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-dark-900 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>

          {/* Add Member Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={20} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        {viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => {
              const active = isMemberActive(member.endDate);
              const planName = MOCK_MEMBERSHIP_TYPES.find(t => t.id === member.membershipTypeId)?.nameEN || 'Unknown';
              
              return (
                <div key={member.id} className="glass-panel p-6 rounded-2xl relative group hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center text-center animate-fade-in">
                  <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {active ? 'Active' : 'Inactive'}
                  </div>

                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 bg-dark-900 shadow-xl overflow-hidden">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.fullNameEN} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                          <User size={40} />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handlePhotoClick(member.id)}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-colors border-2 border-dark-900"
                      title="Change Photo"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{member.fullNameEN}</h3>
                  {member.fullNameMM && <p className="text-sm text-gray-400 font-sans mb-1">{member.fullNameMM}</p>}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Phone size={12} />
                    <span>{member.phone}</span>
                  </div>

                  <div className="w-full bg-dark-900/50 rounded-xl p-3 border border-white/5 mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Plan</span>
                      <span className="text-blue-400 font-bold">{planName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Join Date</span>
                      <span className="text-gray-300">{member.joinDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Expires</span>
                      <span className={`font-bold ${active ? 'text-green-500' : 'text-red-500'}`}>{member.endDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => openEditModal(member)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 border border-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => setDeleteId(member.id)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-dark-900/50 border border-white/5 rounded-2xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Join Date</th>
                    <th className="p-4">Expiry</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredMembers.map(member => {
                    const active = isMemberActive(member.endDate);
                    const planName = MOCK_MEMBERSHIP_TYPES.find(t => t.id === member.membershipTypeId)?.nameEN || 'Unknown';
                    
                    return (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="relative group/photo cursor-pointer flex-shrink-0" onClick={() => handlePhotoClick(member.id)}>
                                <div className="w-10 h-10 rounded-full border border-white/10 bg-black overflow-hidden">
                                  {member.photoUrl ? (
                                    <img src={member.photoUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={16}/></div>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                  <Camera size={12} className="text-white"/>
                                </div>
                             </div>
                             <div>
                               <div className="font-bold text-white">{member.fullNameEN}</div>
                               <div className="text-xs text-gray-500">{member.memberId}</div>
                             </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{member.phone}</td>
                        <td className="p-4 text-blue-400 font-medium">{planName}</td>
                        <td className="p-4 text-gray-400">{member.joinDate}</td>
                        <td className="p-4 font-mono">{member.endDate}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {active ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(member)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteId(member.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center animate-scale-up">
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                 <Trash2 size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Delete Member?</h3>
             <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
             <div className="flex gap-3">
                 <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20">Cancel</button>
                 <button 
                    onClick={() => { if(deleteId) deleteMember(deleteId); setDeleteId(null); }} 
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold"
                 >
                   Delete
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">{formData.id ? 'Edit Member Details' : 'New Member Registration'}</h2>
                <p className="text-sm text-gray-400">Fill in the information below</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Photo Section */}
                <div className="lg:w-1/3 flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-6">
                    <div className="w-48 h-48 rounded-full bg-dark-950 border-4 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="text-gray-500 text-center">
                          <Camera size={40} className="mx-auto mb-2 opacity-50" />
                          <span className="text-sm font-medium">Upload Photo</span>
                        </div>
                      )}
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={32} className="text-white" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleFormImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  
                  <div className="text-center w-full">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Member ID</div>
                    <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 font-mono text-blue-400 font-bold">
                      {formData.id ? formData.memberId : 'AUTO-GENERATED'}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="lg:w-2/3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Full Name (English)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input required value={formData.fullNameEN} onChange={e => setFormData({...formData, fullNameEN: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Full Name (Myanmar)</label>
                      <input value={formData.fullNameMM} onChange={e => setFormData({...formData, fullNameMM: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none font-sans" placeholder="မောင်မောင်" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="09xxxxxxxxx" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none" placeholder="email@example.com" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3 text-gray-500" size={16}/>
                       <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none resize-none h-24" placeholder="Enter address..." />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-blue-500 font-bold mb-4 flex items-center gap-2">
                      <CreditCard size={18}/> Membership Plan
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {MOCK_MEMBERSHIP_TYPES.map(t => (
                        <button 
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({...formData, membershipTypeId: t.id})}
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                            formData.membershipTypeId === t.id 
                            ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10' 
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <div className="font-bold text-sm relative z-10">{t.nameEN}</div>
                          <div className="text-xs opacity-70 relative z-10">{t.price.toLocaleString()} Ks</div>
                          {formData.membershipTypeId === t.id && (
                            <div className="absolute top-2 right-2 text-blue-500">
                              <CheckCircle size={14} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-3 rounded-xl hover:bg-white/10 text-white transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={handleFormSubmit} 
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all transform active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Check size={18} />
                {formData.id ? 'Save Changes' : 'Register Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};