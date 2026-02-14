
import React, { useState, useEffect } from 'react';
import { UserRole, User, Service, Booking } from './types';
import { MOCK_SERVICES, DEMO_CLIENT, DEMO_PROVIDER, MOCK_PROVIDERS } from './constants';
import { Navbar } from './components/Navbar';
import { Assistant } from './components/Assistant';
import { BookingModal } from './components/BookingModal';
import { ServiceManager } from './components/ServiceManager';
import { StaffManager } from './components/StaffManager';
import { useServices, useBookings, useProviderProfiles } from './hooks/useApi';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('home'); 
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reservas' | 'personal' | 'servicios' | 'suscripcion'>('reservas');
  
  // API Integration
  const { 
    services, 
    error: servicesError, 
    fetchServices 
  } = useServices();
  
  const { 
    bookings, 
    createBooking,
    cancelBooking: apiCancelBooking
  } = useBookings();
  
  const {
    profiles,
    fetchProfiles
  } = useProviderProfiles();
  
  // Fallback to mock data if API fails or is loading
  const displayServices = services.length > 0 ? services : MOCK_SERVICES;
  const displayProviders = profiles.length > 0 ? profiles : MOCK_PROVIDERS;
  
  // Modals & Flow States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [isMPSubscribing, setIsMPSubscribing] = useState(false);

  // Load data from API on component mount
  useEffect(() => {
    console.log('🔄 Loading data from backend API...');
    fetchServices();
    fetchProfiles();
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

  const loginAsClient = () => {
    setUser(DEMO_CLIENT);
    setView('dashboard');
  };

  const loginAsProvider = () => {
    setUser(DEMO_PROVIDER);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleCancelBooking = async (bookingId: string) => {
    const roleText = user?.role === UserRole.CLIENT ? 'tu reserva' : 'la reserva del cliente';
    if (confirm(`¿Estás seguro de que deseas cancelar ${roleText}? Esta acción es irreversible.`)) {
      try {
        await apiCancelBooking(bookingId);
        alert('Reserva cancelada exitosamente.');
      } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Hubo un error al cancelar la reserva. Por favor intenta nuevamente.');
      }
    }
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt('ADVERTENCIA: ¿Realmente deseas cerrar tu cuenta permanentemente? Para confirmar, escribe "ELIMINAR MI CUENTA":');
    if (confirmation === 'ELIMINAR MI CUENTA') {
      setUser(null);
      setView('home');
      alert('Tu cuenta y todos tus datos asociados han sido eliminados de ReservaYa.');
    } else if (confirmation !== null) {
      alert('Confirmación incorrecta. El cierre de cuenta ha sido cancelado.');
    }
  };

  const handleMPSubscribe = () => {
    setIsMPSubscribing(true);
    // Simulate Mercado Pago Redirect/Process
    setTimeout(() => {
      setIsMPSubscribing(false);
      alert('¡Suscripción Pro activada con éxito a través de Mercado Pago! Ya tienes acceso ilimitado a todas las herramientas de ReservaYa.');
    }, 2000);
  };

  const startBookingFlow = (service: Service) => {
    if (!user) {
      setView('login-client');
      return;
    }
    setSelectedServiceForBooking(service);
    setIsBookingModalOpen(true);
  };

  const completeBooking = async (details: Partial<Booking>) => {
    if (!user || !selectedServiceForBooking) return;
    
    const newBookingData: Partial<Booking> = {
      serviceId: selectedServiceForBooking.id,
      clientId: user.id,
      providerId: selectedServiceForBooking.providerId,
      staffId: details.staffId,
      date: details.date || '',
      time: details.time || '',
      location: details.location,
      guests: details.guests,
      notes: details.notes,
      status: 'PENDING'
    };
    
    try {
      await createBooking(newBookingData);
      setIsBookingModalOpen(false);
      setSelectedServiceForBooking(null);
      alert('¡Reserva confirmada! Podrás ver los detalles en tu panel de control.');
      setView('dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Hubo un error al crear la reserva. Por favor intenta nuevamente.');
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
              onClick={() => goToLanding('p1')}
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
    const activeBookings = bookings.filter(b => b.status === 'PENDING' && (isClient ? b.clientId === user.id : b.providerId === user.id));
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-orange-600 font-black text-sm uppercase tracking-[0.3em] mb-3 block">Panel de Gestión</span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">{user.name}</h1>
            <p className="text-slate-500 font-medium text-xl mt-3">
              {isClient ? 'Controle sus próximas citas agendadas.' : 'Administre sus servicios y suscriptores hoy.'}
            </p>
          </div>
          {!isClient && (
            <button 
              onClick={() => goToLanding('p1')}
              className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
            >
              Ver Mi Landing Pública
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs para proveedores */}
            {!isClient && (
              <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-slate-100 overflow-x-auto">
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
                </div>

                {/* Tab Content */}
                <div className="p-10 md:p-14">
                  {/* Tab: Reservas */}
                  {activeTab === 'reservas' && (
                    <div>
                      <h2 className="text-3xl font-black mb-10 flex items-center text-slate-900 tracking-tight">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mr-5 shadow-inner">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        Agenda de Reservas
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
                                <div className="flex items-center gap-4 mt-8 sm:mt-0">
                                   <button 
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="px-8 py-4 bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 hover:border-red-100 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                                   >
                                     Cancelar Reserva
                                   </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold text-xl">Sin actividad pendiente.</p>
                          </div>
                        )}
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
                          <div className="flex items-center gap-4 mt-8 sm:mt-0">
                             <button 
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-8 py-4 bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 hover:border-red-100 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                             >
                               Cancelar Reserva
                             </button>
                          </div>
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

          <aside className="space-y-12">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100">
               <h3 className="font-black text-slate-900 mb-10 uppercase tracking-[0.3em] text-[10px]">Cuenta y Seguridad</h3>
               <div className="flex items-center mb-12">
                 <img src={user.avatar} className="w-20 h-20 rounded-[2rem] mr-6 border-4 border-slate-50 shadow-xl" alt="avatar" />
                 <div>
                   <p className="font-black text-slate-900 text-2xl leading-none mb-1">{user.name}</p>
                   <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full inline-block">{user.role}</p>
                 </div>
               </div>
               <nav className="space-y-4">
                 <button onClick={handleLogout} className="w-full text-left px-6 py-5 rounded-[1.5rem] text-sm font-black text-slate-600 hover:bg-slate-50 transition flex items-center group">
                   <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-5 group-hover:bg-slate-200 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                   </div>
                   Cerrar Sesión
                 </button>
                 <div className="pt-8 mt-8 border-t border-slate-100">
                    <button 
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-6 py-5 rounded-[1.5rem] text-sm font-black text-red-500 bg-red-50/30 hover:bg-red-50 transition flex items-center group"
                    >
                      <div className="w-10 h-10 bg-red-100/50 rounded-xl flex items-center justify-center mr-5 text-red-400 group-hover:text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </div>
                      Cerrar Cuenta Definitivamente
                    </button>
                 </div>
               </nav>
            </div>
          </aside>
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

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-orange-100 selection:text-orange-900">
      <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
      
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
    </div>
  );
};

export default App;
