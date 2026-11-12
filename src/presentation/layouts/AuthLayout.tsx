import type { ReactNode } from 'react';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface AuthLayoutProps {
    children: ReactNode;
    fixed?: boolean;
}

export function AuthLayout({
    children,
    fixed = true,
}: AuthLayoutProps) {
    return (
        <div className={fixed ? 'auth-fixed' : undefined}>
        <ThemeToggle floating />
        <div className="auth-container">
            {children}
        </div>
        </div>
    );
}