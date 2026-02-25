import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <style>{`
                .auth-layout {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-bg-primary);
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(0, 217, 255, 0.1) 0%, transparent 20%),
                        radial-gradient(circle at 90% 80%, rgba(0, 217, 255, 0.05) 0%, transparent 20%);
                    padding: var(--spacing-md);
                }
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-xl);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                }
                .auth-logo {
                    text-align: center;
                    margin-bottom: var(--spacing-xl);
                }
                .auth-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    color: var(--color-cyan-primary);
                    margin-bottom: var(--spacing-xs);
                }
                .auth-subtitle {
                    color: var(--color-text-muted);
                    font-size: 14px;
                }
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-label {
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }
                .form-input {
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    padding: 12px;
                    color: var(--color-text-primary);
                    font-family: 'Inter', sans-serif;
                }
                .form-input:focus {
                    border-color: var(--color-cyan-primary);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
                }
                .auth-btn {
                    background: linear-gradient(135deg, var(--color-cyan-primary) 0%, var(--color-cyan-glow) 100%);
                    color: var(--color-bg-primary);
                    border: none;
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    margin-top: var(--spacing-sm);
                }
                .auth-btn:hover {
                    opacity: 0.9;
                }
                .auth-footer {
                    margin-top: var(--spacing-lg);
                    text-align: center;
                    font-size: 14px;
                    color: var(--color-text-muted);
                }
                .auth-link {
                    color: var(--color-cyan-primary);
                    text-decoration: none;
                }
                .auth-link:hover {
                    text-decoration: underline;
                }
                .error-message {
                    background: rgba(255, 50, 50, 0.1);
                    color: #ff4444;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    margin-bottom: 10px;
                    border-left: 3px solid #ff4444;
                }
            `}</style>

            <div className="auth-card">
                <div className="auth-logo">
                    <h1 className="auth-title">SUB HUB</h1>
                    <p className="auth-subtitle">Premium Gaming Access</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
