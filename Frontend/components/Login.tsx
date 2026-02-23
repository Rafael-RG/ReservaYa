import React, { useState } from 'react';
import { UserRole } from '../types';
import '../styles/login.css';

interface LoginProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<void>;
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  onBack: () => void;
}

export default function Login({ onLogin, onRegister, onBack }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.CLIENT);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.CLIENT);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(loginEmail, loginPassword, loginRole);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegister(registerName, registerEmail, registerPassword, registerRole);
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <button onClick={onBack} className="back-to-home-btn" aria-label="Volver al inicio">
        <i className="fas fa-arrow-left"></i> Volver
      </button>

      <div className={`auth-wrapper ${isRegistering ? 'panel-active' : ''}`}>
        {/* Login Form */}
        <div className="auth-form-box login-form-box">
          <form onSubmit={handleLoginSubmit}>
            <h1>Iniciar Sesión</h1>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Google"><i className="fab fa-google"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>o usa tu cuenta</span>
            
            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value as UserRole)}
              disabled={isLoading}
              required
            >
              <option value={UserRole.CLIENT}>👤 Cliente</option>
              <option value={UserRole.PROVIDER}>🏢 Proveedor</option>
            </select>

            <input
              type="email"
              placeholder="Correo Electrónico"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <div className="mobile-switch">
              <p>¿No tienes cuenta?</p>
              <button type="button" onClick={() => setIsRegistering(true)}>Crear Cuenta</button>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="auth-form-box register-form-box">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Crear Cuenta</h1>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Google"><i className="fab fa-google"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>o usa tu email para registrarte</span>
            
            <select
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value as UserRole)}
              disabled={isLoading}
              required
            >
              <option value={UserRole.CLIENT}>👤 Cliente</option>
              <option value={UserRole.PROVIDER}>🏢 Proveedor</option>
            </select>

            <input
              type="text"
              placeholder="Nombre Completo"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Cuenta'}
            </button>
            <div className="mobile-switch">
              <p>¿Ya tienes cuenta?</p>
              <button type="button" onClick={() => setIsRegistering(false)}>Iniciar Sesión</button>
            </div>
          </form>
        </div>

        {/* Sliding Panel */}
        <div className="slide-panel-wrapper">
          <div className="slide-panel">
            <div className="panel-content panel-content-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Ingresa con tus credenciales y continúa disfrutando de ReservaYa</p>
              <button className="transparent-btn" onClick={() => setIsRegistering(false)}>
                Iniciar Sesión
              </button>
            </div>
            <div className="panel-content panel-content-right">
              <h1>¡Hola!</h1>
              <p>Comienza tu experiencia creando una cuenta con nosotros hoy</p>
              <button className="transparent-btn" onClick={() => setIsRegistering(true)}>
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
