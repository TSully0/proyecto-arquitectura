import { useEffect } from 'react';
import { AppRouter } from './presentation/routes/AppRouter';
import { initialUsers } from './data/repositories/users';

import './styles/auth.css';
import './styles/home.css';

function App() {

  // 🔥 cargar usuarios iniciales (mock)
  useEffect(() => {
    const storedUsers = localStorage.getItem('app_users');

    if (!storedUsers) {
      localStorage.setItem('app_users', JSON.stringify(initialUsers));
    }
  }, []);

  return (
    <main className="app-main">
      <AppRouter />
    </main>
  );
}

export default App;