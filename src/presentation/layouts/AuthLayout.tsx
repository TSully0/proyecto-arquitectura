import type { ReactNode } from 'react';

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
        <div className="auth-container">
            {children}
        </div>
        </div>
    );
}