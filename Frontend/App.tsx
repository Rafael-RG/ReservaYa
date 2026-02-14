
import React, { useState, useEffect } from 'react';
import { UserRole, User, Service, Booking } from './types';
import { MOCK_SERVICES, DEMO_CLIENT, DEMO_PROVIDER, MOCK_PROVIDERS } from './constants';
import { Navbar } from './components/Navbar';
import { Assistant } from './components/Assistant';
import { BookingModal } from './components/BookingModal';
import { ServiceManager } from './components/ServiceManager';
import { StaffManager } from './components/StaffManager';
import { AvailabilityManager } from './components/AvailabilityManager';
import { useServices, useBookings, useProviderProfiles, useUsers, useStaff } from './hooks/useApi';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import api from './services/apiService';

const App: React.FC = () => {
  const { toasts, removeToast, success, error: showError, info } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('home'); 
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reservas' | 'metricas' | 'personal' | 'servicios' | 'horarios' | 'suscripcion' | 'configuracion'>('reservas');
  
  // Confirmation dialogs
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<{ show: boolean; bookingId: string | null }>({ show: false, bookingId: null });
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // API Integration
  const { 
    services, 
    error: servicesError, 
    fetchServices 
  } = useServices();
  
  const { 
    bookings, 
    createBooking,
    cancelBooking: apiCancelBooking,
    fetchBookingsByClient,
    fetchBookingsByProvider
  } = useBookings();
  
  const {
    profiles,
    fetchProfiles,
    updateProfile,
    createProfile
  } = useProviderProfiles();

  const {
    users,
    fetchUsers,
    createUser,
    updateUser
  } = useUsers();
  
  const {
    staff,
    fetchStaffByProvider
  } = useStaff();
  
  // Fallback to mock data if API fails or is loading
  const displayServices = services.length > 0 ? services : MOCK_SERVICES;
  const displayProviders = profiles.length > 0 ? profiles : MOCK_PROVIDERS;
  
  // Modals & Flow States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isMPSubscribing, setIsMPSubscribing] = useState(false);
  
  // Booking filters state
  const [bookingFilters, setBookingFilters] = useState({
    status: 'ALL' as 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED',
    timeRange: 'ALL' as 'ALL' | 'TODAY' | 'WEEK' | 'MONTH',
    search: '',
    staffId: 'ALL' as string
  });
  const [showAllBookings, setShowAllBookings] = useState(false);
  
  // Metrics filters state
  const today = new Date();
  const [metricsFilter, setMetricsFilter] = useState({
    month: today.getMonth(),
    year: today.getFullYear()
  });
  
  // Selected date for week view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    return new Date(date.setDate(diff));
  });
  
  // Profile edit states
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    businessName: '',
    phone: '',
    address: ''
  });

  // Load data from API on component mount
  useEffect(() => {
    console.log('🔄 Loading data from backend API...');
    fetchServices();
    fetchProfiles();
    fetchUsers();
  }, []);

  // Log API status for debugging
  useEffect(() => {
    if (services.length > 0) {
      console.log('✅ Services loaded from API:', services.length);
    }
    if (profiles.length > 0) {
      console.log('✅ Provider profiles loaded from API:', profiles.length);
    }
    if (servicesError) {
      console.log('⚠️  Services API error, using mock data:', servicesError);
    }
  }, [services, profiles, servicesError]);

  // Initialize profile edit fields when user or profiles change
  useEffect(() => {
    if (user?.role === 'PROVIDER') {
      const currentProvider = displayProviders.find(p => p.id === user.id);
      console.log('📋 Inicializando formulario con:', {
        userName: user.name,
        providerName: currentProvider?.name,
        phone: currentProvider?.phone,
        address: currentProvider?.address
      });
      
      if (currentProvider) {
        setEditingProfile({
          name: user.name || '',
          businessName: currentProvider.name || '',
          phone: currentProvider.phone || '',
          address: currentProvider.address || ''
        });
      } else {
        // If no provider profile exists, use user name
        setEditingProfile({
          name: user.name || '',
          businessName: '',
          phone: '',
          address: ''
        });
      }
    }
  }, [user, profiles]);

  const loginAsClient = () => {
    setUser(DEMO_CLIENT);
    fetchBookingsByClient(DEMO_CLIENT.id);
    setView('dashboard');
  };

  const loginAsProvider = async () => {
    // Try to load user from database first
    try {
      const dbUsers = await api.users.getAll();
      const dbUser = dbUsers.find(u => u.id === DEMO_PROVIDER.id);
      
      if (dbUser) {
        console.log('✅ Usuario cargado desde la base de datos:', dbUser);
        setUser(dbUser);
      } else {
        console.log('⚠️ Usuario no encontrado en BD, usando demo user');
        setUser(DEMO_PROVIDER);
      }
    } catch (err) {
      console.log('⚠️ Error cargando usuario, usando demo user:', err);
      setUser(DEMO_PROVIDER);
    }
    
    fetchBookingsByProvider(DEMO_PROVIDER.id);
    fetchStaffByProvider(DEMO_PROVIDER.id);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleCancelBooking = (bookingId: string) => {
    setConfirmCancelBooking({ show: true, bookingId });
  };

  const executeCancelBooking = async () => {
    if (!confirmCancelBooking.bookingId || !user) return;

    try {
      await apiCancelBooking(confirmCancelBooking.bookingId, user.id);
      success('Reserva cancelada exitosamente.');
      
      // Recargar las reservas
      if (user.role === 'client') {
        await fetchBookingsByClient(user.id);
      } else if (user.role === 'provider') {
        await fetchBookingsByProvider(user.id);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      showError('Hubo un error al cancelar la reserva. Por favor intenta nuevamente.');
    } finally {
      setConfirmCancelBooking({ show: false, bookingId: null });
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDeleteAccount(true);
  };

  const executeDeleteAccount = () => {
    setUser(null);
    setView('home');
    setConfirmDeleteAccount(false);
    info('Tu cuenta y todos tus datos asociados han sido eliminados de ReservaYa.');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSavingProfile(true);
    try {
      // Check if user exists in database, if not create it first
      let currentUser = user;
      try {
        // Try to fetch from API to see if exists
        const existingUsers = await api.users.getAll();
        const userExists = existingUsers.some(u => u.id === user.id);
        
        if (!userExists) {
          // User is a demo user, create it first
          currentUser = await createUser({
            email: user.email,
            name: editingProfile.name,
            role: user.role,
            avatar: user.avatar
          });
          setUser(currentUser);
        }
      } catch (err) {
        console.log('Error checking user existence, will try to update anyway:', err);
      }
      
      // Update user name
      const updatedUser = await updateUser(currentUser.id, {
        ...currentUser,
        name: editingProfile.name
      });
      
      // Update or create provider profile
      if (user.role === 'PROVIDER') {
        try {
          const existingProfiles = await api.providerProfiles.getAll();
          const profileExists = existingProfiles.some(p => p.id === currentUser.id);
          
          if (!profileExists) {
            // Create profile for demo provider
            await createProfile({
              id: currentUser.id,
              name: editingProfile.businessName || currentUser.name,
              slug: currentUser.id,
              description: 'Perfil creado desde configuración',
              heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1600',
              category: 'General',
              themeColor: 'orange',
              address: editingProfile.address,
              phone: editingProfile.phone,
              instagram: '',
              workingHoursJson: JSON.stringify([])
            });
          } else {
            // Update existing profile
            const currentProvider = displayProviders.find(p => p.id === currentUser.id);
            if (currentProvider) {
              console.log('📝 Actualizando perfil con datos:', {
                businessName: editingProfile.businessName,
                phone: editingProfile.phone,
                address: editingProfile.address
              });
              
              await updateProfile(currentUser.id, {
                name: editingProfile.businessName,
                description: currentProvider.description,
                heroImage: currentProvider.heroImage,
                category: currentProvider.category,
                themeColor: currentProvider.themeColor,
                phone: editingProfile.phone,
                address: editingProfile.address,
                instagram: currentProvider.instagram,
                workingHoursJson: currentProvider.workingHoursJson
              });
              
              console.log('✅ Perfil actualizado exitosamente');
            }
          }
        } catch (err) {
          console.error('Error updating provider profile:', err);
        }
      }
      
      // Update local user state
      setUser(updatedUser);
      
      // Refresh profiles to show changes everywhere
      await fetchProfiles();
      
      success('✅ Cambios guardados exitosamente');
    } catch (err) {
      console.error('Error saving profile:', err);
      showError('❌ Error al guardar los cambios. Por favor intente nuevamente.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleMPSubscribe = () => {
    setIsMPSubscribing(true);
    // Simulate Mercado Pago Redirect/Process
    setTimeout(() => {
      setIsMPSubscribing(false);
      success('¡Suscripción Pro activada con éxito a través de Mercado Pago! Ya tienes acceso ilimitado a todas las herramientas de ReservaYa.');
    }, 2000);
  };

  const startBookingFlow = (service: Service) => {
    if (!user) {
      info('Debes iniciar sesión como cliente para hacer una reserva');
      setView('login-client');
      return;
    }
    setSelectedServiceForBooking(service);
    setIsBookingModalOpen(true);
  };

  const completeBooking = async (details: Partial<Booking>) => {
    if (!user || !selectedServiceForBooking) return;
    
    const newBookingData = {
      serviceId: selectedServiceForBooking.id,
      clientId: user.id,
      providerId: selectedServiceForBooking.providerId,
      staffId: details.staffId,
      date: details.date || '',
      time: details.time || '',
      location: details.location,
      guests: details.guests,
      notes: details.notes
    };
    
    try {
      await createBooking(newBookingData);
      setIsBookingModalOpen(false);
      setSelectedServiceForBooking(null);
      success('¡Reserva confirmada! Podrás ver los detalles en tu panel de control.');
      
      // Recargar las reservas para mostrar la nueva
      if (user.role === 'client') {
        await fetchBookingsByClient(user.id);
      } else if (user.role === 'provider') {
        await fetchBookingsByProvider(user.id);
      }
      
      setView('dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      showError('Hubo un error al crear la reserva. Por favor intenta nuevamente.');
    }
  };

  const goToLanding = (id: string) => {
    setActiveProviderId(id);
    setView('landing');
  };

  const handleNavigate = (newView: string) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  // --- RENDERING VIEWS ---

  const renderHome = () => (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-950 via-orange-800 to-slate-900 py-32 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="bg-orange-500/20 text-orange-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 inline-block border border-orange-500/30">Lanzamiento Exclusivo</span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85]">Digitalice su negocio con <span className="text-orange-500">ReservaYa</span></h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-14 max-w-3xl mx-auto font-medium opacity-90">
            Obtenga su Landing Page profesional y gestione sus citas por solo <strong>$3.99/mes</strong>. Suscripción garantizada por <strong>Mercado Pago</strong>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => handleNavigate('signup-provider')}
              className="bg-orange-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl hover:bg-orange-500 transition-all shadow-2xl shadow-orange-600/40 transform hover:-translate-y-1"
            >
              Comenzar Pro con MP
            </button>
            <button 
              onClick={() => goToLanding('6fb1ebaf-261e-411d-bf04-59fcb1609008')}
              className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/20 px-10 py-6 rounded-[2.5rem] font-black text-lg hover:bg-white/20 transition-all"
            >
              Ver Demo Real
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-32 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-16 tracking-tight">Todo Incluido.</h2>
          <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border-4 border-orange-600 relative overflow-hidden group">
             <div className="absolute top-8 right-8 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="h-4" alt="Mercado Pago" />
             </div>
             <div className="flex flex-col items-center">
               <div className="flex items-baseline mb-4">
                 <span className="text-orange-600 font-black text-9xl tracking-tighter">$3.99</span>
                 <span className="text-slate-400 font-black text-2xl ml-2 uppercase">/ mes</span>
               </div>
               <p className="text-slate-500 text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">Sin límites. Sin comisiones por reserva. Solo una suscripción simple y transparente vía Mercado Pago.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-left mb-16">
                  {["Landing Page con Mapa Interactivo", "Reservas Ilimitadas Mensuales", "Soporte Multi-sucursal", "Recordatorios WhatsApp", "Dashboard de Analíticas", "Cancelaciones Instantáneas"].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <span className="font-bold text-slate-700">{f}</span>
                    </div>
                  ))}
               </div>
               <button 
                  onClick={() => handleNavigate('signup-provider')}
                  className="w-full max-w-md bg-orange-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-2xl shadow-orange-600/30 hover:scale-[1.02] transition-all active:scale-95"
               >
                 Activar Mi Negocio Pro
               </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderDashboard = () => {
    if (!user) return null;
    const isClient = user.role === UserRole.CLIENT;
    
    const BOOKINGS_PER_PAGE = 6;
    
    // Función para filtrar reservas
    const getFilteredBookings = () => {
      let filtered = bookings.filter(b => isClient ? b.clientId === user.id : b.providerId === user.id);
      
      // Filtro por estado
      if (bookingFilters.status !== 'ALL') {
        filtered = filtered.filter(b => b.status === bookingFilters.status);
      }
      
      // Filtro por staff
      if (bookingFilters.staffId !== 'ALL') {
        filtered = filtered.filter(b => b.staffId === bookingFilters.staffId);
      }
      
      // Filtro por rango de tiempo
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (bookingFilters.timeRange === 'TODAY') {
        filtered = filtered.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });
      } else if (bookingFilters.timeRange === 'WEEK') {
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate >= today && bookingDate < weekFromNow;
        });
      } else if (bookingFilters.timeRange === 'MONTH') {
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate >= today && bookingDate < monthFromNow;
        });
      }
      
      // Filtro por búsqueda
      if (bookingFilters.search.trim()) {
        const searchLower = bookingFilters.search.toLowerCase();
        filtered = filtered.filter(b => {
          const service = displayServices.find(s => s.id === b.serviceId);
          const client = users.find(u => u.id === b.clientId);
          const clientName = (b.clientName || client?.name || '').toLowerCase();
          const serviceName = (service?.name || '').toLowerCase();
          const notes = (b.notes || '').toLowerCase();
          return clientName.includes(searchLower) || serviceName.includes(searchLower) || notes.includes(searchLower);
        });
      }
      
      // Ordenar por fecha y hora
      return filtered.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });
    };
    
    const myBookings = bookings.filter(b => isClient ? b.clientId === user.id : b.providerId === user.id);
    const filteredBookings = getFilteredBookings();
    
    // Agrupar reservas por fecha
    const groupBookingsByDate = () => {
      const groups: { [key: string]: Booking[] } = {};
      filteredBookings.forEach(booking => {
        const dateKey = booking.date;
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(booking);
      });
      return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    };
    
    const bookingsByDate = groupBookingsByDate();
    const activeBookings = bookings.filter(b => b.status === 'PENDING' && (isClient ? b.clientId === user.id : b.providerId === user.id));
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-orange-600 font-black text-sm uppercase tracking-[0.3em] mb-3 block">Panel de Gestión</span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">{isClient ? user.name : currentUserProvider?.name || user.name}</h1>
            <p className="text-slate-500 font-medium text-xl mt-3">
              {isClient ? 'Controle sus próximas citas agendadas.' : 'Administre sus servicios y suscriptores hoy.'}
            </p>
          </div>
          {!isClient && (
            <button 
              onClick={() => goToLanding(user.id)}
              className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
            >
              Ver Mi Landing Pública
            </button>
          )}
        </header>

        <div className="space-y-12">
          <div className="space-y-12">
            {/* Tabs para proveedores */}
            {!isClient && (
              <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs Header */}
                <div className="flex flex-wrap border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab('reservas')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'reservas'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>📅 Reservas</span>
                    {activeBookings.length > 0 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        activeTab === 'reservas' 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {activeBookings.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('metricas')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'metricas'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>📊 Métricas</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'personal'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>👥 Personal</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('servicios')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'servicios'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🛎️ Servicios</span>
                    {(() => {
                      const myServicesCount = services.filter(s => s.providerId === user.id).length;
                      return myServicesCount > 0 && (
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          activeTab === 'servicios' 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {myServicesCount}
                        </span>
                      );
                    })()}
                  </button>
                  <button
                    onClick={() => setActiveTab('horarios')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'horarios'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>⏰ Horarios</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('suscripcion')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'suscripcion'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>💳 Suscripción</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      activeTab === 'suscripcion' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      PRO
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('configuracion')}
                    className={`flex-1 px-8 py-6 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'configuracion'
                        ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>⚙️ Configuración</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-10 md:p-14">
                  {/* Tab: Métricas */}
                  {activeTab === 'metricas' && (
                    <div>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
                        <h2 className="text-3xl font-black flex items-center text-slate-900 tracking-tight">
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mr-5 shadow-inner">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                          </div>
                          Dashboard de Métricas
                        </h2>
                        
                        {/* Selectores de Mes y Año */}
                        <div className="flex gap-3">
                          <select
                            value={metricsFilter.month}
                            onChange={(e) => setMetricsFilter(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                            className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-700 focus:border-orange-500 outline-none transition-all"
                          >
                            <option value={0}>Enero</option>
                            <option value={1}>Febrero</option>
                            <option value={2}>Marzo</option>
                            <option value={3}>Abril</option>
                            <option value={4}>Mayo</option>
                            <option value={5}>Junio</option>
                            <option value={6}>Julio</option>
                            <option value={7}>Agosto</option>
                            <option value={8}>Septiembre</option>
                            <option value={9}>Octubre</option>
                            <option value={10}>Noviembre</option>
                            <option value={11}>Diciembre</option>
                          </select>
                          
                          <select
                            value={metricsFilter.year}
                            onChange={(e) => setMetricsFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-700 focus:border-orange-500 outline-none transition-all"
                          >
                            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {(() => {
                        // Calcular métricas basadas en mes/año seleccionado
                        const myBookings = bookings.filter(b => b.providerId === user.id);
                        const myServices = services.filter(s => s.providerId === user.id);
                        
                        // Usar el mes y año del filtro
                        const selectedDate = new Date(metricsFilter.year, metricsFilter.month, 1);
                        const startOfMonth = new Date(metricsFilter.year, metricsFilter.month, 1);
                        const endOfMonth = new Date(metricsFilter.year, metricsFilter.month + 1, 0);
                        
                        // Filtrar reservas del mes seleccionado
                        const monthBookings = myBookings.filter(b => {
                          const bookingDate = new Date(b.date);
                          return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
                        });
                        
                        const totalBookings = monthBookings.length;
                        const confirmedBookings = monthBookings.filter(b => b.status === 'CONFIRMED').length;
                        const pendingBookings = monthBookings.filter(b => b.status === 'PENDING').length;
                        const cancelledBookings = monthBookings.filter(b => b.status === 'CANCELLED').length;
                        
                        const totalRevenue = monthBookings
                          .filter(b => b.status !== 'CANCELLED')
                          .reduce((sum, b) => {
                            const service = myServices.find(s => s.id === b.serviceId);
                            return sum + (service?.price || 0);
                          }, 0);
                        
                        const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100).toFixed(1) : '0';
                        
                        // Top servicios del mes seleccionado
                        const serviceBookings = myServices.map(service => ({
                          ...service,
                          bookingCount: monthBookings.filter(b => b.serviceId === service.id).length,
                          revenue: monthBookings
                            .filter(b => b.serviceId === service.id && b.status !== 'CANCELLED')
                            .reduce((sum) => sum + service.price, 0)
                        })).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);
                        
                        // Calcular semanas del mes
                        const daysInMonth = endOfMonth.getDate();
                        const weeksInMonth = Math.ceil(daysInMonth / 7);
                        
                        return (
                          <div className="space-y-8">
                            {/* KPIs Principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* Total de Reservas */}
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Reservas</span>
                                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                </div>
                                <p className="text-4xl font-black text-blue-900">{totalBookings}</p>
                                <p className="text-xs text-blue-600 font-bold mt-2">📅 {confirmedBookings} confirmadas</p>
                              </div>
                              
                              {/* Ingresos Totales */}
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border-2 border-green-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-black text-green-600 uppercase tracking-widest">Ingresos</span>
                                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  </div>
                                </div>
                                <p className="text-4xl font-black text-green-900">${totalRevenue.toLocaleString()}</p>
                                <p className="text-xs text-green-600 font-bold mt-2">💰 Del mes seleccionado</p>
                              </div>
                              
                              {/* Pendientes */}
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl border-2 border-amber-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Pendientes</span>
                                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  </div>
                                </div>
                                <p className="text-4xl font-black text-amber-900">{pendingBookings}</p>
                                <p className="text-xs text-amber-600 font-bold mt-2">✓ {confirmedBookings} confirmadas</p>
                              </div>
                              
                              {/* Tasa de Cancelación */}
                              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-3xl border-2 border-red-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-black text-red-600 uppercase tracking-widest">Cancelación</span>
                                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                  </div>
                                </div>
                                <p className="text-4xl font-black text-red-900">{cancellationRate}%</p>
                                <p className="text-xs text-red-600 font-bold mt-2">✕ {cancelledBookings} canceladas</p>
                              </div>
                            </div>
                            
                            {/* Top 5 Servicios */}
                            <div className="bg-white rounded-3xl border-2 border-slate-100 p-8">
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-slate-900">🏆 Top Servicios</h3>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Por reservas</span>
                              </div>
                              
                              {serviceBookings.length > 0 ? (
                                <div className="space-y-4">
                                  {serviceBookings.map((service, index) => {
                                    const maxBookings = serviceBookings[0]?.bookingCount || 1;
                                    const percentage = (service.bookingCount / maxBookings) * 100;
                                    
                                    return (
                                      <div key={service.id} className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-3 flex-1">
                                            <span className="text-2xl font-black text-slate-400">#{index + 1}</span>
                                            <div className="flex-1">
                                              <p className="font-black text-slate-900">{service.name}</p>
                                              <p className="text-xs text-slate-500 font-bold">${service.price} • {service.durationMinutes} min</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xl font-black text-orange-600">{service.bookingCount}</p>
                                            <p className="text-xs font-bold text-slate-500">${service.revenue.toLocaleString()}</p>
                                          </div>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <p className="text-slate-400 font-bold">No hay servicios todavía</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Actividad Reciente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Reservas del Mes */}
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Este Mes</p>
                                    <p className="text-2xl font-black text-purple-900">{monthBookings.length} reservas</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t-2 border-purple-200">
                                  <span className="text-xs font-bold text-purple-700">Promedio por semana</span>
                                  <span className="text-lg font-black text-purple-900">{(monthBookings.length / 4).toFixed(1)}</span>
                                </div>
                              </div>
                              
                              {/* Servicios Activos */}
                              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-3xl border-2 border-teal-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-teal-600 uppercase tracking-widest">Servicios</p>
                                    <p className="text-2xl font-black text-teal-900">{myServices.length} activos</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t-2 border-teal-200">
                                  <span className="text-xs font-bold text-teal-700">Precio promedio</span>
                                  <span className="text-lg font-black text-teal-900">
                                    ${myServices.length > 0 ? (myServices.reduce((sum, s) => sum + s.price, 0) / myServices.length).toFixed(0) : '0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Métricas del Personal */}
                            <div className="mt-12 pt-12 border-t-2 border-slate-100">
                              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                                <svg className="w-8 h-8 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Rendimiento del Personal
                              </h3>
                              
                              {(() => {
                                // Métricas por miembro del personal
                                const staffMetrics = staff.map(member => {
                                  const memberBookings = monthBookings.filter(b => b.staffId === member.id);
                                  const totalBookings = memberBookings.length;
                                  const confirmedBookings = memberBookings.filter(b => b.status === 'CONFIRMED').length;
                                  const cancelledBookings = memberBookings.filter(b => b.status === 'CANCELLED').length;
                                  
                                  const revenue = memberBookings
                                    .filter(b => b.status !== 'CANCELLED')
                                    .reduce((sum, b) => {
                                      const service = myServices.find(s => s.id === b.serviceId);
                                      return sum + (service?.price || 0);
                                    }, 0);
                                  
                                  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100) : 0;
                                  
                                  return {
                                    ...member,
                                    totalBookings,
                                    confirmedBookings,
                                    cancelledBookings,
                                    revenue,
                                    cancellationRate
                                  };
                                }).sort((a, b) => b.totalBookings - a.totalBookings);
                                
                                // KPIs totales del equipo
                                const teamTotalBookings = staffMetrics.reduce((sum, m) => sum + m.totalBookings, 0);
                                const teamTotalRevenue = staffMetrics.reduce((sum, m) => sum + m.revenue, 0);
                                
                                return (
                                  <div className="space-y-6">
                                    {/* KPIs del Equipo */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {/* Total Miembros */}
                                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-xs font-black text-purple-600 uppercase tracking-widest">Equipo</span>
                                          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                          </div>
                                        </div>
                                        <p className="text-4xl font-black text-purple-900">{staff.length}</p>
                                        <p className="text-xs text-purple-600 font-bold mt-2">👥 Miembros activos</p>
                                      </div>
                                      
                                      {/* Total Reservas del Equipo */}
                                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Reservas</span>
                                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                          </div>
                                        </div>
                                        <p className="text-4xl font-black text-blue-900">{teamTotalBookings}</p>
                                        <p className="text-xs text-blue-600 font-bold mt-2">📅 Del equipo</p>
                                      </div>
                                      
                                      {/* Ingresos del Equipo */}
                                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-3xl border-2 border-green-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-xs font-black text-green-600 uppercase tracking-widest">Ingresos</span>
                                          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                          </div>
                                        </div>
                                        <p className="text-4xl font-black text-green-900">${teamTotalRevenue.toLocaleString()}</p>
                                        <p className="text-xs text-green-600 font-bold mt-2">💰 Generados</p>
                                      </div>
                                    </div>
                                    
                                    {/* Ranking de Personal */}
                                    <div className="bg-white rounded-3xl border-2 border-slate-100 p-8">
                                      <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-black text-slate-900">🏆 Ranking del Personal</h3>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Por reservas</span>
                                      </div>
                                      
                                      {staffMetrics.length > 0 ? (
                                        <div className="space-y-5">
                                          {staffMetrics.map((member, index) => {
                                            const maxBookings = staffMetrics[0]?.totalBookings || 1;
                                            const percentage = maxBookings > 0 ? (member.totalBookings / maxBookings) * 100 : 0;
                                            
                                            return (
                                              <div key={member.id} className="relative">
                                                <div className="flex items-center gap-4 mb-3">
                                                  {/* Ranking */}
                                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${
                                                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                    index === 1 ? 'bg-slate-200 text-slate-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-slate-50 text-slate-400'
                                                  }`}>
                                                    #{index + 1}
                                                  </div>
                                                  
                                                  {/* Avatar y nombre */}
                                                  <img 
                                                    src={member.avatar} 
                                                    alt={member.name} 
                                                    className="w-12 h-12 rounded-2xl border-2 border-slate-100"
                                                  />
                                                  <div className="flex-1">
                                                    <p className="font-black text-slate-900">{member.name}</p>
                                                    <p className="text-xs text-slate-500 font-bold">{member.specialty}</p>
                                                  </div>
                                                  
                                                  {/* Métricas */}
                                                  <div className="text-right">
                                                    <p className="text-2xl font-black text-orange-600">{member.totalBookings}</p>
                                                    <p className="text-xs text-slate-500 font-bold">reservas</p>
                                                  </div>
                                                  <div className="text-right min-w-[100px]">
                                                    <p className="text-xl font-black text-green-600">${member.revenue.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500 font-bold">ingresos</p>
                                                  </div>
                                                  <div className="text-right min-w-[80px]">
                                                    <p className={`text-lg font-black ${
                                                      member.cancellationRate < 10 ? 'text-green-600' :
                                                      member.cancellationRate < 20 ? 'text-amber-600' :
                                                      'text-red-600'
                                                    }`}>
                                                      {member.cancellationRate.toFixed(1)}%
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-bold">cancelación</p>
                                                  </div>
                                                </div>
                                                
                                                {/* Barra de progreso */}
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-14">
                                                  <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                      index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                                      'bg-gradient-to-r from-slate-300 to-slate-400'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                  ></div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="text-center py-12">
                                          <p className="text-slate-400 font-bold">No hay miembros del personal todavía</p>
                                          <p className="text-sm text-slate-300 font-bold mt-2">Agrega miembros en la pestaña Personal</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Tab: Reservas */}
                  {activeTab === 'reservas' && (
                    <div>
                      {/* Header con búsqueda */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                        <h2 className="text-3xl font-black flex items-center text-slate-900 tracking-tight">
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mr-5 shadow-inner">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          Agenda de Reservas
                        </h2>
                        
                        {/* Barra de búsqueda */}
                        <div className="relative flex-1 max-w-xl">
                          <input
                            type="text"
                            placeholder="🔍 Buscar cliente, servicio o notas..."
                            value={bookingFilters.search}
                            onChange={(e) => setBookingFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-5 pr-12 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-sm hover:shadow-md"
                          />
                          {bookingFilters.search && (
                            <button
                              onClick={() => setBookingFilters(prev => ({ ...prev, search: '' }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all"
                            >
                              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Filtros desplegables compactos */}
                      <div className="mb-6">
                        <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Filtro por Estado */}
                            <div>
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Estado</label>
                              <select
                                value={bookingFilters.status}
                                onChange={(e) => setBookingFilters(prev => ({ ...prev, status: e.target.value as any }))}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-sm hover:bg-white"
                              >
                                <option value="ALL">🔍 Todas las reservas</option>
                                <option value="PENDING">⏳ Pendientes</option>
                                <option value="CONFIRMED">✓ Confirmadas</option>
                                <option value="CANCELLED">✕ Canceladas</option>
                              </select>
                            </div>
                            
                            {/* Filtro por Período */}
                            <div>
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Período</label>
                              <select
                                value={bookingFilters.timeRange}
                                onChange={(e) => setBookingFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-sm hover:bg-white"
                              >
                                <option value="ALL">📅 Todas las fechas</option>
                                <option value="TODAY">📍 Solo hoy</option>
                                <option value="WEEK">📆 Próximos 7 días</option>
                                <option value="MONTH">🗓️ Próximos 30 días</option>
                              </select>
                            </div>
                            
                            {/* Filtro por Personal */}
                            {!isClient && staff.length > 0 && (
                              <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Personal</label>
                                <select
                                  value={bookingFilters.staffId}
                                  onChange={(e) => setBookingFilters(prev => ({ ...prev, staffId: e.target.value }))}
                                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-orange-500 outline-none transition-all font-bold text-sm hover:bg-white"
                                >
                                  <option value="ALL">👥 Todo el personal</option>
                                  {staff.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                          
                          {/* Botón limpiar filtros */}
                          {(bookingFilters.status !== 'ALL' || bookingFilters.timeRange !== 'ALL' || bookingFilters.staffId !== 'ALL' || bookingFilters.search) && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span className="text-xs font-bold text-slate-600">
                                  <span className="font-black text-slate-900">{filteredBookings.length}</span> resultados de <span className="font-black">{myBookings.length}</span> totales
                                </span>
                              </div>
                              <button
                                onClick={() => setBookingFilters({ status: 'ALL', timeRange: 'ALL', search: '', staffId: 'ALL' })}
                                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-700 transition-all shadow-sm hover:shadow"
                              >
                                ✕ Limpiar filtros
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Selector de semana estilo tuturno.com */}
                      <div className="mb-6">
                        <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
                          {/* Navegación de semana */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => {
                                const newStart = new Date(currentWeekStart);
                                newStart.setDate(newStart.getDate() - 7);
                                setCurrentWeekStart(newStart);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                              {currentWeekStart.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                            </h3>
                            
                            <button
                              onClick={() => {
                                const newStart = new Date(currentWeekStart);
                                newStart.setDate(newStart.getDate() + 7);
                                setCurrentWeekStart(newStart);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                            >
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                          
                          {/* Días de la semana */}
                          <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, index) => {
                              const date = new Date(currentWeekStart);
                              date.setDate(date.getDate() + index);
                              const isSelected = date.toDateString() === selectedDate.toDateString();
                              const isToday = date.toDateString() === new Date().toDateString();
                              const dayBookings = filteredBookings.filter(b => 
                                new Date(b.date).toDateString() === date.toDateString()
                              );
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedDate(date)}
                                  className={`p-3 rounded-xl transition-all border-2 ${
                                    isSelected
                                      ? 'bg-orange-600 text-white border-orange-600 shadow-lg scale-105'
                                      : isToday
                                      ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="text-[10px] font-black uppercase tracking-wider mb-1">
                                    {date.toLocaleDateString('es', { weekday: 'short' })}
                                  </div>
                                  <div className="text-2xl font-black mb-1">
                                    {date.getDate()}
                                  </div>
                                  {dayBookings.length > 0 && (
                                    <div className={`text-[10px] font-black ${
                                      isSelected ? 'text-white/70' : 'text-slate-400'
                                    }`}>
                                      {dayBookings.length} {dayBookings.length === 1 ? 'cita' : 'citas'}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Reservas del día seleccionado */}
                      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
                        <div className="max-h-[calc(100vh-500px)] overflow-y-auto p-4">
                          {(() => {
                            const dayBookings = filteredBookings
                              .filter(b => new Date(b.date).toDateString() === selectedDate.toDateString())
                              .sort((a, b) => a.time.localeCompare(b.time));
                            
                            if (dayBookings.length === 0) {
                              return (
                                <div className="text-center py-24">
                                  <div className="text-6xl mb-6">📅</div>
                                  <p className="text-slate-900 font-black text-2xl mb-2">
                                    No hay reservas
                                  </p>
                                  <p className="text-slate-500 font-medium text-lg">
                                    {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="space-y-3">
                                {dayBookings.map(b => {
                                  const s = displayServices.find(srv => srv.id === b.serviceId);
                                  const client = users.find(u => u.id === b.clientId);
                                  const clientName = b.clientName || client?.name || 'Cliente';
                                  const staffMember = staff.find(sm => sm.id === b.staffId);
                                  
                                  return (
                                    <div 
                                      key={b.id} 
                                      className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-slate-200"
                                    >
                                      {/* Hora */}
                                      <div className="flex items-center justify-center shrink-0">
                                        <span className="text-xl font-black text-orange-600 min-w-[60px]">{b.time}</span>
                                      </div>
                                      
                                      {/* Información principal */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                          <h4 className="font-black text-slate-900 text-base truncate">{clientName}</h4>
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold truncate">{s?.name || 'Servicio'}</p>
                                        {staffMember && (
                                          <div className="flex items-center gap-2 mt-2">
                                            <img src={staffMember.avatar} alt={staffMember.name} className="w-5 h-5 rounded-full" />
                                            <span className="text-xs font-bold text-slate-500">{staffMember.name}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Botón cancelar */}
                                      {b.status !== 'CANCELLED' && (
                                        <div className="shrink-0">
                                          <button 
                                            onClick={() => handleCancelBooking(b.id)}
                                            className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                          >
                                            ✕ Cancelar
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Personal */}
                  {activeTab === 'personal' && (
                    <StaffManager providerId={user.id} />
                  )}

                  {/* Tab: Servicios */}
                  {activeTab === 'servicios' && (
                    <ServiceManager providerId={user.id} />
                  )}

                  {/* Tab: Horarios */}
                  {activeTab === 'horarios' && (
                    <AvailabilityManager providerId={user.id} />
                  )}

                  {/* Tab: Suscripción */}
                  {activeTab === 'suscripcion' && (
                    <div>
                      <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Suscripción Pro</h2>
                        <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="h-5 opacity-40" alt="MP" />
                      </div>
                      <div className="bg-orange-50 border-2 border-orange-100 p-10 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-10">
                        <div className="flex-grow text-center lg:text-left">
                          <h4 className="font-black text-2xl text-orange-950 mb-1">Estado: Activo</h4>
                          <p className="text-orange-800/70 font-bold text-lg">Próximo cobro: $3.99 USD • Vía Mercado Pago</p>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={handleMPSubscribe}
                            disabled={isMPSubscribing}
                            className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-all disabled:opacity-50 text-center"
                          >
                            {isMPSubscribing ? 'Conectando...' : 'Gestionar Suscripción'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Configuración */}
                  {activeTab === 'configuracion' && (
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Configuración de Cuenta</h2>
                      
                      {/* Perfil del usuario */}
                      <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-8 border border-slate-100">
                        <div className="flex items-center mb-10">
                          <img src={user.avatar} className="w-24 h-24 rounded-[2rem] mr-6 border-4 border-white shadow-xl" alt="avatar" />
                          <div>
                            <p className="font-black text-slate-900 text-3xl leading-none mb-2">{currentUserProvider?.name || user.name}</p>
                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-full inline-block">{user.role}</p>
                          </div>
                        </div>

                        <h3 className="font-black text-slate-900 text-xl mb-6 uppercase tracking-wider">Editar Información</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Tu Nombre</label>
                            <input
                              type="text"
                              value={editingProfile.name}
                              onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-bold"
                              placeholder="Ingrese su nombre personal"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Nombre del Negocio</label>
                            <input
                              type="text"
                              value={editingProfile.businessName}
                              onChange={(e) => setEditingProfile({ ...editingProfile, businessName: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-bold"
                              placeholder="Ingrese el nombre de su negocio"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Teléfono</label>
                            <input
                              type="tel"
                              value={editingProfile.phone}
                              onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-bold"
                              placeholder="Ingrese su teléfono"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Dirección</label>
                            <textarea
                              value={editingProfile.address}
                              onChange={(e) => setEditingProfile({ ...editingProfile, address: e.target.value })}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-bold resize-none"
                              rows={3}
                              placeholder="Ingrese su dirección"
                            />
                          </div>

                          <button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="w-full bg-orange-600 text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSavingProfile ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                          </button>
                        </div>
                      </div>

                      {/* Acciones de cuenta */}
                      <div className="space-y-4">
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-8 py-6 rounded-2xl text-base font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center group"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-6 group-hover:bg-slate-50 transition-colors shadow-sm">
                            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                          </div>
                          Cerrar Sesión
                        </button>
                        
                        <div className="pt-4">
                          <button 
                            onClick={handleDeleteAccount}
                            className="w-full text-left px-8 py-6 rounded-2xl text-base font-black text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center group"
                          >
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-6 group-hover:bg-red-200 transition-colors shadow-sm">
                              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </div>
                            Cerrar Cuenta Definitivamente
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vista de reservas para clientes (sin tabs) */}
            {isClient && (
              <section className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-sm border border-slate-100">
                <h2 className="text-3xl font-black mb-10 flex items-center text-slate-900 tracking-tight">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mr-5 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  Mis Turnos
                </h2>
                
                <div className="space-y-6">
                  {activeBookings.length > 0 ? (
                    activeBookings.map(b => {
                      const s = displayServices.find(srv => srv.id === b.serviceId);
                      return (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:border-orange-200">
                          <div className="w-20 h-20 bg-white rounded-3xl flex flex-col items-center justify-center border-2 border-slate-100 mr-8 text-orange-600 shrink-0 shadow-sm">
                             <span className="text-3xl font-black leading-none">{new Date(b.date).getDate() + 1}</span>
                             <span className="uppercase text-xs font-black tracking-widest">{new Date(b.date).toLocaleString('es', {month: 'short'})}</span>
                          </div>
                          <div className="flex-grow mt-6 sm:mt-0">
                            <h4 className="font-black text-slate-900 text-2xl mb-1">{s?.name || 'Servicio Especial'}</h4>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {b.time} hs
                            </p>
                          </div>
                          {b.status !== 'CANCELLED' && (
                            <div className="flex items-center gap-4 mt-8 sm:mt-0">
                               <button 
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-8 py-4 bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 hover:border-red-100 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                               >
                                 Cancelar Reserva
                               </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold text-xl">Sin actividad pendiente.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLanding = () => {
    const provider = displayProviders.find(p => p.id === activeProviderId);
    if (!provider) return renderHome();
    const providerServices = displayServices.filter(s => s.providerId === provider.id);

    return (
      <div className="min-h-screen bg-slate-50 pb-32">
        <div className="relative h-[75vh] overflow-hidden">
          <img src={provider.heroImage} className="w-full h-full object-cover" alt={provider.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-24">
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="bg-orange-600 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-2xl inline-block">{provider.category}</span>
                <h1 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none">{provider.name}</h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium opacity-90">{provider.description}</p>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Services List */}
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-20 border border-slate-100">
                <div className="flex items-center gap-6 mb-16">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Experiencias Exclusivas</h2>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 gap-12">
                  {providerServices.map(service => (
                    <div key={service.id} className="group flex flex-col md:flex-row gap-10 p-10 rounded-[3rem] bg-slate-50 border border-slate-50 hover:border-orange-200 hover:bg-white transition-all duration-500">
                      <div className="w-full md:w-56 h-56 shrink-0 overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white">
                        <img src={service.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={service.name} />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-2">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-4xl text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">{service.name}</h3>
                            <span className="text-orange-600 font-black text-3xl">${service.price}</span>
                          </div>
                          <p className="text-slate-500 font-medium text-xl leading-relaxed mb-6">{service.description}</p>
                        </div>
                        <button 
                          onClick={() => startBookingFlow(service)}
                          className="bg-slate-900 text-white px-12 py-5 rounded-[1.8rem] font-black text-xl hover:bg-orange-600 shadow-2xl transition-all active:scale-95 self-start"
                        >
                          Reservar Ahora
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map & Location Section */}
              <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-20 border border-slate-100">
                <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Nuestra Ubicación</h2>
                <div className="aspect-video bg-slate-100 rounded-[3rem] overflow-hidden border-2 border-slate-50 relative group shadow-inner">
                   {/* Visual Map Placeholder / Integration */}
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <div className="text-center animate-pulse">
                         <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-2xl border-4 border-white">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <p className="text-slate-900 font-black text-xl">{provider.address || 'Local Alpha'}</p>
                         <p className="text-slate-500 font-bold">Ubicación verificada</p>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                   <div className="absolute bottom-10 left-10 right-10 flex justify-center">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.address || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                      >
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                         Abrir en Google Maps
                      </a>
                   </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="space-y-12">
              <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 sticky top-24">
                <h3 className="text-xl font-black text-slate-900 mb-12 uppercase tracking-[0.4em] text-[10px]">Información de Contacto</h3>
                <div className="space-y-10">
                  <div className="flex items-start gap-8 group">
                    <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección Física</p>
                      <p className="font-black text-slate-900 text-2xl leading-snug">{provider.address || 'Av. Libertador 1234'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-8 group">
                    <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Línea Directa</p>
                      <p className="font-black text-slate-900 text-2xl leading-snug">{provider.phone || '+54 11 4455-6677'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-20 pt-16 border-t border-slate-100 space-y-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Agenda de Apertura</h4>
                  {provider.workingHours?.map((hour, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xl">
                      <span className="font-bold text-slate-400">{hour.day}</span>
                      <span className={`font-black ${hour.closed ? 'text-red-400 bg-red-50 px-4 py-1 rounded-2xl' : 'text-slate-900'}`}>{hour.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLogin = (role: UserRole) => (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-600"></div>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Iniciar Sesión</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{role === UserRole.CLIENT ? 'Acceso Cliente' : 'Acceso Prestador'}</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
           <input type="email" placeholder="Email Registrado" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-xl" />
           <input type="password" placeholder="Contraseña" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-xl" />
           <button onClick={role === UserRole.CLIENT ? loginAsClient : loginAsProvider} className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-orange-700 transition-all shadow-xl active:scale-95">Entrar (Modo Demo)</button>
           <p className="text-center text-sm text-slate-500 font-medium pt-8">¿Nuevo en ReservaYa? <button onClick={() => setView(role === UserRole.CLIENT ? 'signup-client' : 'signup-provider')} className="text-orange-600 font-black hover:underline">Crea tu cuenta aquí</button></p>
        </form>
      </div>
    </div>
  );

  const renderSignUp = (role: UserRole) => (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-600"></div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Nueva Cuenta</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{role === UserRole.CLIENT ? 'Cliente Individual' : 'Prestador de Servicio Pro'}</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
           <input type="text" placeholder="Nombre completo o Negocio" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-xl" />
           <input type="email" placeholder="Correo electrónico" className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-xl" />
           {role === UserRole.PROVIDER && (
             <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
               <div className="flex justify-between items-center mb-2">
                 <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Plan Pro Anual</p>
                 <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="h-3" alt="MP" />
               </div>
               <p className="text-xs text-orange-900/60 font-medium leading-relaxed">Suscripción de $3.99/mes. Al registrarse, se activará el flujo de cobro automático de Mercado Pago.</p>
             </div>
           )}
           <button onClick={role === UserRole.CLIENT ? loginAsClient : loginAsProvider} className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-orange-700 transition-all shadow-xl active:scale-95">
             {role === UserRole.PROVIDER ? 'Comenzar Suscripción Pro' : 'Crear mi Cuenta'}
           </button>
           <p className="text-center text-sm text-slate-500 font-medium pt-8">¿Ya tienes cuenta? <button onClick={() => setView(role === UserRole.CLIENT ? 'login-client' : 'login-provider')} className="text-orange-600 font-black hover:underline">Inicia Sesión</button></p>
        </form>
      </div>
    </div>
  );

  const currentUserProvider = user?.role === 'PROVIDER' ? displayProviders.find(p => p.id === user.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-orange-100 selection:text-orange-900">
      <Navbar user={user} providerProfile={currentUserProvider} onLogout={handleLogout} onNavigate={handleNavigate} />
      
      <main className="animate-in fade-in duration-700 slide-in-from-bottom-2">
        {view === 'home' && renderHome()}
        {view === 'landing' && renderLanding()}
        {view === 'dashboard' && renderDashboard()}
        {view === 'login-client' && renderLogin(UserRole.CLIENT)}
        {view === 'login-provider' && renderLogin(UserRole.PROVIDER)}
        {view === 'signup-client' && renderSignUp(UserRole.CLIENT)}
        {view === 'signup-provider' && renderSignUp(UserRole.PROVIDER)}
      </main>

      {isBookingModalOpen && selectedServiceForBooking && (
        <BookingModal 
          service={selectedServiceForBooking} 
          onClose={() => setIsBookingModalOpen(false)}
          onConfirm={completeBooking}
        />
      )}

      <Assistant context={`Vista actual: ${view}, Usuario activo: ${user?.name || 'Invitado'}`} />
      
      <footer className="bg-slate-900 text-slate-500 py-32 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center mb-12">
            <div className="w-16 h-16 bg-orange-600 rounded-[1.8rem] flex items-center justify-center mr-6 shadow-2xl">
              <span className="text-white font-black text-3xl leading-none">R</span>
            </div>
            <span className="text-white font-black text-5xl tracking-tighter">Reserva<span className="text-orange-600">Ya</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-8 text-sm font-black uppercase tracking-[0.4em] mb-24 text-slate-400">
            <button onClick={() => handleNavigate('home')} className="hover:text-orange-500 transition-colors">Inicio</button>
            <button className="hover:text-orange-500 transition-colors">Azure Cloud</button>
            <button className="hover:text-orange-500 transition-colors">Mercado Pago</button>
            <button className="hover:text-orange-500 transition-colors">Legal</button>
          </div>
          <div className="w-full h-px bg-slate-800 mb-12"></div>
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">© 2024 RESERVAYA ORANGE PLATFORM • PWA ENABLED</p>
            <div className="flex gap-10 opacity-30 grayscale group hover:grayscale-0 transition-all">
               <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="h-5" alt="MP" />
               <span className="text-[10px] font-black text-slate-400">SECURE AZURE STORAGE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Cancel Booking Confirmation */}
      <ConfirmDialog
        isOpen={confirmCancelBooking.show}
        title="Cancelar Reserva"
        message={`¿Estás seguro de que deseas cancelar ${user?.role === UserRole.CLIENT ? 'tu reserva' : 'la reserva del cliente'}? Esta acción es irreversible.`}
        confirmText="Cancelar Reserva"
        cancelText="Volver"
        type="warning"
        onConfirm={executeCancelBooking}
        onCancel={() => setConfirmCancelBooking({ show: false, bookingId: null })}
      />

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteAccount}
        title="Eliminar Cuenta"
        message="⚠️ ADVERTENCIA: ¿Realmente deseas cerrar tu cuenta permanentemente? Se eliminarán todos tus datos, reservas e información asociada. Esta acción no se puede deshacer."
        confirmText="Eliminar Mi Cuenta"
        cancelText="Cancelar"
        type="danger"
        onConfirm={executeDeleteAccount}
        onCancel={() => setConfirmDeleteAccount(false)}
      />
    </div>
  );
};

export default App;
