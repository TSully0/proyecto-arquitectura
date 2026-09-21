import React, { useState } from 'react';
import { initialUsers } from '../../data/repositories/users';
import "../../styles/auth.css";

interface RegisterPageProps {
    onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validDomains = ['@gmail.com', '@hotmail.com', '@email.com'];
        const isValidDomain = validDomains.some((domain) => email.toLowerCase().endsWith(domain));

        if (!isValidDomain) {
            setError('El correo debe terminar estrictamente en @gmail.com, @hotmail.com o @email.com');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const storedUsers = localStorage.getItem('app_users');
        const currentUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;

        const userExists = currentUsers.some((u: { email: string }) => u.email === email);
        if (userExists) {
            setError('Este correo electrónico ya está registrado.');
            return;
        }

        const newUser = {
            id: String(currentUsers.length + 1),
            name,
            email,
            password,
            role: 'user' as const
        };

        const updatedUsers = [...currentUsers, newUser];
        localStorage.setItem('app_users', JSON.stringify(updatedUsers));
        
        initialUsers.push(newUser);
        setSuccess(true);

        setTimeout(() => {
            onNavigateToLogin();
        }, 1500);
    };

    return (
        <div className="auth-container">
            <h2>Crear Cuenta</h2>
            {error && <p>{error}</p>}
            {success && <p style={{ color: '#005580' }}>¡Usuario creado con éxito! Redirigiendo al login...</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>Nombre de usuario:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required
                    />
                </div>
                <div>
                    <label>Correo (@gmail, @hotmail, @email):</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
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
                <div>
                    <label>Confirmar contraseña:</label>
                    <div className="password-wrapper">
                        <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required
                        />
                        <button 
                            type="button" 
                            className="eye-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>
                <button type="submit">
                    Registrarse
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                ¿Ya tienes cuenta? <button onClick={onNavigateToLogin}>Inicia sesión</button>
            </p>
        </div>
    );
};