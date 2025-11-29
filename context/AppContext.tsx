
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Member, Product, Transaction, CheckIn, Staff, MembershipType, ProductCategory, StaffSchedule, StaffAttendance, WeeklySchedule } from '../types';
import { MOCK_MEMBERS, MOCK_PRODUCTS, INITIAL_TRANSACTIONS, MOCK_MEMBERSHIP_TYPES, MOCK_STAFF, MOCK_CATEGORIES } from '../constants';

interface AppContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  productCategories: ProductCategory[];
  addProductCategory: (c: ProductCategory) => void;
  deleteProductCategory: (id: string) => void;
  
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  
  checkIns: CheckIn[];
  addCheckIn: (c: CheckIn) => void;
  
  staff: Staff[];
  addStaff: (s: Staff) => void;
  updateStaff: (id: string, s: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  staffSchedules: StaffSchedule[];
  addStaffSchedule: (s: StaffSchedule) => void;
  deleteStaffSchedule: (id: string) => void;
  
  staffAttendance: StaffAttendance[];
  clockInStaff: (staffId: string) => void;
  clockOutStaff: (staffId: string) => void;

  membershipTypes: MembershipType[];
  addMembershipType: (mt: MembershipType) => void;
  updateMembershipType: (id: string, mt: Partial<MembershipType>) => void;
  deleteMembershipType: (id: string) => void;

  // System Management
  resetSystem: (mode: 'Demo' | 'Clear') => void;
  exportBackup: () => void;
  restoreBackup: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('EN');
  
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(MOCK_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>(MOCK_MEMBERSHIP_TYPES);

  useEffect(() => {
    const storedUser = localStorage.getItem('ppg_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('ppg_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ppg_user');
  };

  const addMember = (m: Member) => setMembers(prev => [m, ...prev]);
  const updateMember = (id: string, data: Partial<Member>) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  const addProduct = (p: Product) => setProducts(prev => [p, ...prev]);
  const updateProduct = (id: string, data: Partial<Product>) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const addProductCategory = (c: ProductCategory) => setProductCategories(prev => [...prev, c]);
  const deleteProductCategory = (id: string) => setProductCategories(prev => prev.filter(c => c.id !== id));

  const addTransaction = (t: Transaction) => {
      setTransactions(prev => [t, ...prev]);
      if (t.type === 'Product' || t.type === 'Mixed') {
          t.items.forEach(item => {
              if (item.type === 'Product') {
                  const product = products.find(p => p.nameEN === item.name || p.nameMM === item.name);
                  if (product) {
                      updateProduct(product.id, { stock: product.stock - item.quantity });
                  }
              }
          });
      }
  };
  
  const addCheckIn = (c: CheckIn) => setCheckIns(prev => [c, ...prev]);

  const addStaff = (s: Staff) => setStaff(prev => [s, ...prev]);
  const updateStaff = (id: string, data: Partial<Staff>) => setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));
  
  const addStaffSchedule = (s: StaffSchedule) => setStaffSchedules(prev => [...prev, s]);
  const deleteStaffSchedule = (id: string) => setStaffSchedules(prev => prev.filter(s => s.id !== id));

  const clockInStaff = (staffId: string) => {
      const staffMember = staff.find(s => s.id === staffId);
      const now = new Date();
      
      // Default status
      let status: StaffAttendance['status'] = 'Working';

      // Late Check logic
      if (staffMember?.weeklySchedule) {
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todaySchedule = staffMember.weeklySchedule[days[now.getDay()] as keyof WeeklySchedule];
          
          if (todaySchedule?.working && todaySchedule.start) {
              const [h, m] = todaySchedule.start.split(':').map(Number);
              const scheduleTime = new Date(now);
              scheduleTime.setHours(h, m, 0, 0);
              
              // Allow 15 min grace period
              const diffMinutes = (now.getTime() - scheduleTime.getTime()) / 60000;
              if (diffMinutes > 15) {
                  status = 'Late';
              }
          }
      }

      const newRecord: StaffAttendance = {
          id: Date.now().toString(),
          staffId,
          date: now.toISOString().split('T')[0], // YYYY-MM-DD format for storage/grouping
          clockIn: now.toISOString(),
          status: status,
          hoursWorked: 0,
          totalDurationStr: '0h 0m'
      };
      setStaffAttendance(prev => [newRecord, ...prev]);
  };

  const clockOutStaff = (staffId: string) => {
      setStaffAttendance(prev => {
          // Find the active record (Working or Late) that hasn't been clocked out
          const recordIndex = prev.findIndex(r => r.staffId === staffId && !r.clockOut);
          
          if (recordIndex >= 0) {
              const updated = [...prev];
              const record = updated[recordIndex];
              const clockOut = new Date();
              const clockIn = new Date(record.clockIn);
              
              const diffMs = clockOut.getTime() - clockIn.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const hoursDecimal = diffMs / (1000 * 60 * 60);

              updated[recordIndex] = { 
                  ...record, 
                  clockOut: clockOut.toISOString(), 
                  hoursWorked: parseFloat(hoursDecimal.toFixed(2)),
                  totalDurationStr: `${hours}h ${mins}m`,
                  status: 'Completed'
              };
              return updated;
          }
          return prev;
      });
  };

  const addMembershipType = (mt: MembershipType) => setMembershipTypes(prev => [...prev, mt]);
  const updateMembershipType = (id: string, mt: Partial<MembershipType>) => setMembershipTypes(prev => prev.map(m => m.id === id ? { ...m, ...mt } : m));
  const deleteMembershipType = (id: string) => setMembershipTypes(prev => prev.filter(m => m.id !== id));

  const resetSystem = (mode: 'Demo' | 'Clear') => {
      if (mode === 'Clear') {
          setMembers([]);
          setProducts([]);
          setProductCategories([]);
          setTransactions([]);
          setCheckIns([]);
          setStaff([]);
          setStaffSchedules([]);
          setStaffAttendance([]);
          setMembershipTypes([]);
      } else {
          setMembers(MOCK_MEMBERS);
          setProducts(MOCK_PRODUCTS);
          setProductCategories(MOCK_CATEGORIES);
          setTransactions(INITIAL_TRANSACTIONS);
          setStaff(MOCK_STAFF);
          setMembershipTypes(MOCK_MEMBERSHIP_TYPES);
          setCheckIns([]);
      }
  };

  const exportBackup = () => {
      const data = {
          timestamp: new Date().toISOString(),
          members,
          products,
          productCategories,
          transactions,
          checkIns,
          staff,
          staffSchedules,
          staffAttendance,
          membershipTypes
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PowerPlusGym_Backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const restoreBackup = async (file: File) => {
      try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (data.members) setMembers(data.members);
          if (data.products) setProducts(data.products);
          if (data.productCategories) setProductCategories(data.productCategories);
          if (data.transactions) setTransactions(data.transactions);
          if (data.checkIns) setCheckIns(data.checkIns);
          if (data.staff) setStaff(data.staff);
          if (data.membershipTypes) setMembershipTypes(data.membershipTypes);
          if (data.staffAttendance) setStaffAttendance(data.staffAttendance);
      } catch (e) {
          console.error("Backup restore failed", e);
          alert("Invalid backup file");
      }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      language, setLanguage,
      members, addMember, updateMember, deleteMember,
      products, addProduct, updateProduct, deleteProduct,
      productCategories, addProductCategory, deleteProductCategory,
      transactions, addTransaction,
      checkIns, addCheckIn,
      staff, addStaff, updateStaff, deleteStaff,
      staffSchedules, addStaffSchedule, deleteStaffSchedule,
      staffAttendance, clockInStaff, clockOutStaff,
      membershipTypes, addMembershipType, updateMembershipType, deleteMembershipType,
      resetSystem, exportBackup, restoreBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
