

import { Member, MembershipType, Product, Transaction, Staff, ProductCategory, WeeklySchedule } from './types';

export const MOCK_MEMBERSHIP_TYPES: MembershipType[] = [
  { id: '1', nameEN: 'Walk-in', nameMM: 'တစ်ရက်', durationDays: 1, price: 3000, isActive: true, colorCode: '#9ca3af' },
  { id: '2', nameEN: '1 Month', nameMM: '၁ လ', durationDays: 30, price: 30000, isActive: true, colorCode: '#FFD700' },
  { id: '3', nameEN: '3 Months', nameMM: '၃ လ', durationDays: 90, price: 80000, isActive: true, colorCode: '#3b82f6' },
  { id: '4', nameEN: '6 Months', nameMM: '၆ လ', durationDays: 180, price: 150000, isActive: true, colorCode: '#22c55e' },
  { id: '5', nameEN: '1 Year', nameMM: '၁ နှစ်', durationDays: 365, price: 250000, isActive: true, colorCode: '#ec4899' },
];

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'c1', nameEN: 'Beverages', nameMM: 'အချိုရည်' },
  { id: 'c2', nameEN: 'Supplements', nameMM: 'အာဟာရဖြည့်စွက်စာ' },
  { id: 'c3', nameEN: 'Accessories', nameMM: 'ဆက်စပ်ပစ္စည်း' },
  { id: 'c4', nameEN: 'Equipment', nameMM: 'အားကစားကိရိယာ' },
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    nameEN: 'Whey Protein', 
    nameMM: 'ဝေပရိုတိန်း', 
    categoryId: 'c2', 
    price: 85000, 
    costPrice: 70000, 
    stock: 15, 
    lowStockThreshold: 5, 
    unit: 'Bottle', 
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=300&auto=format&fit=crop', 
    isActive: true 
  },
  { 
    id: 'p2', 
    nameEN: 'Mineral Water', 
    nameMM: 'ရေသန့်', 
    categoryId: 'c1', 
    price: 500, 
    costPrice: 300, 
    stock: 45, 
    lowStockThreshold: 20, 
    unit: 'Bottle', 
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=300&auto=format&fit=crop', 
    isActive: true 
  },
  { 
    id: 'p3', 
    nameEN: 'Energy Drink', 
    nameMM: 'အားဖြည့်အချိုရည်', 
    categoryId: 'c1', 
    price: 1500, 
    costPrice: 1000, 
    stock: 8, 
    lowStockThreshold: 10, 
    unit: 'Can', 
    image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=300&auto=format&fit=crop', 
    isActive: true 
  },
  { 
    id: 'p4', 
    nameEN: 'Gym Gloves', 
    nameMM: 'လက်အိတ်', 
    categoryId: 'c3', 
    price: 12000, 
    costPrice: 8000, 
    stock: 0, 
    lowStockThreshold: 5, 
    unit: 'Pair', 
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop', 
    isActive: true 
  }
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    memberId: 'GM001',
    fullNameEN: 'John Doe',
    fullNameMM: 'ဂျွန်ဒိုး',
    phone: '09-123456789',
    gender: 'Male',
    membershipTypeId: '2',
    startDate: '2023-10-01',
    endDate: '2023-11-01',
    status: 'Active',
    joinDate: '2023-10-01',
    photoUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=FFD700&color=000'
  },
  {
    id: '2',
    memberId: 'GM002',
    fullNameEN: 'Thida Aye',
    fullNameMM: 'သီတာအေး',
    phone: '09-987654321',
    gender: 'Female',
    membershipTypeId: '3',
    startDate: '2023-08-15',
    endDate: '2023-11-15',
    status: 'Active',
    joinDate: '2023-08-15',
    photoUrl: 'https://ui-avatars.com/api/?name=Thida+Aye&background=ec4899&color=fff'
  },
  {
    id: '3',
    memberId: 'GM003',
    fullNameEN: 'Kyaw Kyaw',
    fullNameMM: 'ကျော်ကျော်',
    phone: '09-112233445',
    gender: 'Male',
    membershipTypeId: '2',
    startDate: '2023-09-01',
    endDate: '2023-10-01',
    status: 'Expired',
    joinDate: '2023-09-01',
    photoUrl: 'https://ui-avatars.com/api/?name=Kyaw+Kyaw&background=333&color=fff'
  }
];

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { working: true, start: "06:00", end: "14:00", shift: "Morning" },
  tuesday: { working: true, start: "06:00", end: "14:00", shift: "Morning" },
  wednesday: { working: true, start: "06:00", end: "14:00", shift: "Morning" },
  thursday: { working: true, start: "06:00", end: "14:00", shift: "Morning" },
  friday: { working: true, start: "06:00", end: "14:00", shift: "Morning" },
  saturday: { working: true, start: "08:00", end: "17:00", shift: "Full" },
  sunday: { working: false, start: "", end: "", shift: "Off" },
};

