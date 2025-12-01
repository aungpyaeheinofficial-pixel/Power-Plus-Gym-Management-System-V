
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  Search, Plus, UserCog, Calendar, Clock, Phone, Mail, 
  CheckCircle, AlertCircle, LogIn, LogOut, LayoutGrid, List, 
  Camera, Edit, Trash2, X, Check, Image as ImageIcon, CalendarDays,
  Briefcase, Moon, Sun, Sunrise, Copy, AlertTriangle, Filter,
  PlayCircle, StopCircle, UserCheck
} from 'lucide-react';
import { Staff, Role, WeeklySchedule, DailySchedule, ShiftType } from '../types';

const STAFF_ROLES: Role[] = [
    'Head Trainer', 
    'Trainer', 
    'Manager', 
    'Receptionist', 
    'Cleaner', 
    'Maintenance', 
    'Security', 
    'Nutritionist'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS_MM: Record<string, string> = {
    monday: 'တနင်္လာ', tuesday: 'အင်္ဂါ', wednesday: 'ဗုဒ္ဓဟူး', thursday: 'ကြာသပတေး',
    friday: 'သောကြာ', saturday: 'စနေ', sunday: 'တနင်္ဂနွေ'
};

const DEFAULT_SCHEDULE: WeeklySchedule = DAYS.reduce((acc, day) => {
    acc[day] = { working: false, start: '', end: '', shift: 'Off' };
    return acc;
}, {} as WeeklySchedule);

const formatScheduleSummary = (schedule?: WeeklySchedule) => {
    if (!schedule) return 'No schedule set';
    
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Collect active days
    const activeDays = DAYS.map((d, i) => ({ day: d, index: i, ...schedule[d] })).filter(d => d.working);
    
    if (activeDays.length === 0) return 'Off Duty / No Schedule';
    
    // Group by start/end time
    const timeGroups: Record<string, number[]> = {};
    
    activeDays.forEach(d => {
        const timeKey = `${d.start}-${d.end}`;
        if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
        timeGroups[timeKey].push(d.index);
    });
    
    const parts: string[] = [];
    
    Object.entries(timeGroups).forEach(([timeKey, dayIndices]) => {
        const [start, end] = timeKey.split('-');
        
        // Format time
        const formatT = (t: string) => {
            if (!t) return '';
            const [h, m] = t.split(':').map(Number);
            const am = h < 12 ? 'AM' : 'PM';
            const h12 = h % 12 || 12;
            return `${h12}${m > 0 ? ':'+m : ''}${am}`;
        };
        
        const timeStr = `${formatT(start)}-${formatT(end)}`;
        
        // Format days (e.g. Mon-Fri)
        dayIndices.sort((a,b) => a-b);
        
        let dayStr = '';
        let rangeStart = dayIndices[0];
        let prev = dayIndices[0];
        const ranges: string[] = [];
        
        for (let i = 1; i <= dayIndices.length; i++) {
            const curr = dayIndices[i];
            if (curr !== prev + 1) {
                if (prev === rangeStart) {
                    ranges.push(shortDays[rangeStart]);
                } else {
                    ranges.push(`${shortDays[rangeStart]}-${shortDays[prev]}`);
                }
                rangeStart = curr;
            }
            prev = curr;
        }
        
        // Push last range
        if (prev === rangeStart) {
            ranges.push(shortDays[rangeStart]);
        } else {
            ranges.push(`${shortDays[rangeStart]}-${shortDays[prev]}`);
        }
        
        dayStr = ranges.join(', ');
        parts.push(`${dayStr}: ${timeStr}`);
    });
    
    return parts.join(' | ');
};

const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    
    // Handle overnight (e.g. 22:00 to 06:00)
    if (endMin <= startMin) {
        endMin += 24 * 60;
    }
    
    return (endMin - startMin) / 60;
};

