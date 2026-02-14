import { User, Service, Booking, Staff, ProviderProfile, UserRole } from '../types';
import { API_CONFIG, getApiUrl } from '../config/api.config';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: API_CONFIG.HEADERS,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// ============================================
// USERS API
// ============================================

export const usersApi = {
  getAll: () => apiCall<User[]>('/users'),
  
  getById: (id: string, role: UserRole) => 
    apiCall<User>(`/users/${id}?role=${role}`),
  
  getByEmail: (email: string) => 
    apiCall<User>(`/users/by-email/${email}`),
  
  getByRole: (role: UserRole) => 
    apiCall<User[]>(`/users/by-role/${role}`),
  
  create: (data: { email: string; name: string; role: string; avatar?: string }) =>
    apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, user: User) =>
    apiCall<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  
  delete: (id: string, role: UserRole) =>
    apiCall<void>(`/users/${id}?role=${role}`, {
      method: 'DELETE',
    }),
};

// ============================================
// SERVICES API
// ============================================

// Helper para transformar Service del backend al frontend
const transformServiceFromBackend = (service: any): Service => {
  return {
    ...service,
    assignedStaffIds: service.assignedStaffIds 
      ? service.assignedStaffIds.split(',').filter((id: string) => id.trim()) 
      : []
  };
};

// Helper para transformar Service del frontend al backend
const transformServiceToBackend = (service: Service): any => {
  // Mantener todas las propiedades originales y solo convertir assignedStaffIds
  const { assignedStaffIds, ...rest } = service;
  
  return {
    ...rest,
    assignedStaffIds: assignedStaffIds && assignedStaffIds.length > 0 
      ? assignedStaffIds.join(',') 
      : null
  };
};

export const servicesApi = {
  getAll: async () => {
    const services = await apiCall<any[]>('/services');
    return services.map(transformServiceFromBackend);
  },
  
  getById: async (id: string, providerId: string) => {
    const service = await apiCall<any>(`/services/${id}?providerId=${providerId}`);
    return transformServiceFromBackend(service);
  },
  
  getByProvider: async (providerId: string) => {
    const services = await apiCall<any[]>(`/services/by-provider/${providerId}`);
    return services.map(transformServiceFromBackend);
  },
  
  create: async (data: {
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
    assignedStaffIds?: string[];
  }) => {
    const service = await apiCall<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformServiceFromBackend(service);
  },
  
  update: async (id: string, service: Service) => {
    const serviceData = transformServiceToBackend(service);
    const updatedService = await apiCall<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
    return transformServiceFromBackend(updatedService);
  },
  
  delete: (id: string, providerId: string) =>
    apiCall<void>(`/services/${id}?providerId=${providerId}`, {
      method: 'DELETE',
    }),
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsApi = {
  getAll: () => apiCall<Booking[]>('/bookings'),
  
  getById: (id: string, clientId: string) =>
    apiCall<Booking>(`/bookings/${id}?clientId=${clientId}`),
  
  getByClient: (clientId: string) =>
    apiCall<Booking[]>(`/bookings/by-client/${clientId}`),
  
  getByProvider: (providerId: string) =>
    apiCall<Booking[]>(`/bookings/by-provider/${providerId}`),
  
  create: (data: {
    serviceId: string;
    clientId: string;
    providerId: string;
    date: string;
    time: string;
    staffId?: string;
    notes?: string;
    location?: string;
    guests?: number;
  }) =>
    apiCall<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, booking: Booking) =>
    apiCall<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(booking),
    }),
  
  cancel: (id: string, clientId: string) =>
    apiCall<Booking>(`/bookings/${id}/cancel?clientId=${clientId}`, {
      method: 'PATCH',
    }),
  
  confirm: (id: string, clientId: string) =>
    apiCall<Booking>(`/bookings/${id}/confirm?clientId=${clientId}`, {
      method: 'PATCH',
    }),
  
  delete: (id: string, clientId: string) =>
    apiCall<void>(`/bookings/${id}?clientId=${clientId}`, {
      method: 'DELETE',
    }),
};

// ============================================
// STAFF API
// ============================================

export const staffApi = {
  getAll: () => apiCall<Staff[]>('/staff'),
  
  getById: (id: string, providerId: string) =>
    apiCall<Staff>(`/staff/${id}?providerId=${providerId}`),
  
  getByProvider: (providerId: string) =>
    apiCall<Staff[]>(`/staff/by-provider/${providerId}`),
  
  create: (data: {
    providerId: string;
    name: string;
    role: string;
    avatar: string;
  }) =>
    apiCall<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, staff: Staff) =>
    apiCall<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    }),
  
  delete: (id: string, providerId: string) =>
    apiCall<void>(`/staff/${id}?providerId=${providerId}`, {
      method: 'DELETE',
    }),
};

// ============================================
// PROVIDER PROFILES API
// ============================================

export const providerProfilesApi = {
  getAll: () => apiCall<ProviderProfile[]>('/providerprofiles'),
  
  getById: (id: string) =>
    apiCall<ProviderProfile>(`/providerprofiles/${id}`),
  
  getBySlug: (slug: string) =>
    apiCall<ProviderProfile>(`/providerprofiles/by-slug/${slug}`),
  
  create: (data: {
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    category: string;
    themeColor: string;
    address?: string;
    phone?: string;
    instagram?: string;
    workingHoursJson?: string;
  }) =>
    apiCall<ProviderProfile>('/providerprofiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, profile: ProviderProfile) =>
    apiCall<ProviderProfile>(`/providerprofiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  
  delete: (id: string) =>
    apiCall<void>(`/providerprofiles/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// COMBINED API EXPORT
// ============================================

export const api = {
  users: usersApi,
  services: servicesApi,
  bookings: bookingsApi,
  staff: staffApi,
  providerProfiles: providerProfilesApi,
};

export default api;
