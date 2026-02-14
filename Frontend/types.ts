
export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER'
}

export enum ServiceType {
  APPOINTMENT = 'APPOINTMENT', // Standard (Haircut, Doctor)
  EVENT = 'EVENT',             // Classes, Workshops (Yoga, Crossfit)
  ON_SITE = 'ON_SITE',         // Home services (Cleaning, Private Chef)
  TABLE = 'TABLE'              // Gastronomy (Restaurants)
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Staff {
  id: string;
  providerId: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  image?: string;
  requiresStaffSelection?: boolean;
  type: ServiceType;
  maxCapacity?: number;
  assignedStaffIds?: string[]; // IDs del personal asignado
  // Azure Table Storage properties
  partitionKey?: string;
  rowKey?: string;
  timestamp?: string;
  eTag?: string;
}

export interface WorkingHour {
  day: string;
  hours: string;
  closed?: boolean;
}

export interface ProviderProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  category: string;
  themeColor: string;
  address?: string;
  phone?: string;
  workingHours?: WorkingHour[];
  instagram?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  staffId?: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  location?: string;
  guests?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
