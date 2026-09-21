import { useState } from 'react';
import { LoginPage } from './presentation/pages/LoginPage';
import { RegisterPage } from './presentation/pages/RegisterPage';
import { type User } from './business/types/user';
import './styles/auth.css';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setLoggedUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setCurrentView('login');
  };

  return (
    <>
      <header className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold' }}>Software ULEAM</h1>
        
        {loggedUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {loggedUser.name} ({loggedUser.role})
            </span>
            <button 
              onClick={handleLogout} 
              style={{ padding: '5px 10px', fontSize: '13px', cursor: 'pointer', background: '#ff3333', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'normal' }}>Turismo Manta - Reseñas y Destinos</h2>
        )}
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {currentView === 'login' && (
          <LoginPage 
            onNavigateToRegister={() => setCurrentView('register')} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage 
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        )}

        {currentView === 'dashboard' && loggedUser && (
          <div className="auth-container">
            <h2>¡Bienvenido al sistema de Turismo Manta!</h2>
            <p style={{ color: '#00334d', fontWeight: 'bold', textAlign: 'center' }}>
              Aquí podrás gestionar y visualizar las reseñas y destinos turísticos.
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        © 2026 ULEAM - Software. Todos los derechos reservados.
      </footer>
    </>
  );
}

export default App;