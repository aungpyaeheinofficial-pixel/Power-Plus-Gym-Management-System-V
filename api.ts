// Determine API URL based on platform
import { Capacitor } from '@capacitor/core';

const getApiBase = () => {
  if (Capacitor.isNativePlatform()) {
    // For Android app, use your production API
    return 'http://167.172.90.182:4000/api';
  }
  // For web, use environment variable
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};

const API_BASE = getApiBase();

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Users
export const api = {
  // Users
  login: (username: string, password: string) =>
    fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Members
  getMembers: () => fetchAPI('/members'),
  createMember: (member: any) =>
    fetchAPI('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    }),
  updateMember: (id: string, member: any) =>
    fetchAPI(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    }),
  deleteMember: (id: string) =>
    fetchAPI(`/members/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => fetchAPI('/products'),
  createProduct: (product: any) =>
    fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, product: any) =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    fetchAPI(`/products/${id}`, { method: 'DELETE' }),

  // Product Categories
  getProductCategories: () => fetchAPI('/product-categories'),
  createProductCategory: (category: any) =>
    fetchAPI('/product-categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),
  updateProductCategory: (id: string, category: any) =>
    fetchAPI(`/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),
  deleteProductCategory: (id: string) =>
    fetchAPI(`/product-categories/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI(`/transactions?${params.toString()}`);
  },
  createTransaction: (transaction: any) =>
    fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  // Check-ins
  getCheckIns: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return fetchAPI(`/check-ins${params}`);
  },
  createCheckIn: (checkIn: any) =>
    fetchAPI('/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    }),

  // Staff
  getStaff: () => fetchAPI('/staff'),
  createStaff: (staff: any) =>
    fetchAPI('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    }),
  updateStaff: (id: string, staff: any) =>
    fetchAPI(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    }),
  deleteStaff: (id: string) =>
    fetchAPI(`/staff/${id}`, { method: 'DELETE' }),

  // Staff Attendance
  getStaffAttendance: (staffId?: string, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    return fetchAPI(`/staff-attendance?${params.toString()}`);
  },
  clockInStaff: (data: any) =>
    fetchAPI('/staff-attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  clockOutStaff: (id: string, data: any) =>
    fetchAPI(`/staff-attendance/clock-out/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Membership Types
  getMembershipTypes: () => fetchAPI('/membership-types'),
  createMembershipType: (type: any) =>
    fetchAPI('/membership-types', {
      method: 'POST',
      body: JSON.stringify(type),
    }),
  updateMembershipType: (id: string, type: any) =>
    fetchAPI(`/membership-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(type),
    }),
  deleteMembershipType: (id: string) =>
    fetchAPI(`/membership-types/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => fetchAPI('/settings'),
  updateSettings: (settings: any) =>
    fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Health check
  health: () => fetchAPI('/health'),
};

