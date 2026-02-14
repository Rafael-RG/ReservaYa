
import React from 'react';
import { Staff, Service, ProviderProfile, ServiceType } from './types';

export const MOCK_PROVIDERS: ProviderProfile[] = [
  {
    id: '6fb1ebaf-261e-411d-bf04-59fcb1609008',
    name: 'Estética Alpha',
    slug: 'estetica-alpha',
    description: 'Transformamos tu estilo con los mejores profesionales en peluquería y barbería. Más de 10 años creando tendencias en el corazón de la ciudad.',
    heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1600',
    category: 'Belleza',
    themeColor: 'orange',
    address: 'Av. Libertador 1234, CABA',
    phone: '+54 11 4455-6677',
    instagram: '@estetica_alpha',
    workingHours: [
      { day: 'Lunes a Viernes', hours: '09:00 - 20:00' },
      { day: 'Sábados', hours: '10:00 - 18:00' },
      { day: 'Domingos', hours: 'Cerrado', closed: true }
    ]
  },
  {
    id: 'p2',
    name: 'FisioSport Pro',
    slug: 'fisiosport-pro',
    description: 'Recuperación muscular y fisioterapia avanzada para deportistas de alto rendimiento.',
    heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600',
    category: 'Salud',
    themeColor: 'emerald',
    address: 'Calle Falsa 456, Rosario',
    phone: '+54 341 9988-1122',
    workingHours: [
      { day: 'Lunes a Viernes', hours: '08:00 - 21:00' },
      { day: 'Fines de semana', hours: 'Guardias pasivas', closed: false }
    ]
  },
  {
    id: 'p3',
    name: 'Zen Yoga Studio',
    slug: 'zen-yoga',
    description: 'Encuentra tu equilibrio interior en nuestras clases grupales de Hatha y Vinyasa. Un espacio diseñado para la paz mental.',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600',
    category: 'Bienestar',
    themeColor: 'purple',
    address: 'Pueyrredón 890, Córdoba',
    phone: '+54 351 123-4567',
    instagram: '@zenyoga_studio',
    workingHours: [
      { day: 'Todos los días', hours: '07:00 - 22:00' }
    ]
  }
];

export const MOCK_STAFF: Staff[] = [
  { id: 'st1', providerId: '6fb1ebaf-261e-411d-bf04-59fcb1609008', name: 'Alex Rivera', role: 'Estilista Senior', avatar: 'https://i.pravatar.cc/150?u=st1' },
  { id: 'st2', providerId: '6fb1ebaf-261e-411d-bf04-59fcb1609008', name: 'Maria Luz', role: 'Colorista Experta', avatar: 'https://i.pravatar.cc/150?u=st2' },
  { id: 'st4', providerId: 'p2', name: 'Dr. Lucas', role: 'Kinesiólogo', avatar: 'https://i.pravatar.cc/150?u=st4' },
  { id: 'st5', providerId: 'p3', name: 'Indra Devi', role: 'Master Yogi', avatar: 'https://i.pravatar.cc/150?u=st5' }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    providerId: '6fb1ebaf-261e-411d-bf04-59fcb1609008',
    name: 'Corte de Cabello Premium',
    description: 'Corte clásico o moderno con asesoramiento de imagen profesional e hidratación profunda.',
    price: 2500,
    durationMinutes: 45,
    category: 'Cortes',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400',
    requiresStaffSelection: true,
    type: ServiceType.APPOINTMENT
  },
  {
    id: 's2',
    providerId: '6fb1ebaf-261e-411d-bf04-59fcb1609008',
    name: 'Barba & Toalla Caliente',
    description: 'Ritual tradicional de afeitado con vapor y aceites esenciales.',
    price: 1500,
    durationMinutes: 30,
    category: 'Barbería',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
    requiresStaffSelection: true,
    type: ServiceType.APPOINTMENT
  },
  {
    id: 's4',
    providerId: 'p3',
    name: 'Clase Grupal Yoga Flow',
    description: 'Sesión fluida para todos los niveles. Máximo 10 personas.',
    price: 1200,
    durationMinutes: 75,
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400',
    requiresStaffSelection: false,
    type: ServiceType.EVENT,
    maxCapacity: 10
  }
];

export const DEMO_CLIENT = {
  id: 'c1',
  email: 'cliente@demo.com',
  name: 'Juan Pérez',
  role: 'CLIENT' as any,
  avatar: 'https://i.pravatar.cc/150?u=c1'
};

export const DEMO_PROVIDER = {
  id: '6fb1ebaf-261e-411d-bf04-59fcb1609008',
  email: 'proveedor@demo.com',
  name: 'Estética Alpha',
  role: 'PROVIDER' as any,
  avatar: 'https://i.pravatar.cc/150?u=p1'
};
