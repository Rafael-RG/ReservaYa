import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { staffApi } from '../services/apiService';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

interface StaffManagerProps {
  providerId: string;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ providerId }) => {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; staff: Staff | null }>({ show: false, staff: null });
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar: '',
  });

  // Cargar personal del proveedor
  useEffect(() => {
    loadStaff();
  }, [providerId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getByProvider(providerId);
      setStaffList(data);
    } catch (error) {
      console.error('Error al cargar personal:', error);
      showError('Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim()) {
      warning('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      if (editingStaff) {
        // Actualizar
        const updatedStaff: Staff = {
          ...editingStaff,
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        };
        await staffApi.update(editingStaff.id, updatedStaff);
        alert('✅ Personal actualizado exitosamente');
      } else {
        // Crear nuevo
        await staffApi.create({
          providerId,
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        });
        alert('✅ Personal agregado exitosamente');
      }

      // Resetear formulario
      setFormData({ name: '', role: '', avatar: '' });
      setEditingStaff(null);
      setShowForm(false);
      loadStaff();
    } catch (error) {
      console.error('Error al guardar personal:', error);
      showError('Error al guardar el personal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      avatar: staff.avatar,
    });
    setShowForm(true);
  };

  const handleDelete = (staff: Staff) => {
    setConfirmDelete({ show: true, staff });
  };

  const executeDelete = async () => {
    if (!confirmDelete.staff) return;

    try {
      setLoading(true);
      await staffApi.delete(confirmDelete.staff.id, providerId);
      success('Personal eliminado exitosamente');
      loadStaff();
    } catch (error) {
      console.error('Error al eliminar personal:', error);
      showError('Error al eliminar el personal');
    } finally {
      setLoading(false);
      setConfirmDelete({ show: false, staff: null });
    }
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
    setFormData({ name: '', role: '', avatar: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">👥 Mi Personal</h2>
          <p className="text-slate-500 font-medium mt-2">Gestiona tu equipo de trabajo</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-orange-700 shadow-xl transition-all active:scale-95"
          >
            + Agregar Personal
          </button>
        )}
      </div>

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
          <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
            {editingStaff ? '✏️ Editar Personal' : '➕ Nuevo Personal'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                Rol / Especialidad *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Ej: Peluquero, Mesero, Fisioterapeuta, etc."
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                URL de Foto (opcional)
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/foto.jpg"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium text-lg"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Si no proporcionas una foto, se generará una automáticamente con las iniciales
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && '⏳ Guardando...'}
                {!loading && editingStaff && '✓ Actualizar Personal'}
                {!loading && !editingStaff && '✓ Crear Personal'}
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

      {/* Lista de personal */}
      {loading && staffList.length === 0 ? (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl">⏳ Cargando personal...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-6xl mb-4">👥</p>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No tienes personal registrado aún</h3>
          <p className="text-slate-500 font-medium">
            Agrega personal para asignarlo a tus servicios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map(staff => (
            <div
              key={staff.id}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=orange&color=fff`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    {staff.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-bold">
                    {staff.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(staff)}
                  className="flex-1 bg-amber-500 text-white px-4 py-3 rounded-xl font-black text-sm hover:bg-amber-600 transition-all active:scale-95"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(staff)}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-black text-sm hover:bg-red-600 transition-all active:scale-95"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Eliminar Personal"
        message={`¿Estás seguro de eliminar a ${confirmDelete.staff?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ show: false, staff: null })}
      />
    </div>
  );
};
