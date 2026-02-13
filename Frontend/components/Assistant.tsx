
import React, { useState } from 'react';
import { getAIAssistance } from '../services/geminiService';

export const Assistant: React.FC<{ context: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const res = await getAIAssistance(query, context);
    setResponse(res || '');
    setLoading(false);
    setQuery('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2rem] shadow-2xl w-80 md:w-96 overflow-hidden border border-slate-200 flex flex-col max-h-[550px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 flex justify-between items-center">
            <h3 className="text-white font-black flex items-center text-sm uppercase tracking-wider">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Smart Reserva
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-orange-200 hover:text-white transition-colors bg-white/10 p-1 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-grow bg-slate-50 min-h-[200px]">
            {response ? (
              <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-sm text-slate-700 leading-relaxed animate-in fade-in zoom-in duration-300">
                {response}
              </div>
            ) : (
              <div className="text-center py-6">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">¿En qué puedo ayudarte hoy?</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-2">
                <div className="animate-bounce flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="p-4 border-t bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pregunta algo..."
                className="w-full pl-4 pr-12 py-3 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-orange-500 outline-none text-sm transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-md shadow-orange-600/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-all transform active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      )}
    </div>
  );
};
