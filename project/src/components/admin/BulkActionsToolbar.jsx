import React from 'react';
import { X, Trash2, Tag, FolderTree } from 'lucide-react';

const BulkActionsToolbar = ({
    selectedCount,
    onClearSelection,
    onBulkDelete,
    onBulkStatusChange,
    onBulkCategoryChange,
    categories = []
}) => {
    if (selectedCount === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 'var(--spacing-lg)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            boxShadow: '0 8px 32px rgba(0, 217, 255, 0.3), 0 0 0 1px rgba(0, 217, 255, 0.1)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out',
            minWidth: '500px'
        }}>
            {/* Selection Count */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                paddingRight: 'var(--spacing-md)',
                borderRight: '1px solid var(--color-border)'
            }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--color-primary)'
                }}>
                    {selectedCount}
                </span>
                <span style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)'
                }}>
                    selected
                </span>
            </div>

            {/* Bulk Actions */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                flex: 1
            }}>
                {/* Bulk Delete */}
                <button
                    onClick={onBulkDelete}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-danger)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-danger)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = 'var(--color-danger)';
                    }}
                >
                    <Trash2 size={14} />
                    Delete
                </button>

                {/* Bulk Status Change */}
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            onBulkStatusChange(e.target.value === 'active');
                            e.target.value = '';
                        }
                    }}
                    style={{
                        padding: '8px 12px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        minWidth: '120px'
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Change Status</option>
                    <option value="active">Set Active</option>
                    <option value="inactive">Set Inactive</option>
                </select>

                {/* Bulk Category Change */}
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            onBulkCategoryChange(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    style={{
                        padding: '8px 12px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Change Category</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Clear Selection */}
            <button
                onClick={onClearSelection}
                style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-secondary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
                title="Clear selection"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default BulkActionsToolbar;
