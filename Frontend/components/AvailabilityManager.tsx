import React, { useState, useEffect } from 'react';
import { BlockedDate } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { weeklySchedulesApi, blockedDatesApi } from '../services/apiService';

interface AvailabilityManagerProps {
  providerId: string;
}

interface DaySchedule {
  enabled: boolean;
  hours: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes', emoji: '📅' },
  { key: 'tuesday', label: 'Martes', emoji: '📅' },
  { key: 'wednesday', label: 'Miércoles', emoji: '📅' },
  { key: 'thursday', label: 'Jueves', emoji: '📅' },
  { key: 'friday', label: 'Viernes', emoji: '📅' },
  { key: 'saturday', label: 'Sábado', emoji: '📅' },
  { key: 'sunday', label: 'Domingo', emoji: '📅' }
];

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ providerId }) => {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBlockDateForm, setShowBlockDateForm] = useState(false);
  const [confirmUnblock, setConfirmUnblock] = useState<{ show: boolean; dateId: string | null; date: string }>({ show: false, dateId: null, date: '' });
  
  // Horarios semanales
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, hours: '09:00-18:00' },
    tuesday: { enabled: true, hours: '09:00-18:00' },
    wednesday: { enabled: true, hours: '09:00-18:00' },
    thursday: { enabled: true, hours: '09:00-18:00' },
    friday: { enabled: true, hours: '09:00-18:00' },
    saturday: { enabled: false, hours: '09:00-14:00' },
    sunday: { enabled: false, hours: '' }
  });

  const [scheduleId, setScheduleId] = useState<string | null>(null);

  // Días bloqueados
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: ''
  });

  // Cargar horarios del backend
  useEffect(() => {
    loadSchedule();
    loadBlockedDates();
  }, [providerId]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const schedule = await weeklySchedulesApi.getByProvider(providerId);
      if (schedule) {
        setScheduleId(schedule.id);
        setWeeklySchedule({
          monday: { enabled: schedule.mondayEnabled, hours: schedule.mondayHours || '' },
          tuesday: { enabled: schedule.tuesdayEnabled, hours: schedule.tuesdayHours || '' },
          wednesday: { enabled: schedule.wednesdayEnabled, hours: schedule.wednesdayHours || '' },
          thursday: { enabled: schedule.thursdayEnabled, hours: schedule.thursdayHours || '' },
          friday: { enabled: schedule.fridayEnabled, hours: schedule.fridayHours || '' },
          saturday: { enabled: schedule.saturdayEnabled, hours: schedule.saturdayHours || '' },
          sunday: { enabled: schedule.sundayEnabled, hours: schedule.sundayHours || '' }
        });
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const dates = await blockedDatesApi.getByProvider(providerId);
      setBlockedDates(dates || []);
    } catch (error) {
      console.error('Error al cargar fechas bloqueadas:', error);
      // Si no hay fechas bloqueadas o hay error, mantener array vacío
      setBlockedDates([]);
    }
  };

  const handleDayToggle = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleHoursChange = (day: string, hours: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours
      }
    }));
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const scheduleData = {
        providerId,
        mondayEnabled: weeklySchedule.monday.enabled,
        mondayHours: weeklySchedule.monday.hours,
        tuesdayEnabled: weeklySchedule.tuesday.enabled,
        tuesdayHours: weeklySchedule.tuesday.hours,
        wednesdayEnabled: weeklySchedule.wednesday.enabled,
        wednesdayHours: weeklySchedule.wednesday.hours,
        thursdayEnabled: weeklySchedule.thursday.enabled,
        thursdayHours: weeklySchedule.thursday.hours,
        fridayEnabled: weeklySchedule.friday.enabled,
        fridayHours: weeklySchedule.friday.hours,
        saturdayEnabled: weeklySchedule.saturday.enabled,
        saturdayHours: weeklySchedule.saturday.hours,
        sundayEnabled: weeklySchedule.sunday.enabled,
        sundayHours: weeklySchedule.sunday.hours
      };

      if (scheduleId) {
        // Actualizar horario existente
        await weeklySchedulesApi.update(scheduleId, { id: scheduleId, ...scheduleData });
      } else {
        // Crear nuevo horario
        const created = await weeklySchedulesApi.create(scheduleData);
        setScheduleId(created.id);
      }
      
      success('Horarios guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      showError('Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate.date) {
      warning('Por favor selecciona una fecha');
      return;
    }

    try {
      const created = await blockedDatesApi.create({
        providerId,
        date: newBlockedDate.date,
        reason: newBlockedDate.reason || undefined
      });
      
      setBlockedDates(prev => [...prev, created]);
      setNewBlockedDate({ date: '', reason: '' });
      setShowBlockDateForm(false);
      success('Fecha bloqueada agregada');
    } catch (error) {
      console.error('Error al bloquear fecha:', error);
      showError('Error al bloquear fecha');
    }
  };

  const handleRemoveBlockedDate = (id: string, date: string) => {
    setConfirmUnblock({ show: true, dateId: id, date });
  };

  const executeUnblock = async () => {
    if (!confirmUnblock.dateId) return;

    try {
      await blockedDatesApi.delete(confirmUnblock.dateId, providerId);
      setBlockedDates(prev => prev.filter(d => d.id !== confirmUnblock.dateId));
      success('Fecha desbloqueada');
    } catch (error) {
      console.error('Error al desbloquear:', error);
      showError('Error al desbloquear fecha');
    } finally {
      setConfirmUnblock({ show: false, dateId: null, date: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Horario Semanal */}
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="mb-8">
          <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            📅 Horario Semanal
          </h3>
          <p className="text-slate-500 font-medium">Define tu horario de atención para cada día de la semana</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {DAYS_OF_WEEK.map(({ key, label, emoji }) => (
            <div
              key={key}
              className={`rounded-[2rem] border-2 transition-all ${
                weeklySchedule[key].enabled
                  ? 'bg-orange-50/30 border-orange-200 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Checkbox y Día */}
                  <label className="flex items-center gap-4 cursor-pointer min-w-[180px]">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      weeklySchedule[key].enabled
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={weeklySchedule[key].enabled}
                        onChange={() => handleDayToggle(key)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{emoji}</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">
                      {label}
                    </span>
                  </label>

                  {/* Input de Horarios */}
                  {weeklySchedule[key].enabled && (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={weeklySchedule[key].hours}
                        onChange={(e) => handleHoursChange(key, e.target.value)}
                        placeholder="09:00-13:00,15:00-19:00"
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                      />
                      <p className="text-xs text-slate-400 font-medium mt-2 ml-2">
                        💡 Ejemplo: 09:00-13:00,15:00-19:00 (separar bloques con comas)
                      </p>
                    </div>
                  )}

                  {!weeklySchedule[key].enabled && (
                    <div className="flex-1">
                      <div className="px-6 py-4 rounded-2xl bg-slate-100/50 border-2 border-dashed border-slate-200">
                        <span className="text-slate-400 font-black text-lg">🚫 Cerrado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Guardar */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="bg-orange-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && '⏳ Guardando...'}
            {!saving && '✓ Guardar Horarios'}
          </button>
        </div>
      </div>

      {/* Días Bloqueados */}
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              🚫 Fechas Bloqueadas
            </h3>
            <p className="text-slate-500 font-medium">
              Días específicos donde no recibirás reservas
            </p>
          </div>
          {!showBlockDateForm && (
            <button
              onClick={() => setShowBlockDateForm(true)}
              className="bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-orange-700 shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              + Bloquear Fecha
            </button>
          )}
        </div>

        {/* Formulario para agregar fecha bloqueada */}
        {showBlockDateForm && (
          <div className="bg-orange-50/50 border-2 border-orange-200 rounded-[2rem] p-8 mb-6">
            <h4 className="text-xl font-black text-slate-900 mb-6">➕ Agregar Nueva Fecha Bloqueada</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) => setNewBlockedDate(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={newBlockedDate.reason}
                  onChange={(e) => setNewBlockedDate(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ej: Vacaciones, Feriado, Día personal"
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-medium text-lg"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddBlockedDate}
                className="bg-orange-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-xl hover:bg-orange-700 shadow-xl transition-all active:scale-95"
              >
                ✓ Agregar Fecha
              </button>
              <button
                onClick={() => {
                  setShowBlockDateForm(false);
                  setNewBlockedDate({ date: '', reason: '' });
                }}
                className="px-8 py-5 rounded-[1.5rem] font-black text-xl text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de fechas bloqueadas */}
        {blockedDates.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4">📆</div>
            <p className="text-slate-900 font-black text-xl mb-2">
              No tienes fechas bloqueadas
            </p>
            <p className="text-slate-500 font-medium">
              Las fechas bloqueadas no estarán disponibles para reservas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...blockedDates]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(blocked => (
                <div
                  key={blocked.id}
                  className="bg-red-50/50 border-2 border-red-200 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🚫</span>
                      </div>
                      <p className="font-black text-slate-900 text-base mb-2 capitalize">
                        {new Date(blocked.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {blocked.reason && (
                        <p className="text-sm text-slate-600 font-bold bg-white/70 px-3 py-2 rounded-xl">
                          💬 {blocked.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDate(blocked.id, blocked.date)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 font-black text-lg transition-all hover:scale-110 shadow-lg"
                      title="Desbloquear fecha"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Unblock Dialog */}
      <ConfirmDialog
        isOpen={confirmUnblock.show}
        title="Desbloquear Fecha"
        message={`¿Estás seguro de desbloquear la fecha ${confirmUnblock.date ? new Date(confirmUnblock.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}?`}
        confirmText="Desbloquear"
        cancelText="Cancelar"
        type="warning"
        onConfirm={executeUnblock}
        onCancel={() => setConfirmUnblock({ show: false, dateId: null, date: '' })}
      />
    </div>
  );
};
