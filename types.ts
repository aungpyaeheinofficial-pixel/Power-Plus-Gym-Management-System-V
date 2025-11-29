

export type Language = 'EN' | 'MM';

export type Role = 
  | 'admin' | 'manager' | 'staff' | 'trainer' 
  | 'Head Trainer' | 'Trainer' | 'Manager' | 'Receptionist' 
  | 'Cleaner' | 'Maintenance' | 'Security' | 'Nutritionist';

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName: string;
  photoUrl?: string;
}

export interface MembershipType {
  id: string;
  nameMM: string;
  nameEN: string;
  durationDays: number;
  price: number;
  description?: string;
  colorCode?: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  memberId: string; // GM001
  fullNameMM?: string;
  fullNameEN: string;
  phone: string;
  email?: string;
  nrc?: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  emergencyContact?: { name: string; phone: string };
  photoUrl: string;
  membershipTypeId: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  joinDate: string;
  notes?: string;
}

export interface ProductCategory {
  id: string;
  nameMM: string;
  nameEN: string;
  icon?: string;
}

export interface Product {
  id: string;
  nameMM: string;
  nameEN: string;
  categoryId: string;
  sku?: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  image: string;
  isActive: boolean;
}

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
  type: 'Membership' | 'Product';
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  memberId?: string;
  memberName?: string;
  type: 'Membership' | 'Product' | 'Mixed';
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'KBZPay' | 'WavePay' | 'AYA Pay' | 'CB Pay' | 'Bank Transfer' | 'Credit Card';
  date: string; // ISO String
  processedBy: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  method: 'QR' | 'Manual' | 'Search';
}

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Full' | 'Custom' | 'Off';

export interface DailySchedule {
  working: boolean;
  start: string; // HH:mm 24h format
  end: string;   // HH:mm 24h format
  shift: ShiftType;
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

export interface Staff {
  id: string;
  staffId: string; // S001
  name: string;
  role: Role; // Position
  phone: string;
  email?: string;
  joinDate: string;
  salary?: number;
  photoUrl: string;
  status: 'Active' | 'Inactive';
  schedule?: string; // e.g. "Mon-Fri 9AM-5PM" (Legacy display)
  weeklySchedule?: WeeklySchedule; // Detailed schedule
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  shiftType: 'Morning' | 'Afternoon' | 'Full' | 'Custom';
  note?: string;
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO
  clockOut?: string; // ISO
  status: 'Working' | 'Completed' | 'Late' | 'Absent' | 'Early Leave';
  hoursWorked?: number;
  totalDurationStr?: string; // "8h 15m"
}

export interface AppSettings {
  gymName: string;
  address: string;
  phone: string;
  currencySymbol: string;
  taxRate: number;
}