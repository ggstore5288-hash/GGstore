import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Package,
    title = "No items found",
    message = "Get started by creating your first item.",
    actionLabel,
    onAction
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-3xl)',
            textAlign: 'center',
            minHeight: '400px'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--color-bg-secondary)',
                border: '2px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-lg)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                <Icon size={48} color="var(--color-text-muted)" />
            </div>

            <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-sm)',
                fontFamily: 'Orbitron, sans-serif'
            }}>
                {title}
            </h3>

            <p style={{
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-lg)',
                maxWidth: '400px'
            }}>
                {message}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--color-primary)',
                        color: '#000',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
