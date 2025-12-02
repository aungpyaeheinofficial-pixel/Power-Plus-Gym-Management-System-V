
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Member, Product, Transaction, CheckIn, Staff, MembershipType, ProductCategory, StaffSchedule, StaffAttendance, WeeklySchedule } from '../types';
import { api } from '../api';

interface AppContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  
  language: Language;
  setLanguage: (l: Language) => void;

  members: Member[];
  addMember: (m: Member) => Promise<void>;
  updateMember: (id: string, m: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  products: Product[];
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  productCategories: ProductCategory[];
  addProductCategory: (c: ProductCategory) => Promise<void>;
  updateProductCategory: (id: string, c: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;
  
  transactions: Transaction[];
  addTransaction: (t: Transaction) => Promise<void>;
  
  checkIns: CheckIn[];
  addCheckIn: (c: CheckIn) => Promise<void>;
  
  staff: Staff[];
  addStaff: (s: Staff) => Promise<void>;
  updateStaff: (id: string, s: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  staffSchedules: StaffSchedule[];
  addStaffSchedule: (s: StaffSchedule) => Promise<void>;
  deleteStaffSchedule: (id: string) => Promise<void>;
  
  staffAttendance: StaffAttendance[];
  clockInStaff: (staffId: string) => Promise<void>;
  clockOutStaff: (staffId: string) => Promise<void>;

  membershipTypes: MembershipType[];
  addMembershipType: (mt: MembershipType) => Promise<void>;
  updateMembershipType: (id: string, mt: Partial<MembershipType>) => Promise<void>;
  deleteMembershipType: (id: string) => Promise<void>;

  // System Management
  resetSystem: (mode: 'Demo' | 'Clear') => Promise<void>;
  exportBackup: () => void;
  restoreBackup: (file: File) => Promise<void>;
  
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('EN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);

  // Load initial data from API
  useEffect(() => {
    const storedUser = localStorage.getItem('ppg_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    document.documentElement.classList.add('dark');
    
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, productsData, categoriesData, transactionsData, checkInsData, staffData, attendanceData, membershipTypesData] = await Promise.all([
        api.getMembers().catch(() => []),
        api.getProducts().catch(() => []),
        api.getProductCategories().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getCheckIns().catch(() => []),
        api.getStaff().catch(() => []),
        api.getStaffAttendance().catch(() => []),
        api.getMembershipTypes().catch(() => []),
      ]);

      // Transform data to match frontend types
      setMembers(membersData.map((m: any) => ({
        id: m.id.toString(),
        memberId: m.member_code,
        fullNameEN: m.full_name_en,
        fullNameMM: m.full_name_mm,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        membershipTypeId: m.membership_type_id?.toString(),
        startDate: m.start_date,
        endDate: m.end_date,
        status: m.status,
        joinDate: m.join_date,
        photoUrl: m.photo_url || '',
        address: m.address,
        emergencyContact: m.emergency_name ? { name: m.emergency_name, phone: m.emergency_phone } : undefined,
        nrc: m.nrc,
        dob: m.dob,
        notes: m.notes,
      })));

      setProducts(productsData.map((p: any) => ({
        id: p.id.toString(),
        nameEN: p.name_en,
        nameMM: p.name_mm,
        categoryId: p.category_id.toString(),
        sku: p.sku,
        price: parseFloat(p.price),
        costPrice: parseFloat(p.cost_price),
        stock: p.stock,
        lowStockThreshold: p.low_stock_threshold,
        unit: p.unit,
        image: p.image || '',
        isActive: p.is_active === 1,
      })));

      setProductCategories(categoriesData.map((c: any) => ({
        id: c.id.toString(),
        nameEN: c.name_en,
        nameMM: c.name_mm,
        icon: c.icon,
      })));

      setTransactions(transactionsData.map((t: any) => ({
        id: t.id.toString(),
        invoiceNumber: t.invoice_number,
        memberId: t.member_id?.toString(),
        memberName: t.member_name,
        type: t.type,
        items: (t.items || []).map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          type: item.item_type, // Map item_type from database to type
        })),
        subtotal: parseFloat(t.subtotal),
        discount: parseFloat(t.discount),
        total: parseFloat(t.total),
        paymentMethod: t.payment_method,
        date: t.date,
        processedBy: t.processed_by?.toString() || 'Admin',
      })));

      setCheckIns(checkInsData.map((c: any) => ({
        id: c.id.toString(),
        memberId: c.member_id.toString(),
        checkInTime: c.check_in_time,
        checkOutTime: c.check_out_time,
        method: c.method,
      })));

      setStaff(staffData.map((s: any) => ({
        id: s.id.toString(),
        staffId: s.staff_code,
        name: s.name,
        role: s.role,
        phone: s.phone,
        email: s.email,
        joinDate: s.join_date,
        salary: s.salary ? parseFloat(s.salary) : undefined,
        photoUrl: s.photo_url || '',
        status: s.status,
        weeklySchedule: s.weeklySchedule,
      })));

      setStaffAttendance(attendanceData.map((a: any) => ({
        id: a.id.toString(),
        staffId: a.staff_id.toString(),
        date: a.date,
        clockIn: a.clock_in,
        clockOut: a.clock_out,
        status: a.status,
        hoursWorked: a.hours_worked ? parseFloat(a.hours_worked) : undefined,
        totalDurationStr: a.total_duration,
      })));

      setMembershipTypes(membershipTypesData.map((mt: any) => ({
        id: mt.id.toString(),
        nameEN: mt.name_en,
        nameMM: mt.name_mm,
        durationDays: mt.duration_days,
        price: parseFloat(mt.price),
        description: mt.description,
        colorCode: mt.color_code,
        isActive: mt.is_active === 1,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('ppg_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ppg_user');
  };

  // Members
  const addMember = async (m: Member) => {
    try {
      const memberData = {
        member_code: m.memberId,
        full_name_en: m.fullNameEN,
        full_name_mm: m.fullNameMM,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        membership_type_id: m.membershipTypeId ? parseInt(m.membershipTypeId) : null,
        start_date: m.startDate,
        end_date: m.endDate,
        status: m.status,
        join_date: m.joinDate,
        photo_url: m.photoUrl,
        address: m.address,
        emergency_name: m.emergencyContact?.name,
        emergency_phone: m.emergencyContact?.phone,
        nrc: m.nrc,
        dob: m.dob,
        notes: m.notes,
      };
      await api.createMember(memberData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      const updateData: any = {};
      if (data.fullNameEN) updateData.full_name_en = data.fullNameEN;
      if (data.fullNameMM !== undefined) updateData.full_name_mm = data.fullNameMM;
      if (data.phone) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.gender) updateData.gender = data.gender;
      if (data.membershipTypeId) updateData.membership_type_id = parseInt(data.membershipTypeId);
      if (data.startDate) updateData.start_date = data.startDate;
      if (data.endDate) updateData.end_date = data.endDate;
      if (data.status) updateData.status = data.status;
      if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.emergencyContact) {
        updateData.emergency_name = data.emergencyContact.name;
        updateData.emergency_phone = data.emergencyContact.phone;
      }
      if (data.nrc !== undefined) updateData.nrc = data.nrc;
      if (data.dob !== undefined) updateData.dob = data.dob;
      if (data.notes !== undefined) updateData.notes = data.notes;
      
      await api.updateMember(id, updateData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await api.deleteMember(id);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Products
  const addProduct = async (p: Product) => {
    try {
      const productData = {
        name_en: p.nameEN,
        name_mm: p.nameMM,
        category_id: parseInt(p.categoryId),
        sku: p.sku,
        price: p.price,
        cost_price: p.costPrice,
        stock: p.stock,
        low_stock_threshold: p.lowStockThreshold,
        unit: p.unit,
        image: p.image,
        is_active: p.isActive ? 1 : 0,
      };
      await api.createProduct(productData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (data.nameEN) updateData.name_en = data.nameEN;
      if (data.nameMM) updateData.name_mm = data.nameMM;
      if (data.categoryId) updateData.category_id = parseInt(data.categoryId);
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.costPrice !== undefined) updateData.cost_price = data.costPrice;
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.lowStockThreshold !== undefined) updateData.low_stock_threshold = data.lowStockThreshold;
      if (data.unit) updateData.unit = data.unit;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.isActive !== undefined) updateData.is_active = data.isActive ? 1 : 0;
      
      await api.updateProduct(id, updateData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Product Categories
  const addProductCategory = async (c: ProductCategory) => {
    try {
      await api.createProductCategory({
        name_en: c.nameEN,
        name_mm: c.nameMM,
        icon: c.icon,
      });
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProductCategory = async (id: string, c: Partial<ProductCategory>) => {
    try {
      const updateData: any = {};
      if (c.nameEN) updateData.name_en = c.nameEN;
      if (c.nameMM) updateData.name_mm = c.nameMM;
      if (c.icon !== undefined) updateData.icon = c.icon;
      await api.updateProductCategory(id, updateData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      await api.deleteProductCategory(id);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Transactions
  const addTransaction = async (t: Transaction) => {
    try {
      const transactionData = {
        invoice_number: t.invoiceNumber,
        member_id: t.memberId ? parseInt(t.memberId) : null,
        member_name: t.memberName,
        type: t.type,
        subtotal: t.subtotal,
        discount: t.discount,
        total: t.total,
        payment_method: t.paymentMethod,
        date: t.date,
        processed_by: t.processedBy ? parseInt(t.processedBy) : null,
        items: t.items.map(item => ({
          type: item.type,
          membership_type_id: item.type === 'Membership' ? membershipTypes.find(mt => mt.nameEN === item.name)?.id ? parseInt(membershipTypes.find(mt => mt.nameEN === item.name)!.id) : null : null,
          product_id: item.type === 'Product' ? products.find(p => p.nameEN === item.name)?.id ? parseInt(products.find(p => p.nameEN === item.name)!.id) : null : null,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      await api.createTransaction(transactionData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  const addCheckIn = async (c: CheckIn) => {
    try {
      await api.createCheckIn({
        member_id: parseInt(c.memberId),
        check_in_time: c.checkInTime,
        check_out_time: c.checkOutTime,
        method: c.method,
      });
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Staff
  const addStaff = async (s: Staff) => {
    try {
      const staffData = {
        staff_code: s.staffId,
        name: s.name,
        role: s.role,
        phone: s.phone,
        email: s.email,
        join_date: s.joinDate,
        salary: s.salary,
        photo_url: s.photoUrl,
        status: s.status,
        weeklySchedule: s.weeklySchedule,
      };
      await api.createStaff(staffData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateStaff = async (id: string, data: Partial<Staff>) => {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.role) updateData.role = data.role;
      if (data.phone) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.salary !== undefined) updateData.salary = data.salary;
      if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
      if (data.status) updateData.status = data.status;
      if (data.weeklySchedule) updateData.weeklySchedule = data.weeklySchedule;
      
      await api.updateStaff(id, updateData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await api.deleteStaff(id);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  const addStaffSchedule = async (s: StaffSchedule) => {
    setStaffSchedules(prev => [...prev, s]);
  };
  
  const deleteStaffSchedule = async (id: string) => {
    setStaffSchedules(prev => prev.filter(s => s.id !== id));
  };

  const clockInStaff = async (staffId: string) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      const now = new Date();
      
      let status: StaffAttendance['status'] = 'Working';

      if (staffMember?.weeklySchedule) {
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todaySchedule = staffMember.weeklySchedule[days[now.getDay()] as keyof WeeklySchedule];
          
          if (todaySchedule?.working && todaySchedule.start) {
              const [h, m] = todaySchedule.start.split(':').map(Number);
              const scheduleTime = new Date(now);
              scheduleTime.setHours(h, m, 0, 0);
              
              const diffMinutes = (now.getTime() - scheduleTime.getTime()) / 60000;
              if (diffMinutes > 15) {
                  status = 'Late';
              }
          }
      }

      await api.clockInStaff({
        staff_id: parseInt(staffId),
        date: now.toISOString().split('T')[0],
        clock_in: now.toISOString(),
        status: status,
      });
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const clockOutStaff = async (staffId: string) => {
    try {
      const record = staffAttendance.find(r => r.staffId === staffId && !r.clockOut);
      if (!record) return;
      
      const clockOut = new Date();
      const clockIn = new Date(record.clockIn);
      
      const diffMs = clockOut.getTime() - clockIn.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const hoursDecimal = diffMs / (1000 * 60 * 60);

      await api.clockOutStaff(record.id, {
        clock_out: clockOut.toISOString(),
        hours_worked: parseFloat(hoursDecimal.toFixed(2)),
        total_duration: `${hours}h ${mins}m`,
        status: 'Completed'
      });
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addMembershipType = async (mt: MembershipType) => {
    try {
      await api.createMembershipType({
        name_en: mt.nameEN,
        name_mm: mt.nameMM,
        duration_days: mt.durationDays,
        price: mt.price,
        description: mt.description,
        color_code: mt.colorCode,
        is_active: mt.isActive ? 1 : 0,
      });
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMembershipType = async (id: string, mt: Partial<MembershipType>) => {
    try {
      const updateData: any = {};
      if (mt.nameEN) updateData.name_en = mt.nameEN;
      if (mt.nameMM) updateData.name_mm = mt.nameMM;
      if (mt.durationDays !== undefined) updateData.duration_days = mt.durationDays;
      if (mt.price !== undefined) updateData.price = mt.price;
      if (mt.description !== undefined) updateData.description = mt.description;
      if (mt.colorCode !== undefined) updateData.color_code = mt.colorCode;
      if (mt.isActive !== undefined) updateData.is_active = mt.isActive ? 1 : 0;
      
      await api.updateMembershipType(id, updateData);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMembershipType = async (id: string) => {
    try {
      await api.deleteMembershipType(id);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetSystem = async (mode: 'Demo' | 'Clear') => {
    // This would need backend implementation
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
          // Would need backend implementation to restore
          console.log('Restore backup:', data);
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
      productCategories, addProductCategory, updateProductCategory, deleteProductCategory,
      transactions, addTransaction,
      checkIns, addCheckIn,
      staff, addStaff, updateStaff, deleteStaff,
      staffSchedules, addStaffSchedule, deleteStaffSchedule,
      staffAttendance, clockInStaff, clockOutStaff,
      membershipTypes, addMembershipType, updateMembershipType, deleteMembershipType,
      resetSystem, exportBackup, restoreBackup,
      loading, error
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
