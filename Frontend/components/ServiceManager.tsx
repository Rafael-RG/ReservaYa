import React, { useState, useEffect } from 'react';
import { ServiceType, Staff, Service } from '../types';
import { useServices } from '../hooks/useApi';
import { staffApi } from '../services/apiService';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

interface ServiceManagerProps {
  providerId: string;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ providerId }) => {
  const { services, loading, error, fetchServices, createService, updateService, deleteService } = useServices();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; service: Service | null }>({ show: false, service: null });
  
  // Formulario de creación
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    category: '',
    type: ServiceType.APPOINTMENT,
    image: '',
    requiresStaffSelection: false,
    maxCapacity: undefined as number | undefined,
    assignedStaffIds: [] as string[]
  });

  // Cargar servicios y personal del provider al montar
  useEffect(() => {
    fetchServices();
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await staffApi.getByProvider(providerId);
      setStaffList(data);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    }
  };

  // Filtrar servicios por provider
  const myServices = services.filter(s => s.providerId === providerId);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      category: service.category,
      type: service.type as ServiceType,
      image: service.image || '',
      requiresStaffSelection: service.requiresStaffSelection,
      maxCapacity: service.maxCapacity,
      assignedStaffIds: service.assignedStaffIds || []
    });
    setShowCreateForm(true);
  };

  const handleDelete = (service: Service) => {
    setConfirmDelete({ show: true, service });
  };

  const executeDelete = async () => {
    if (!confirmDelete.service) return;

    try {
      await deleteService(confirmDelete.service.id, providerId);
      success('Servicio eliminado exitosamente!');
      await fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      showError('Error al eliminar el servicio. Intenta nuevamente.');
    } finally {
      setConfirmDelete({ show: false, service: null });
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
      category: '',
      type: ServiceType.APPOINTMENT,
      image: '',
      requiresStaffSelection: false,
      maxCapacity: undefined,
      assignedStaffIds: []
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (editingService) {
        // Actualizar servicio existente
        await updateService(editingService.id, {
          ...editingService,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          durationMinutes: formData.durationMinutes,
          category: formData.category,
          type: formData.type,
          image: formData.image || undefined,
          requiresStaffSelection: formData.requiresStaffSelection,
          maxCapacity: formData.maxCapacity,
          assignedStaffIds: formData.assignedStaffIds
        });
        success('Servicio actualizado exitosamente!');
      } else {
        // Crear nuevo servicio
        await createService({
          providerId,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          durationMinutes: formData.durationMinutes,
          category: formData.category,
          type: formData.type,
          image: formData.image || undefined,
          requiresStaffSelection: formData.requiresStaffSelection,
          maxCapacity: formData.maxCapacity,
          assignedStaffIds: formData.assignedStaffIds
        });
        success('Servicio creado exitosamente!');
      }

      // Limpiar formulario y cerrar
      setFormData({
        name: '',
        description: '',
        price: 0,
        durationMinutes: 30,
        category: '',
        type: ServiceType.APPOINTMENT,
        image: '',
        requiresStaffSelection: false,
        maxCapacity: undefined,
        assignedStaffIds: []
      });
      setEditingService(null);
      setShowCreateForm(false);
      
      // Recargar servicios
      await fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
      showError(`Error al ${editingService ? 'actualizar' : 'crear'} el servicio. Intenta nuevamente.`);
    } finally {
      setCreating(false);
    }
  };

  const getServiceTypeLabel = (type: ServiceType) => {
    const labels = {
      [ServiceType.APPOINTMENT]: '👤 Cita',
      [ServiceType.EVENT]: '🎉 Evento',
      [ServiceType.ON_SITE]: '🏠 A Domicilio',
      [ServiceType.TABLE]: '🍽️ Mesa'
    };
    return labels[type];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mis Servicios</h2>
          <p className="text-slate-500 font-medium mt-2">Gestiona tus servicios y precios</p>
        </div>
        <button
          onClick={() => {
            if (showCreateForm) {
              handleCancelEdit();
            } else {
              setShowCreateForm(true);
            }
          }}
          className="bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-orange-700 shadow-xl transition-all active:scale-95"
        >
          {showCreateForm ? '✕ Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
          <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
            {editingService ? '✏️ Editar Servicio' : '+ Crear Nuevo Servicio'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Corte de cabello premium"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe qué incluye tu servicio..."
                rows={3}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium text-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precio */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                />
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number.parseInt(e.target.value) })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Belleza, Salud, etc."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                />
              </div>

              {/* Tipo de Servicio */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Tipo de Servicio *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                >
                  <option value={ServiceType.APPOINTMENT}>👤 Cita (individual)</option>
                  <option value={ServiceType.EVENT}>🎉 Evento (grupal)</option>
                  <option value={ServiceType.ON_SITE}>🏠 A Domicilio</option>
                  <option value={ServiceType.TABLE}>🍽️ Mesa (restaurante)</option>
                </select>
              </div>
            </div>

            {/* URL de Imagen */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                URL de Imagen (opcional)
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium text-lg"
              />
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresStaffSelection}
                  onChange={(e) => setFormData({ ...formData, requiresStaffSelection: e.target.checked })}
                  className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-bold text-slate-700">
                  Requiere selección de personal
                </span>
              </label>

              {/* Selección de Personal - Solo visible si requiresStaffSelection está activo */}
              {formData.requiresStaffSelection && staffList.length > 0 && (
                <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                    👥 Personal Asignado a este Servicio
                  </label>
                  <p className="text-xs text-slate-500 mb-4">
                    Selecciona qué miembros de tu personal pueden realizar este servicio
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {staffList.map(staff => (
                      <label
                        key={staff.id}
                        className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl border-2 border-slate-100 hover:border-orange-300 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedStaffIds.includes(staff.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedStaffIds: [...formData.assignedStaffIds, staff.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedStaffIds: formData.assignedStaffIds.filter(id => id !== staff.id)
                              });
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=007bff&color=fff`;
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-900">{staff.name}</p>
                          <p className="text-xs text-slate-500">{staff.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {formData.assignedStaffIds.length === 0 && (
                    <p className="text-sm text-orange-600 font-bold mt-3 text-center">
                      ⚠️ No has seleccionado ningún personal
                    </p>
                  )}
                  {formData.assignedStaffIds.length > 0 && (
                    <p className="text-sm text-green-600 font-bold mt-3 text-center">
                      ✅ {formData.assignedStaffIds.length} {formData.assignedStaffIds.length === 1 ? 'persona seleccionada' : 'personas seleccionadas'}
                    </p>
                  )}
                </div>
              )}
              
              {formData.requiresStaffSelection && staffList.length === 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-amber-800 font-bold text-center">
                    ℹ️ No tienes personal registrado. Ve a la sección "👥 Mi Personal" para agregar personal primero.
                  </p>
                </div>
              )}

              {(formData.type === ServiceType.EVENT || formData.type === ServiceType.TABLE) && (
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                    Capacidad Máxima (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity || ''}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value ? Number.parseInt(e.target.value) : undefined })}
                    placeholder="Número de personas"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-orange-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating && '⏳ Guardando...'}
                {!creating && editingService && '✓ Actualizar Servicio'}
                {!creating && !editingService && '✓ Crear Servicio'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-8 py-5 rounded-[1.5rem] font-black text-xl text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de servicios */}
      <div>
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 font-bold">Cargando servicios...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 text-center">
            <p className="text-red-600 font-bold">❌ {error}</p>
          </div>
        )}

        {!loading && !error && myServices.length === 0 && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-slate-600 font-bold text-xl">Aún no tienes servicios creados</p>
            <p className="text-slate-500 mt-2">Haz clic en "Nuevo Servicio" para comenzar</p>
          </div>
        )}

        {!loading && !error && myServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-[2.5rem] shadow-lg p-8 border border-slate-100 hover:border-orange-200 transition-all group"
              >
                {service.image && (
                  <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-slate-900">{service.name}</h3>
                  <span className="text-orange-600 font-black text-2xl">${service.price}</span>
                </div>

                <p className="text-slate-600 mb-4 font-medium line-clamp-2">{service.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-black uppercase tracking-wider">
                    {getServiceTypeLabel(service.type)}
                  </span>
                  <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-black uppercase tracking-wider">
                    {service.durationMinutes} min
                  </span>
                  <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-black uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                {service.requiresStaffSelection && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>👥</span>
                    <span className="font-bold">Requiere selección de personal</span>
                  </div>
                )}

                {Boolean(service.maxCapacity) && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                    <span>🎫</span>
                    <span className="font-bold">Capacidad: {service.maxCapacity} personas</span>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all active:scale-95 shadow-md"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95 shadow-md"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Eliminar Servicio"
        message={`¿Estás seguro de eliminar "${confirmDelete.service?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ show: false, service: null })}
      />
    </div>
  );
};
