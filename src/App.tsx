import { useState } from 'react';
import { LoginPage } from './presentation/pages/LoginPage';
import { RegisterPage } from './presentation/pages/RegisterPage';
import { HomePage } from './presentation/HomePage';
import { type User } from './business/types/user';
import './styles/auth.css';
import './styles/home.css';

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
      <main className="app-main">
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
          <HomePage user={loggedUser} onLogout={handleLogout} />
        )}
      </main>

    </>
  );
}

export default App;