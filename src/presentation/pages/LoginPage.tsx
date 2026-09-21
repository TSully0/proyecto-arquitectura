import React, { useState } from 'react';
import { initialUsers } from '../../data/repositories/users';
import { type User } from '../../business/types/user';
import "../../styles/auth.css";

interface LoginPageProps {
    onNavigateToRegister: () => void;
    onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister, onLoginSuccess }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const storedUsers = localStorage.getItem('app_users');
        const currentUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;

        const foundUser = currentUsers.find(
            (u: User) => 
                (u.email.toLowerCase() === identifier.toLowerCase() || u.name.toLowerCase() === identifier.toLowerCase()) && 
                u.password === password
        );

        if (foundUser) {
            onLoginSuccess(foundUser);
        } else {
            setError('Credenciales incorrectas. Verifique su usuario/correo y contraseña.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Iniciar Sesión</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Correo o Nombre de usuario:</label>
                    <input 
                        type="text" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                        <button 
                            type="button" 
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>
                <button type="submit">
                    Entrar
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                ¿No tienes cuenta? <button onClick={onNavigateToRegister}>Regístrate aquí</button>
            </p>
        </div>
    );
};