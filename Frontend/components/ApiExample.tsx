import React, { useEffect } from 'react';
import { useServices, useBookings, useProviderProfiles } from '../hooks/useApi';

/**
 * Componente de ejemplo que demuestra cómo usar los hooks del API
 * Este componente muestra:
 * - Cómo cargar datos del backend
 * - Cómo manejar estados de loading y error
 * - Cómo crear nuevos recursos
 */
export const ApiExample: React.FC = () => {
  const { 
    services, 
    loading: servicesLoading, 
    error: servicesError, 
    fetchServices 
  } = useServices();

  const { 
    loading: bookingsLoading, 
    createBooking 
  } = useBookings();

  const { 
    profiles, 
    loading: profilesLoading,
    fetchProfiles 
  } = useProviderProfiles();

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🔄 Cargando datos del backend...');
    fetchServices();
    fetchProfiles();
  }, []);

  // Log cuando los datos se cargan
  useEffect(() => {
    if (services.length > 0) {
      console.log('✅ Servicios cargados:', services);
    }
  }, [services]);

  useEffect(() => {
    if (profiles.length > 0) {
      console.log('✅ Perfiles cargados:', profiles);
    }
  }, [profiles]);

  // Ejemplo de creación de reserva
  const handleCreateBooking = async () => {
    if (services.length === 0) {
      alert('Primero carga los servicios');
      return;
    }

    const service = services[0];
    
    try {
      const newBooking = await createBooking({
        serviceId: service.id,
        clientId: 'client-test-id', // En producción, usar el ID del usuario logueado
        providerId: service.providerId,
        date: '2026-02-20',
        time: '10:30',
        notes: 'Reserva de prueba desde el frontend'
      });

      console.log('✅ Reserva creada:', newBooking);
      alert('¡Reserva creada exitosamente!');
    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      alert('Error al crear la reserva');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        🔌 Ejemplo de Integración con el Backend
      </h1>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Este componente demuestra cómo consumir el API del backend.
        Abre la consola del navegador para ver los logs.
      </p>

      {/* Servicios */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          📋 Servicios
        </h2>

        {servicesLoading && <p>Cargando servicios...</p>}
        
        {servicesError && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            Error: {servicesError}
          </div>
        )}

        {!servicesLoading && !servicesError && (
          <>
            <p style={{ marginBottom: '10px' }}>
              Total de servicios: <strong>{services.length}</strong>
            </p>
            
            {services.length === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No hay servicios disponibles. Asegúrate de que el backend esté corriendo.
              </p>
            )}

            <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              {services.slice(0, 3).map(service => (
                <div 
                  key={service.id} 
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {service.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    {service.description}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6b35' }}>
                    ${service.price} • {service.durationMinutes} min
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Perfiles de Proveedores */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          🏢 Perfiles de Proveedores
        </h2>

        {profilesLoading && <p>Cargando perfiles...</p>}

        {!profilesLoading && (
          <>
            <p style={{ marginBottom: '10px' }}>
              Total de proveedores: <strong>{profiles.length}</strong>
            </p>

            {profiles.length === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No hay perfiles de proveedores disponibles.
              </p>
            )}

            <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              {profiles.slice(0, 3).map(profile => (
                <div 
                  key={profile.id}
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {profile.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {profile.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Acciones */}
      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f9ff' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          🎬 Acciones de Prueba
        </h2>

        <button
          onClick={handleCreateBooking}
          disabled={bookingsLoading || services.length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: services.length > 0 ? '#ff6b35' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: services.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          {bookingsLoading ? 'Creando...' : 'Crear Reserva de Prueba'}
        </button>

        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Esto creará una reserva utilizando el primer servicio disponible.
          Revisa la consola para ver el resultado.
        </p>
      </section>

      {/* Información de Conexión */}
      <section style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
          ℹ️ Información de Conexión
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
          <li style={{ marginBottom: '5px' }}>
            <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'No configurado'}
          </li>
          <li style={{ marginBottom: '5px' }}>
            <strong>Estado:</strong> {services.length > 0 ? '✅ Conectado' : '⚠️ Sin datos'}
          </li>
          <li>
            <strong>Consola:</strong> Abre DevTools (F12) para ver los logs detallados
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ApiExample;