export const MOCK_STAFF: Staff[] = [
  {
    id: 's1',
    staffId: 'S001',
    name: 'Aung Aung',
    role: 'Trainer',
    phone: '09-555666777',
    joinDate: '2023-01-15',
    photoUrl: 'https://ui-avatars.com/api/?name=Aung+Aung&background=3b82f6&color=fff',
    status: 'Active',
    schedule: 'Mon-Sat 6AM-2PM',
    weeklySchedule: DEFAULT_SCHEDULE
  },
  {
    id: 's2',
    staffId: 'S002',
    name: 'Su Su',
    role: 'Manager',
    phone: '09-444333222',
    joinDate: '2022-11-01',
    photoUrl: 'https://ui-avatars.com/api/?name=Su+Su&background=FFD700&color=000',
    status: 'Active',
    schedule: 'Mon-Fri 9AM-5PM',
    weeklySchedule: {
        monday: { working: true, start: "09:00", end: "17:00", shift: "Full" },
        tuesday: { working: true, start: "09:00", end: "17:00", shift: "Full" },
        wednesday: { working: true, start: "09:00", end: "17:00", shift: "Full" },
        thursday: { working: true, start: "09:00", end: "17:00", shift: "Full" },
        friday: { working: true, start: "09:00", end: "17:00", shift: "Full" },
        saturday: { working: false, start: "", end: "", shift: "Off" },
        sunday: { working: false, start: "", end: "", shift: "Off" },
    }
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    invoiceNumber: 'INV-100001',
    type: 'Membership',
    items: [{ name: '1 Month Membership', quantity: 1, price: 30000, type: 'Membership' }],
    subtotal: 30000,
    discount: 0,
    total: 30000,
    paymentMethod: 'Cash',
    date: new Date(Date.now() - 86400000).toISOString(),
    processedBy: 'Admin',
    memberId: '1',
    memberName: 'John Doe'
  },
  {
    id: 't2',
    invoiceNumber: 'INV-100002',
    type: 'Product',
    items: [
        { name: 'Mineral Water', quantity: 2, price: 500, type: 'Product' },
        { name: 'Energy Drink', quantity: 1, price: 1500, type: 'Product' }
    ],
    subtotal: 2500,
    discount: 0,
    total: 2500,
    paymentMethod: 'KBZPay',
    date: new Date().toISOString(),
    processedBy: 'Admin'
  }
];

export const TRANSLATIONS = {
  EN: {
    dashboard: 'Dashboard',
    members: 'Members',
    pos: 'POS',
    inventory: 'Inventory',
    staff: 'Staff',
    reports: 'Reports',
    checkin: 'Check-in',
    settings: 'Settings',
    logout: 'Logout',
    welcome: 'Welcome Back',
    activeMembers: 'Active Members',
    totalRevenue: 'Total Revenue',
    todayCheckins: 'Check-ins Today',
    expiringSoon: 'Expiring Soon',
    search: 'Search...',
    newMember: 'New Member',
    status: 'Status',
    action: 'Action',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    renew: 'Renew',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    view: 'View',
    loginTitle: 'Power Plus Gym',
    loginSubtitle: 'Management System',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Login',
    products: 'Products',
    categories: 'Categories',
    stock: 'Stock',
    price: 'Price',
    lowStock: 'Low Stock',
    restock: 'Restock',
    shift: 'Shift',
    attendance: 'Attendance',
    dailyReport: 'Daily Report',
    monthlyReport: 'Monthly Report',
    yearlyReport: 'Yearly Report',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    general: 'General',
    packages: 'Packages',
    users: 'Users'
  },
  MM: {
    dashboard: 'ဒက်ရှ်ဘုတ်',
    members: 'အသင်းဝင်များ',
    pos: 'အရောင်း',
    inventory: 'ပစ္စည်းစာရင်း',
    staff: 'ဝန်ထမ်းများ',
    reports: 'မှတ်တမ်းများ',
    checkin: 'အဝင်အထွက်',
    settings: 'ဆက်တင်များ',
    logout: 'ထွက်မည်',
    welcome: 'ကြိုဆိုပါတယ်',
    activeMembers: 'လက်ရှိအသင်းဝင်',
    totalRevenue: 'စုစုပေါင်းဝင်ငွေ',
    todayCheckins: 'ယနေ့အဝင်',
    expiringSoon: 'သက်တမ်းကုန်တော့မည်',
    search: 'ရှာဖွေရန်...',
    newMember: 'အသင်းဝင်သစ်',
    status: 'အခြေအနေ',
    action: 'လုပ်ဆောင်ချက်',
    addToCart: 'ခြင်းထဲထည့်မည်',
    checkout: 'ငွေချေမည်',
    renew: 'သက်တမ်းတိုး',
    delete: 'ဖျက်မည်',
    edit: 'ပြင်မည်',
    save: 'သိမ်းမည်',
    cancel: 'မလုပ်တော့ပါ',
    view: 'ကြည့်မည်',
    loginTitle: 'ပါဝါပလပ်စ် ဂျင်',
    loginSubtitle: 'စီမံခန့်ခွဲမှုစနစ်',
    username: 'အသုံးပြုသူအမည်',
    password: 'စကားဝှက်',
    loginBtn: 'ဝင်ရောက်မည်',
    products: 'ပစ္စည်းများ',
    categories: 'အမျိုးအစားများ',
    stock: 'လက်ကျန်',
    price: 'ဈေးနှုန်း',
    lowStock: 'လက်ကျန်နည်း',
    restock: 'ဖြည့်တင်းမည်',
    shift: 'အဆိုင်း',
    attendance: 'ရုံးတက်ချိန်',
    dailyReport: 'နေ့စဉ်မှတ်တမ်း',
    monthlyReport: 'လစဉ်မှတ်တမ်း',
    yearlyReport: 'နှစ်ချုပ်မှတ်တမ်း',
    exportPDF: 'PDF ထုတ်မည်',
    exportExcel: 'Excel ထုတ်မည်',
    general: 'အထွေထွေ',
    packages: 'နှုန်းထားများ',
    users: 'အသုံးပြုသူများ'
  }
};