import { useState } from 'react';
import { User, Service, Booking, Staff, ProviderProfile, UserRole } from '../types';
import api from '../services/apiService';

// ============================================
// USERS HOOKS
// ============================================

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users.getByRole(role);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    name: string;
    role: string;
    avatar?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await api.users.create(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchUsers, fetchUsersByRole, createUser };
};

// ============================================
// SERVICES HOOKS
// ============================================

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.services.getAll();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.services.getByProvider(providerId);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: {
    providerId: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    category: string;
    type: string;
    image?: string;
    requiresStaffSelection: boolean;
    maxCapacity?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newService = await api.services.create(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { services, loading, error, fetchServices, fetchServicesByProvider, createService };
};

// ============================================
// BOOKINGS HOOKS
// ============================================

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingsByClient = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.bookings.getByClient(clientId);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.bookings.getByProvider(providerId);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    serviceId: string;
    clientId: string;
    providerId: string;
    date: string;
    time: string;
    staffId?: string;
    notes?: string;
    location?: string;
    guests?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newBooking = await api.bookings.create(bookingData);
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string, clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBooking = await api.bookings.cancel(id, clientId);
      setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
      return updatedBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error canceling booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (id: string, clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBooking = await api.bookings.confirm(id, clientId);
      setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
      return updatedBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error confirming booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    bookings, 
    loading, 
    error, 
    fetchBookingsByClient, 
    fetchBookingsByProvider, 
    createBooking,
    cancelBooking,
    confirmBooking
  };
};

// ============================================
// STAFF HOOKS
// ============================================

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffByProvider = async (providerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.staff.getByProvider(providerId);
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching staff');
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: {
    providerId: string;
    name: string;
    role: string;
    avatar: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newStaff = await api.staff.create(staffData);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating staff');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { staff, loading, error, fetchStaffByProvider, createStaff };
};

// ============================================
// PROVIDER PROFILES HOOKS
// ============================================

export const useProviderProfiles = () => {
  const [profiles, setProfiles] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.providerProfiles.getAll();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileBySlug = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.providerProfiles.getBySlug(slug);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, error, fetchProfiles, fetchProfileBySlug };
};
