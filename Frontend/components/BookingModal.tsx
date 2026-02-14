
import React, { useState } from 'react';
import { Service, Staff, Booking, ServiceType } from '../types';
import { MOCK_STAFF } from '../constants';

interface BookingModalProps {
  service: Service;
  onClose: () => void;
  onConfirm: (bookingDetails: Partial<Booking>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ service, onClose, onConfirm }) => {
  // Steps: 1: Setup (Location/Guests), 2: Staff, 3: Date, 4: Time, 5: Review
  const [step, setStep] = useState(service.type !== ServiceType.APPOINTMENT ? 1 : (service.requiresStaffSelection ? 2 : 3));
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const providerStaff = MOCK_STAFF.filter(s => s.providerId === service.providerId);
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleString('es', { weekday: 'short' }),
      num: d.getDate()
    };
  });

  const times = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30', '19:00'];

  const handleNext = () => {
    if (step === 1) {
      if (service.requiresStaffSelection) setStep(2);
      else setStep(3);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step === 5) setStep(4);
    else if (step === 4) setStep(3);
    else if (step === 3) {
      if (service.requiresStaffSelection) setStep(2);
      else if (service.type !== ServiceType.APPOINTMENT) setStep(1);
    } else if (step === 2) {
      if (service.type !== ServiceType.APPOINTMENT) setStep(1);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      serviceId: service.id,
      providerId: service.providerId,
      staffId: selectedStaff?.id,
      date: selectedDate,
      time: selectedTime,
      location: location,
      guests: guests,
      notes: notes
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-full">
        {/* Header */}
        <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50/50 to-amber-50/50 shrink-0">
          <div>
            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em]">Reserva Inteligente</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{service.name}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-md text-slate-400 hover:text-slate-600 hover:shadow-lg transition-all active:scale-95">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Steps Content */}
        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-10 px-2">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className={`h-2 rounded-full flex-grow mx-1 transition-all duration-500 shadow-sm ${step >= i ? 'bg-orange-600' : 'bg-slate-200'}`}></div>
             ))}
          </div>

          {/* Step 1: Specific Config */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              {service.type === ServiceType.ON_SITE && (
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-slate-900">📍 Dirección de Servicio</h4>
                  <p className="text-sm text-slate-500 font-medium">Dinos dónde quieres que realicemos el servicio.</p>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Calle, Número, Departamento, Ciudad"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-medium transition-all shadow-sm"
                  />
                </div>
              )}
              {(service.type === ServiceType.EVENT || service.type === ServiceType.TABLE) && (
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-slate-900">👥 Número de Personas</h4>
                  <p className="text-sm text-slate-500 font-medium">¿Para cuántos asistentes es la reserva? (Máximo: {service.maxCapacity || 'N/A'})</p>
                  <div className="flex items-center justify-center space-x-8">
                    <button 
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center font-black text-2xl hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                    >−</button>
                    <span className="text-4xl font-black text-orange-600 w-20 text-center">{guests}</span>
                    <button 
                      onClick={() => setGuests(Math.min(service.maxCapacity || 10, guests + 1))}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center font-black text-2xl hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Staff */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 mb-6">👤 Elige a tu profesional</h4>
              <div className="space-y-4">
                {providerStaff.map(staff => (
                  <button 
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`w-full flex items-center p-6 rounded-[2rem] border-2 transition-all ${selectedStaff?.id === staff.id ? 'border-orange-600 bg-orange-50/50 shadow-xl shadow-orange-600/10' : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow-md'}`}
                  >
                    <img src={staff.avatar} className="w-14 h-14 rounded-2xl mr-4 shadow-sm" alt={staff.name} />
                    <div className="text-left">
                      <p className="font-black text-slate-900 text-lg">{staff.name}</p>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{staff.role}</p>
                    </div>
                    {selectedStaff?.id === staff.id && (
                      <div className="ml-auto w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 mb-6">📅 Selecciona el día</h4>
              <div className="grid grid-cols-4 gap-3">
                {dates.map(date => (
                  <button 
                    key={date.full}
                    onClick={() => setSelectedDate(date.full)}
                    className={`flex flex-col items-center justify-center py-5 rounded-2xl transition-all border-2 ${selectedDate === date.full ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-600/30 scale-105' : 'bg-white text-slate-900 border-slate-200 hover:border-orange-300 hover:shadow-md'}`}
                  >
                    <span className="text-[10px] uppercase font-black opacity-60 mb-1">{date.day}</span>
                    <span className="text-lg font-black">{date.num}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Time */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-black text-slate-900 mb-6">⏰ Hora disponible</h4>
              <div className="grid grid-cols-3 gap-3">
                {times.map(time => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-5 rounded-2xl font-black text-base transition-all border-2 ${selectedTime === time ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-600/30 scale-105' : 'bg-white text-slate-900 border-slate-200 hover:border-orange-300 hover:shadow-md'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-[2rem] p-8 border-2 border-orange-100 shadow-sm space-y-6">
                 <h4 className="text-xl font-black text-slate-900 border-b-2 border-orange-100 pb-4 flex items-center gap-2">
                   ✨ Resumen de Reserva
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Servicio</p>
                      <p className="font-bold text-slate-900">{service.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuándo</p>
                      <p className="font-bold text-slate-900">{selectedDate} a las {selectedTime}</p>
                    </div>
                    {selectedStaff && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atendido por</p>
                        <p className="font-bold text-slate-900">{selectedStaff.name}</p>
                      </div>
                    )}
                    {service.type !== ServiceType.APPOINTMENT && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asistentes</p>
                        <p className="font-bold text-slate-900">{guests} persona(s)</p>
                      </div>
                    )}
                 </div>
                 {location && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ubicación</p>
                      <p className="font-bold text-slate-900">{location}</p>
                    </div>
                 )}
              </div>
              
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">💭 Notas o Pedidos Especiales</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Tengo una alergia, prefiero música suave..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none h-28 font-medium transition-all resize-none shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex space-x-4 shrink-0 border-t border-slate-100 pt-6">
          <button 
            onClick={step === 1 || (step === 2 && !service.type.includes('APPOINTMENT')) ? onClose : handleBack}
            className="flex-grow py-5 bg-slate-100 text-slate-700 rounded-[1.5rem] font-black transition-all hover:bg-slate-200 active:scale-95 shadow-sm"
          >
            {step === 1 ? 'Cancelar' : '← Atrás'}
          </button>
          
          {step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && service.type === ServiceType.ON_SITE && !location) ||
                (step === 2 && !selectedStaff) ||
                (step === 3 && !selectedDate) ||
                (step === 4 && !selectedTime)
              }
              className="flex-grow py-5 bg-orange-600 text-white rounded-[1.5rem] font-black transition-all hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-orange-600/20 active:scale-95"
            >
              Continuar →
            </button>
          ) : (
            <button 
              onClick={handleConfirm}
              className="flex-grow py-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-[1.5rem] font-black transition-all hover:from-orange-700 hover:to-amber-700 shadow-xl shadow-orange-600/30 active:scale-95 animate-pulse"
            >
              ✓ Finalizar Reserva
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
