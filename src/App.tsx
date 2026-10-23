import { AppRouter } from "./presentation/routes/AppRouter";
import { AuthProvider } from "./presentation/auth/AuthContext";
import { ToastProvider } from "./presentation/components/ui/ToastProvider";
import { initialUsers } from "./data/repositories/users";
import "./styles/auth/auth.css";
import "./styles/home/home.css";

const USERS_KEY = "app_users";

// Cargar usuarios iniciales si no existen o si los datos no son válidos.
// Se ejecuta una sola vez, antes del primer render.
const seedUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!Array.isArray(parsed)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
};

seedUsers();

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <main className="app-main">
          <AppRouter />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;