export const StaffPage: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, staffAttendance, clockInStaff, clockOutStaff, language } = useApp();
  const t = TRANSLATIONS[language];
  
  // View State
  const [activeTab, setActiveTab] = useState<'Directory' | 'Schedule' | 'Attendance'>('Directory');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Attendance Filter State
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDateFrom, setAttendanceDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDateTo, setAttendanceDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('All');
  const [selectedStaffForClock, setSelectedStaffForClock] = useState<string>('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const initialFormState: Partial<Staff> = {
      name: '',
      role: 'Trainer',
      phone: '',
      email: '',
      schedule: '',
      photoUrl: '',
      status: 'Active',
      weeklySchedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE))
  };
  const [formData, setFormData] = useState<Partial<Staff>>(initialFormState);
  
  // Schedule Editing State
  const [editingScheduleStaffId, setEditingScheduleStaffId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);

  // File Inputs
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [targetStaffId, setTargetStaffId] = useState<string | null>(null);

  // Time state for Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Helpers for Duty Status ---
  const getCurrentDutyStatus = (schedule?: WeeklySchedule) => {
      if (!schedule) return 'Off Duty';
      
      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = schedule[dayName];
      
      if (!daySchedule || !daySchedule.working) return 'Off Duty';
      
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startH, startM] = daySchedule.start.split(':').map(Number);
      const [endH, endM] = daySchedule.end.split(':').map(Number);
      const startTime = startH * 60 + startM;
      let endTime = endH * 60 + endM;
      
      // Handle overnight shift (e.g. 22:00 to 06:00)
      if (endTime < startTime) {
          if (currentTime >= startTime) {
             // Currently in first part of night shift
          } else if (currentTime <= endTime) {
             // Currently in second part of night shift (next day morning)
             return 'On Duty';
          }
      }
      
      if (endTime < startTime) endTime += 24 * 60; // normalization for simple check if needed

      if (currentTime >= startTime && currentTime <= endTime) return 'On Duty';

      // Check if starting soon (within 1 hour)
      const diff = startTime - currentTime;
      if (diff > 0 && diff <= 60) return 'Starting Soon';
      
      return 'Off Duty';
  };

  const getShiftColor = (shift: ShiftType) => {
      switch(shift) {
          case 'Morning': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'Evening': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          case 'Night': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
          case 'Full': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
          default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      }
  };

  // --- Handlers ---

  const handleCardPhotoClick = (id: string) => {
      setTargetStaffId(id);
      cardFileInputRef.current?.click();
  };

  const handleCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && targetStaffId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateStaff(targetStaffId, { photoUrl: reader.result as string });
              setTargetStaffId(null);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; 
  };

  const handleModalPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result as string });
          reader.readAsDataURL(file);
      }
  };

  const openAddModal = () => {
      setFormData(initialFormState);
      setIsModalOpen(true);
  };

  const openEditModal = (staffMember: Staff) => {
      setFormData(staffMember);
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setFormData(initialFormState);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
      e.preventDefault();
      const staffData = {
          ...formData,
          schedule: formatScheduleSummary(formData.weeklySchedule)
      };

      if (formData.id) {
          updateStaff(formData.id, staffData);
      } else {
          addStaff({
              ...staffData as Staff,
              id: Date.now().toString(),
              staffId: `S0${staff.length + 1}`,
              joinDate: new Date().toISOString().split('T')[0],
          });
      }
      closeModal();
  };

  const confirmDelete = () => {
      if (deleteId) {
          deleteStaff(deleteId);
          setDeleteId(null);
      }
  };

  // Schedule Editor Logic
  const openScheduleEditor = (staffMember: Staff) => {
      setEditingScheduleStaffId(staffMember.id);
      setScheduleData(staffMember.weeklySchedule || JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)));
      setIsScheduleModalOpen(true);
  };

  const saveSchedule = () => {
      if (editingScheduleStaffId) {
          updateStaff(editingScheduleStaffId, { 
              weeklySchedule: scheduleData,
              schedule: formatScheduleSummary(scheduleData)
          });
          setIsScheduleModalOpen(false);
          setEditingScheduleStaffId(null);
      }
  };

  const updateDaySchedule = (day: string, field: keyof DailySchedule, value: any) => {
      setScheduleData(prev => {
          const updatedDay = { ...prev[day], [field]: value };
          
          if (field === 'working') {
              if (value === false) {
                  updatedDay.start = '';
                  updatedDay.end = '';
                  updatedDay.shift = 'Off';
              } else {
                  // Default to full day if checked
                  updatedDay.start = '09:00';
                  updatedDay.end = '17:00';
                  updatedDay.shift = 'Full';
              }
          }
          
          return { ...prev, [day]: updatedDay };
      });
  };
  
  const applyShiftPreset = (day: string, shift: ShiftType) => {
      let start = '', end = '';
      switch(shift) {
          case 'Morning': start='06:00'; end='14:00'; break;
          case 'Evening': start='14:00'; end='22:00'; break;
          case 'Night': start='22:00'; end='06:00'; break;
          case 'Full': start='08:00'; end='17:00'; break;
          case 'Off': start=''; end=''; break;
      }
      setScheduleData(prev => ({
          ...prev,
          [day]: { working: shift !== 'Off', start, end, shift }
      }));
  };

  const copyMondayToWeekdays = () => {
      const monday = scheduleData['monday'];
      setScheduleData(prev => ({
          ...prev,
          tuesday: { ...monday },
          wednesday: { ...monday },
          thursday: { ...monday },
          friday: { ...monday },
      }));
  };

  const totalWeeklyHours = DAYS.reduce((total, day) => {
      const s = scheduleData[day];
      if (s.working && s.start && s.end) {
          return total + calculateDuration(s.start, s.end);
      }
      return total;
  }, 0);

  // --- Attendance Logic & Filtering ---
  
  const filteredAttendance = staffAttendance.filter(record => {
      const s = staff.find(st => st.id === record.staffId);
      const matchName = s?.name.toLowerCase().includes(attendanceSearch.toLowerCase()) || false;
      
      const recordDate = record.date;
      const matchDate = recordDate >= attendanceDateFrom && recordDate <= attendanceDateTo;
      
      const matchStatus = attendanceStatusFilter === 'All' ? true : record.status === attendanceStatusFilter;

      return matchName && matchDate && matchStatus;
  });

  const currentlyWorkingStaff = staff.filter(s => {
      const record = staffAttendance.find(r => r.staffId === s.id && r.date === new Date().toISOString().split('T')[0]);
      return record && !record.clockOut;
  });

  const getActiveSession = (staffId: string) => {
      const today = new Date().toISOString().split('T')[0];
      return staffAttendance.find(r => r.staffId === staffId && !r.clockOut);
  };

  const handleClockIn = () => {
      if(!selectedStaffForClock) return;
      clockInStaff(selectedStaffForClock);
      setSelectedStaffForClock('');
  };

  const handleClockOut = () => {
      if(!selectedStaffForClock) return;
      clockOutStaff(selectedStaffForClock);
      setSelectedStaffForClock('');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Hidden File Input for Card Updates */}
        <input 
            type="file" 
            accept="image/*" 
            ref={cardFileInputRef} 
            className="hidden" 
            onChange={handleCardFileChange} 
        />

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserCog className="text-gold-500" />
                Staff Management
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'Directory' && (
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
                )}

                <div className="bg-dark-900 border border-white/10 rounded-xl p-1 flex">
                    {(['Directory', 'Schedule', 'Attendance'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Directory' && (
                    <button 
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add New Staff</span>
                    </button>
                )}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
            {activeTab === 'Directory' && (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {staff.map(s => {
                            const dutyStatus = getCurrentDutyStatus(s.weeklySchedule);
                            const dutyColor = dutyStatus === 'On Duty' ? 'bg-green-500' : dutyStatus === 'Starting Soon' ? 'bg-yellow-500' : 'bg-gray-500';
                            
                            return (
                                <div key={s.id} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative group hover:-translate-y-1 transition-transform duration-300 border-t border-white/5">
                                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                                        <span className={`w-2 h-2 rounded-full block ${dutyColor} ${dutyStatus === 'On Duty' ? 'animate-pulse' : ''}`}></span>
                                        <span className={`text-[10px] font-bold uppercase ${dutyStatus === 'On Duty' ? 'text-green-500' : 'text-gray-400'}`}>{dutyStatus}</span>
                                    </div>

                                    <div className="relative mb-4 group/photo">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-lg bg-black">
                                            {s.photoUrl ? (
                                                <img src={s.photoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                                                    <UserCog size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleCardPhotoClick(s.id)}
                                            className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition-transform hover:scale-110 shadow-lg border-2 border-dark-900"
                                            title="Change Photo"
                                        >
                                            <Camera size={14} />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-lg text-white mb-1">{s.name}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-4 bg-white/10 text-gray-300">
                                        {s.role}
                                    </span>
                                    
                                    <div className="w-full space-y-3 text-sm text-gray-400 border-t border-white/5 pt-4 bg-white/5 rounded-xl p-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <Phone size={14} className="text-gold-500"/>
                                            <span className="text-white">{s.phone}</span>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-2">
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <Clock size={14} className="text-blue-500 flex-shrink-0"/>
                                                <span className="text-xs text-left line-clamp-2 leading-relaxed">
                                                    {formatScheduleSummary(s.weeklySchedule)}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => openScheduleEditor(s)} 
                                                className="text-xs text-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg border border-blue-500/20 transition-colors mt-1 font-bold flex items-center justify-center gap-2"
                                            >
                                                <CalendarDays size={14} /> ချိန်ဇယားပြင်ဆင်ရန်
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full mt-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button 
                                            onClick={() => openEditModal(s)}
                                            className="flex-1 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 py-2 rounded-lg text-sm text-gray-400 border border-white/5 transition-colors flex items-center justify-center gap-2"
                                         >
                                            <Edit size={14} /> Edit
                                         </button>
                                         <button 
                                            onClick={() => setDeleteId(s.id)}
                                            className="flex-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 py-2 rounded-lg text-sm text-gray-400 border border-white/5 transition-colors flex items-center justify-center gap-2"
                                         >
                                            <Trash2 size={14} /> Delete
                                         </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-dark-900/50 border border-white/5 rounded-2xl overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Staff Member</th>
                                        <th className="p-4">Position</th>
                                        <th className="p-4">Contact Info</th>
                                        <th className="p-4">Schedule</th>
                                        <th className="p-4">Duty Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {staff.map(s => {
                                        const dutyStatus = getCurrentDutyStatus(s.weeklySchedule);
                                        const dutyColor = dutyStatus === 'On Duty' ? 'bg-green-500' : 'bg-gray-500';

                                        return (
                                            <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative group/photo cursor-pointer flex-shrink-0" onClick={() => handleCardPhotoClick(s.id)}>
                                                            <div className="w-10 h-10 rounded-full border border-white/10 bg-black overflow-hidden">
                                                                {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><UserCog size={20}/></div>}
                                                            </div>
                                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                                                <Camera size={12} className="text-white"/>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{s.name}</div>
                                                            <div className="text-xs text-gray-500">{s.staffId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide bg-white/10 text-gray-300">
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-white">{s.phone}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-xs text-gray-300 line-clamp-1 max-w-[200px]" title={formatScheduleSummary(s.weeklySchedule)}>
                                                            {formatScheduleSummary(s.weeklySchedule)}
                                                        </span>
                                                        <button onClick={() => openScheduleEditor(s)} className="text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                            <Edit size={10} /> Edit
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full block ${dutyColor} ${dutyStatus === 'On Duty' ? 'animate-pulse' : ''}`}></span>
                                                        <span className={`text-xs ${dutyStatus === 'On Duty' ? 'text-green-500' : 'text-gray-500'}`}>{dutyStatus}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditModal(s)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => setDeleteId(s.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30">
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
                )
            )}

            {activeTab === 'Schedule' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Duty Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
                             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-green-500" /> Who's On Duty
                             </h3>
                             <div className="space-y-3">
                                 {staff.filter(s => getCurrentDutyStatus(s.weeklySchedule) === 'On Duty').length > 0 ? (
                                     staff.filter(s => getCurrentDutyStatus(s.weeklySchedule) === 'On Duty').map(s => (
                                         <div key={s.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                             <img src={s.photoUrl} className="w-8 h-8 rounded-full object-cover" />
                                             <div>
                                                 <div className="font-bold text-white text-sm">{s.name}</div>
                                                 <div className="text-[10px] text-gray-400">{s.role}</div>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <p className="text-gray-500 text-sm italic">No one is currently on duty.</p>
                                 )}
                             </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-yellow-500">
                             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-yellow-500" /> Upcoming Shifts
                             </h3>
                             <div className="space-y-3">
                                {staff.filter(s => getCurrentDutyStatus(s.weeklySchedule) === 'Starting Soon').length > 0 ? (
                                     staff.filter(s => getCurrentDutyStatus(s.weeklySchedule) === 'Starting Soon').map(s => (
                                         <div key={s.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                             <img src={s.photoUrl} className="w-8 h-8 rounded-full object-cover" />
                                             <div>
                                                 <div className="font-bold text-white text-sm">{s.name}</div>
                                                 <div className="text-[10px] text-yellow-500">Starting within 1h</div>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <p className="text-gray-500 text-sm italic">No shifts starting soon.</p>
                                 )}
                             </div>
                        </div>

                         <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500 flex flex-col justify-center text-center">
                             <div className="text-4xl font-bold text-white mb-2">
                                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                             <p className="text-blue-400 font-bold uppercase tracking-wider">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</p>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-8 border-b border-white/10 min-w-[1000px]">
                            <div className="p-4 border-r border-white/10 bg-white/5 font-bold text-gray-400 text-center flex items-center justify-center sticky left-0 z-10">Staff Member</div>
                            {DAYS.map(day => (
                                <div key={day} className="p-4 border-r border-white/10 bg-white/5 font-bold text-gray-400 text-center uppercase tracking-wider last:border-0 text-xs">
                                    {day} <br/> <span className="text-[10px] opacity-50">{DAY_LABELS_MM[day]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                             {staff.map(s => (
                                <div key={s.id} className="grid grid-cols-8 border-b border-white/5 hover:bg-white/5 transition-colors min-w-[1000px]">
                                     <div className="p-4 border-r border-white/10 flex items-center gap-3 sticky left-0 bg-dark-900 z-10">
                                         <div className="w-8 h-8 rounded-full bg-black overflow-hidden border border-white/10">
                                            {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-500"><UserCog size={16}/></div>}
                                         </div>
                                         <span className="font-bold text-sm text-white truncate w-24">{s.name}</span>
                                     </div>
                                     {DAYS.map(day => {
                                         const sched = s.weeklySchedule?.[day];
                                         return (
                                            <div key={day} className="p-2 border-r border-white/10 min-h-[80px] last:border-0 relative flex flex-col justify-center items-center gap-1">
                                                {sched?.working ? (
                                                    <>
                                                        <div className={`w-full p-1 rounded-md border flex items-center justify-center gap-1 text-[10px] font-bold ${getShiftColor(sched.shift)}`}>
                                                            {sched.shift}
                                                        </div>
                                                        <div className="text-xs text-white font-mono">{sched.start} - {sched.end}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-gray-600 uppercase font-bold">Off</span>
                                                )}
                                            </div>
                                         );
                                     })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Attendance' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full animate-fade-in">
                    
                    {/* Left Panel: Controls */}
                    <div className="xl:col-span-1 space-y-6">
                         {/* Clock Control Card */}
                         <div className="glass-panel p-6 rounded-2xl border-t-4 border-gold-500">
                             <div className="text-center mb-6">
                                 <div className="text-3xl font-bold text-white font-mono tracking-widest mb-1">
                                    {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                 </div>
                                 <div className="text-sm text-gray-400 font-bold uppercase">{currentTime.toLocaleDateString('en-GB')}</div>
                             </div>

                             <div className="space-y-4">
                                 <div>
                                     <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Select Staff</label>
                                     <select 
                                        className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none"
                                        value={selectedStaffForClock}
                                        onChange={(e) => setSelectedStaffForClock(e.target.value)}
                                     >
                                         <option value="">-- Choose Staff --</option>
                                         {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                     </select>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                     <button 
                                        onClick={handleClockIn}
                                        disabled={!selectedStaffForClock || !!getActiveSession(selectedStaffForClock)}
                                        className="flex flex-col items-center justify-center p-4 bg-green-500 hover:bg-green-400 text-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 active:scale-95"
                                     >
                                         <PlayCircle size={28} className="mb-1" />
                                         <span className="font-bold text-sm">Clock In</span>
                                     </button>
                                     <button 
                                        onClick={handleClockOut}
                                        disabled={!selectedStaffForClock || !getActiveSession(selectedStaffForClock)}
                                        className="flex flex-col items-center justify-center p-4 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 active:scale-95"
                                     >
                                         <StopCircle size={28} className="mb-1" />
                                         <span className="font-bold text-sm">Clock Out</span>
                                     </button>
                                 </div>
                             </div>

                             {selectedStaffForClock && (
                                 <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                     {getActiveSession(selectedStaffForClock) ? (
                                         <p className="text-green-400 text-xs font-bold">Currently Clocked In since {new Date(getActiveSession(selectedStaffForClock)!.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                     ) : (
                                         <p className="text-gray-500 text-xs">Ready to start shift</p>
                                     )}
                                 </div>
                             )}
                         </div>

                         {/* Currently Working Widget */}
                         <div className="glass-panel p-6 rounded-2xl flex flex-col h-[300px]">
                             <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                 Currently Working
                             </h3>
                             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                 {currentlyWorkingStaff.length > 0 ? (
                                     currentlyWorkingStaff.map(s => {
                                         const session = getActiveSession(s.id);
                                         return (
                                             <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                 <img src={s.photoUrl} className="w-10 h-10 rounded-full object-cover bg-black" />
                                                 <div className="flex-1 min-w-0">
                                                     <div className="font-bold text-white text-sm truncate">{s.name}</div>
                                                     <div className="text-xs text-green-500 font-mono">In: {new Date(session!.clockIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                 </div>
                                             </div>
                                         );
                                     })
                                 ) : (
                                     <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                         <UserCheck size={32} className="mb-2 opacity-50" />
                                         <p className="text-xs">No active staff</p>
                                     </div>
                                 )}
                             </div>
                         </div>
                    </div>

                    {/* Right Panel: Attendance Table */}
                    <div className="xl:col-span-3 flex flex-col h-full gap-4">
                        {/* Filters */}
                        <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-end">
                             <div className="flex-1 min-w-[200px]">
                                 <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Date Range</label>
                                 <div className="flex items-center gap-2">
                                     <input type="date" value={attendanceDateFrom} onChange={e => setAttendanceDateFrom(e.target.value)} className="bg-dark-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none w-full" />
                                     <span className="text-gray-500">-</span>
                                     <input type="date" value={attendanceDateTo} onChange={e => setAttendanceDateTo(e.target.value)} className="bg-dark-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none w-full" />
                                 </div>
                             </div>
                             <div className="flex-1 min-w-[200px]">
                                 <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Search Staff</label>
                                 <div className="relative">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                     <input type="text" placeholder="Name..." value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} className="bg-dark-950 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm outline-none w-full" />
                                 </div>
                             </div>
                             <div className="w-[150px]">
                                 <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Status</label>
                                 <select value={attendanceStatusFilter} onChange={e => setAttendanceStatusFilter(e.target.value)} className="bg-dark-950 border border-white/10 rounded-lg p-2 text-white text-sm outline-none w-full">
                                     <option value="All">All Status</option>
                                     <option value="Working">Working</option>
                                     <option value="Completed">Completed</option>
                                     <option value="Late">Late</option>
                                 </select>
                             </div>
                        </div>

                        {/* Table */}
                        <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
                            <div className="overflow-auto flex-1 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold sticky top-0 bg-dark-900 z-10">
                                        <tr>
                                            <th className="p-4 w-16">Photo</th>
                                            <th className="p-4">Staff Name</th>
                                            <th className="p-4">Position</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Clock In</th>
                                            <th className="p-4">Clock Out</th>
                                            <th className="p-4">Hours</th>
                                            <th className="p-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredAttendance.length > 0 ? (
                                            filteredAttendance.sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()).map(record => {
                                                const s = staff.find(st => st.id === record.staffId);
                                                if (!s) return null;

                                                const statusColor = 
                                                    record.status === 'Working' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    record.status === 'Late' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    record.status === 'Completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20';
                                                
                                                return (
                                                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-4">
                                                            <img src={s.photoUrl} className="w-10 h-10 rounded-full object-cover bg-black border border-white/10" />
                                                        </td>
                                                        <td className="p-4 font-bold text-white">{s.name}</td>
                                                        <td className="p-4 text-gray-400 text-xs">{s.role}</td>
                                                        <td className="p-4 text-white font-mono">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                                                        <td className="p-4 text-white font-mono">{new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                                        <td className="p-4 text-gray-400 font-mono">
                                                            {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                                        </td>
                                                        <td className="p-4 font-bold text-gold-500 font-mono">
                                                            {record.totalDurationStr || '-'}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-gray-500 italic">No attendance records found matching filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- MODALS --- */}

        {/* 1. Add/Edit Staff Profile Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-dark-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-bold text-white">{formData.id ? 'Edit Staff Profile' : 'New Staff Member'}</h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveStaff} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div 
                            onClick={() => modalFileInputRef.current?.click()}
                            className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative ${formData.photoUrl ? 'border-blue-500 bg-black' : 'border-white/20 hover:border-blue-500 bg-white/5 hover:bg-white/10'}`}
                        >
                            {formData.photoUrl ? (
                                <>
                                    <img src={formData.photoUrl} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2"><Camera size={18} /> Change Photo</div></div>
                                </>
                            ) : (
                                <div className="text-center text-gray-400"><div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500"><ImageIcon size={32} /></div><p className="font-bold text-sm">Click to upload photo</p></div>
                            )}
                            <input type="file" accept="image/*" ref={modalFileInputRef} className="hidden" onChange={handleModalPhotoChange} />
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Staff Name (ဝန်ထမ်းအမည်)</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none" placeholder="John Doe" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Role (ရာထူး)</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none appearance-none">{STAFF_ROLES.map(r => (<option key={r} value={r} className="bg-dark-900">{r}</option>))}</select></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Phone (ဖုန်းနံပါတ်)</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none" placeholder="09..." /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Email (အီးမေးလ်)</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-dark-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none" placeholder="Optional" /></div>
                        </div>
                    </form>

                    <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                        <button onClick={closeModal} className="px-6 py-3 rounded-xl hover:bg-white/10 text-white transition-colors font-medium">Cancel</button>
                        <button onClick={handleSaveStaff} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"><Check size={18} /> Save</button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. Detailed Schedule Editor Modal */}
        {isScheduleModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-dark-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden animate-slide-up flex flex-col h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black">
                                <img src={staff.find(s=>s.id === editingScheduleStaffId)?.photoUrl} className="w-full h-full object-cover"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{staff.find(s=>s.id === editingScheduleStaffId)?.name} - {staff.find(s=>s.id === editingScheduleStaffId)?.role}</h2>
                                <p className="text-sm text-gold-500 font-sans">အချိန်ဇယားပြင်ဆင်ခြင်း</p>
                            </div>
                        </div>
                        <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Schedule Table */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <button 
                                onClick={copyMondayToWeekdays}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-white/5"
                            >
                                <Copy size={14} /> အချိန်ဇယားကူးယူရန် (Copy Mon to Weekdays)
                            </button>
                        </div>
                        <div className="bg-dark-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                             <table className="w-full text-left">
                                 <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold">
                                     <tr>
                                         <th className="p-4 w-32 border-r border-white/10">ရက် (Day)</th>
                                         <th className="p-4 w-24 text-center border-r border-white/10">အလုပ်ဝင်</th>
                                         <th className="p-4 w-40 border-r border-white/10">စတင်ချိန် (Start)</th>
                                         <th className="p-4 w-40 border-r border-white/10">ပြီးဆုံးချိန် (End)</th>
                                         <th className="p-4">Presets</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                     {DAYS.map(day => {
                                         const sched = scheduleData[day];
                                         const hasTimeError = sched.working && (!sched.start || !sched.end);
                                         
                                         return (
                                             <tr key={day} className={`hover:bg-white/5 transition-colors ${!sched.working ? 'bg-black/20' : ''}`}>
                                                 <td className="p-4 border-r border-white/10">
                                                     <div className="font-bold text-white capitalize">{DAY_LABELS_MM[day]}</div>
                                                     <div className="text-xs text-gray-500">{day}</div>
                                                 </td>
                                                 <td className="p-4 text-center border-r border-white/10">
                                                     <label className="relative inline-flex items-center cursor-pointer">
                                                         <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            checked={sched.working}
                                                            onChange={e => updateDaySchedule(day, 'working', e.target.checked)}
                                                         />
                                                         <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                     </label>
                                                 </td>
                                                 <td className="p-4 border-r border-white/10">
                                                     <input 
                                                        type="time" 
                                                        disabled={!sched.working}
                                                        value={sched.start}
                                                        onChange={e => updateDaySchedule(day, 'start', e.target.value)}
                                                        className={`bg-dark-900 border rounded-lg p-2.5 text-white w-full text-center font-mono disabled:opacity-30 disabled:bg-gray-800 disabled:cursor-not-allowed transition-all ${hasTimeError ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                                     />
                                                 </td>
                                                 <td className="p-4 border-r border-white/10">
                                                     <input 
                                                        type="time" 
                                                        disabled={!sched.working}
                                                        value={sched.end}
                                                        onChange={e => updateDaySchedule(day, 'end', e.target.value)}
                                                        className={`bg-dark-900 border rounded-lg p-2.5 text-white w-full text-center font-mono disabled:opacity-30 disabled:bg-gray-800 disabled:cursor-not-allowed transition-all ${hasTimeError ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                                     />
                                                 </td>
                                                 <td className="p-4">
                                                     {sched.working ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => applyShiftPreset(day, 'Morning')} className="px-3 py-1 bg-white/5 hover:bg-green-500/20 hover:text-green-500 text-xs rounded border border-white/10 transition-colors">Morning</button>
                                                            <button onClick={() => applyShiftPreset(day, 'Evening')} className="px-3 py-1 bg-white/5 hover:bg-blue-500/20 hover:text-blue-500 text-xs rounded border border-white/10 transition-colors">Evening</button>
                                                            <button onClick={() => applyShiftPreset(day, 'Night')} className="px-3 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-500 text-xs rounded border border-white/10 transition-colors">Night</button>
                                                        </div>
                                                     ) : (
                                                         <span className="text-gray-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <AlertCircle size={12} /> ပိတ်ရက် (Off Day)
                                                         </span>
                                                     )}
                                                 </td>
                                             </tr>
                                         )
                                     })}
                                 </tbody>
                             </table>
                        </div>
                        
                        {/* Weekly Summary */}
                        <div className="mt-6 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-gold-500/20 rounded-full text-gold-500"><Clock size={20} /></div>
                                 <div>
                                     <div className="text-xs text-gray-400 uppercase font-bold">Total Weekly Hours</div>
                                     <div className="text-xl font-bold text-white font-mono">{totalWeeklyHours.toFixed(1)} <span className="text-sm text-gray-500">hours/week</span></div>
                                 </div>
                             </div>
                             <div className="text-right text-xs text-gray-500">
                                 <p>Standard: 40-48 hours</p>
                             </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                         <button onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-3 rounded-xl hover:bg-white/10 text-white transition-colors font-medium">ပယ်ဖျက်မည် (Cancel)</button>
                         <button onClick={saveSchedule} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"><Check size={18} /> သိမ်းမည် (Save)</button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center animate-scale-up">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Remove Staff Member?</h3>
                    <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this staff member? This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20">Cancel</button>
                        <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold">Delete</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};