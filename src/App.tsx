import { useEffect } from "react";
import { AppRouter } from "./presentation/routes/AppRouter";
import { ToastProvider } from "./presentation/components/ToastProvider";   // 👈 NUEVO
import { initialUsers } from "./data/repositories/users";

import "./styles/auth.css";
import "./styles/home.css";

function App() {
  // 🔥 cargar usuarios iniciales (solo primera vez)
  useEffect(() => {
    const storedUsers = localStorage.getItem("app_users");

    if (!storedUsers) {
      localStorage.setItem("app_users", JSON.stringify(initialUsers));
    }
  }, []);

  return (
    <ToastProvider>   {/* 👈 NUEVO: avisos disponibles en toda la app */}
      <main className="app-main">
        <AppRouter />
      </main>
    </ToastProvider>
  );
}

export default App;
