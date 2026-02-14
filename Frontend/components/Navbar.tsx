
import React from 'react';
import { UserRole } from '../types';

interface NavbarProps {
  user: any;
  providerProfile?: any;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, providerProfile, onLogout, onNavigate }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            {/* Trend-setting Logo */}
            <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-orange-500/30 transform group-hover:rotate-6 transition-all duration-300">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12c0 3.86-3.14 7-7 7s-7-3.14-7-7 3.14-7 7-7 7 3.14 7 7zm-7-5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" opacity=".4"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L11 11.17V6h2v4.17l4.59-4.59L19 7l-7 7-7-7 1.41-1.42L11 11.17l5.59-5.59L18 7l-1.41 1.41-1.42-1.42z" className="hidden"/>
                <path d="M13 7h-2v5.41l4.29 4.29 1.41-1.41L13 11.59V7z"/>
                <path d="M7 7h2v10H7V7z" opacity=".3"/>
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Reserva<span className="text-orange-600">Ya</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="text-slate-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Mi Panel
                </button>
                <div className="flex items-center ml-4 pl-4 border-l border-slate-200">
                  <span className="text-sm text-slate-700 mr-3 font-bold">{user.name}</span>
                  <img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-orange-100 shadow-sm" alt="Avatar" />
                  <button 
                    onClick={onLogout}
                    className="ml-4 text-xs uppercase tracking-widest text-slate-400 hover:text-red-500 font-black transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login-client')}
                  className="text-slate-600 hover:text-orange-600 px-3 py-2 text-sm font-bold transition-colors"
                >
                  Soy Cliente
                </button>
                <button 
                  onClick={() => onNavigate('login-provider')}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 active:scale-95"
                >
                  Soy Prestador
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
             <button className="text-slate-600 p-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
