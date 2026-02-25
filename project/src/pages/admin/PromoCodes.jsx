import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, Tag, Copy, BarChart3, TrendingUp } from 'lucide-react';
import adminAPI from '../../api/admin';

const PromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [promoStats, setPromoStats] = useState(null);
    const [selectedPromoStats, setSelectedPromoStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        usageLimit: '',
        expirationDate: ''
    });

    useEffect(() => {
        loadPromoCodes();
        loadPromoStats();
    }, []);

    const loadPromoCodes = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getPromoCodes();
            setPromoCodes(result?.promoCodes || []);
        } catch (error) {
            console.error('Failed to load promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPromoStats = async () => {
        try {
            const result = await adminAPI.getPromoCodeStats();
            setPromoStats(result?.data);
        } catch (error) {
            console.error('Failed to load promo stats:', error);
        }
    };

    const loadPromoDetails = async (promoId) => {
        try {
            const result = await adminAPI.getPromoCodeStats(promoId);
            setSelectedPromoStats(result?.data);
            setIsDetailsModalOpen(true);
        } catch (error) {
            alert('Failed to load promo code details: ' + error.message);
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code || '',
            discountType: promo.discountType || 'percentage',
            discountValue: promo.discountValue || '',
            minPurchaseAmount: promo.minPurchaseAmount || '',
            usageLimit: promo.usageLimit || '',
            expirationDate: promo.expirationDate ? new Date(promo.expirationDate).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingPromo(null);
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchaseAmount: '',
            usageLimit: '',
            expirationDate: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            try {
                await adminAPI.deletePromoCode(id);
                loadPromoCodes();
                loadPromoStats();
            } catch (error) {
                alert('Failed to delete promo code: ' + error.message);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.togglePromoCode(id);
            loadPromoCodes();
        } catch (error) {
            alert('Failed to toggle promo code: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
            };
            if (formData.minPurchaseAmount) data.minPurchaseAmount = parseFloat(formData.minPurchaseAmount);
            if (formData.usageLimit) data.usageLimit = parseInt(formData.usageLimit);
            if (formData.expirationDate) data.expirationDate = formData.expirationDate;

            if (editingPromo) {
                await adminAPI.updatePromoCode(editingPromo._id, data);
            } else {
                await adminAPI.createPromoCode(data);
            }
            setIsModalOpen(false);
            loadPromoCodes();
            loadPromoStats();
        } catch (error) {
            alert('Failed to save promo code: ' + error.message);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="promo-codes-page">
            <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Promo Codes</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px', fontSize: '14px' }}>
                        Manage your discount codes and coupons ({promoCodes.length})
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="btn-secondary"
                        title="View Statistics"
                    >
                        <BarChart3 size={18} />
                        <span>Statistics</span>
                    </button>
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus size={18} />
                        <span>Add Promo Code</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" style={{ border: '2px solid var(--color-bg-card)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '16px' }}>Loading promo codes...</p>
                </div>
            ) : promoCodes.length === 0 ? (
                <div className="empty-state">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: 'var(--color-primary)'
                    }}>
                        <Tag size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)' }}>No Promo Codes Yet</h3>
                    <p style={{ maxWidth: '400px', marginBottom: '24px' }}>Create discount codes to boost sales and reward your loyal customers.</p>
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus size={18} />
                        Create First Code
                    </button>
                </div>
            ) : (
                <div className="promo-list-minimal">
                    {/* Grid Header */}
                    <div className="promo-grid-header-minimal">
                        <div>Code</div>
                        <div style={{ textAlign: 'center' }}>Discount</div>
                        <div style={{ textAlign: 'center' }}>Min Purchase</div>
                        <div style={{ textAlign: 'center' }}>Usage Limit</div>
                        <div style={{ textAlign: 'center' }}>Analytics</div>
                        <div style={{ textAlign: 'center' }}>Expires</div>
                        <div style={{ textAlign: 'center' }}>Status</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>

                    {/* Grid Body */}
                    <div className="promo-grid-body-minimal">
                        {promoCodes.map(promo => {
                            const active = promo.isActive && !isExpired(promo.expirationDate);
                            return (
                                <div key={promo._id} className="promo-grid-row-minimal">
                                    {/* Code Column */}
                                    <div className="promo-code-col-minimal">
                                        <div className="promo-code-container-minimal">
                                            <code className="promo-code-tag-minimal">{promo.code}</code>
                                            <button onClick={() => copyCode(promo.code)} className="copy-btn-minimal" title="Copy Code">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Discount Column */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="discount-value-minimal">
                                            {promo.discountType === 'percentage'
                                                ? `${promo.discountValue}%`
                                                : `$${promo.discountValue}`
                                            }
                                        </span>
                                    </div>

                                    {/* Min Purchase Column */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                            {promo.minPurchaseAmount ? `$${promo.minPurchaseAmount}` : 'No minimum'}
                                        </span>
                                    </div>

                                    {/* Usage Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span className="usage-text-minimal">{promo.usedCount || 0} / {promo.usageLimit || '∞'}</span>
                                        {promo.usageLimit && (
                                            <div className="usage-progress-minimal">
                                                <div
                                                    className="usage-progress-fill-minimal"
                                                    style={{ width: `${Math.min(100, Math.round(((promo.usedCount || 0) / promo.usageLimit) * 100))}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Analytics Column */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => loadPromoDetails(promo._id)}
                                            className="stats-btn-minimal"
                                            title="View Performance"
                                        >
                                            <TrendingUp size={14} />
                                            <span>Stats</span>
                                        </button>
                                    </div>

                                    {/* Expires Column */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: '13px',
                                            color: isExpired(promo.expirationDate) ? '#ef4444' : 'var(--color-text-muted)'
                                        }}>
                                            {formatDate(promo.expirationDate)}
                                        </span>
                                    </div>

                                    {/* Status Column */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span className={`status-pill ${active ? 'active' : 'inactive'}`}>
                                            <span className="status-dot"></span>
                                            {active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Actions Column */}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => loadPromoDetails(promo._id)} className="action-btn-minimal" title="View Details">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleToggle(promo._id)} className="action-btn-minimal" title={promo.isActive ? 'Deactivate' : 'Activate'}>
                                            {promo.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => handleEdit(promo)} className="action-btn-minimal" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(promo._id)} className="action-btn-minimal danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .promo-list-minimal {
                            margin-top: 24px;
                            font-family: 'Inter', sans-serif;
                        }

                        .promo-grid-header-minimal {
                            display: grid;
                            grid-template-columns: 1.5fr 1fr 1.2fr 1.2fr 1fr 1.2fr 1fr 1.5fr;
                            padding: 12px 0;
                            color: #94a3b8;
                            font-size: 13px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            border-bottom: 2px solid #1e293b;
                        }

                        .promo-grid-row-minimal {
                            display: grid;
                            grid-template-columns: 1.5fr 1fr 1.2fr 1.2fr 1fr 1.2fr 1fr 1.5fr;
                            padding: 16px 0;
                            align-items: center;
                            border-bottom: 1px solid #1e293b;
                            transition: all 0.2s ease;
                        }

                        .promo-grid-row-minimal:hover {
                            background: rgba(30, 41, 59, 0.2);
                        }

                        .promo-code-container-minimal {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }

                        .promo-code-tag-minimal {
                            background: rgba(30, 41, 59, 0.5);
                            color: #00d9ff;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-family: 'JetBrains Mono', monospace;
                            font-weight: 700;
                            font-size: 14px;
                            border: 1px solid rgba(0, 217, 255, 0.1);
                        }

                        .copy-btn-minimal {
                            background: transparent;
                            color: #64748b;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 4px;
                            border-radius: 4px;
                            transition: all 0.2s;
                        }

                        .copy-btn-minimal:hover {
                            color: #00d9ff;
                            background: rgba(0, 217, 255, 0.1);
                        }

                        .discount-value-minimal {
                            color: #00ff88;
                            font-weight: 700;
                            font-size: 18px;
                        }

                        .usage-text-minimal {
                            font-weight: 600;
                            color: #f1f5f9;
                            font-size: 14px;
                        }

                        .usage-progress-minimal {
                            width: 60px;
                            height: 4px;
                            background: #1e293b;
                            border-radius: 2px;
                            overflow: hidden;
                        }

                        .usage-progress-fill-minimal {
                            height: 100%;
                            background: #00d9ff;
                        }

                        .stats-btn-minimal {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            background: transparent;
                            color: #38bdf8;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            border: 1px solid rgba(56, 189, 248, 0.2);
                            transition: all 0.2s;
                        }

                        .stats-btn-minimal:hover {
                            background: rgba(56, 189, 248, 0.1);
                            border-color: #38bdf8;
                        }

                        .status-pill {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            padding: 6px 16px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 0.05em;
                        }

                        .status-pill.active {
                            background: rgba(16, 185, 129, 0.1);
                            color: #10b981;
                            border: 1px solid rgba(16, 185, 129, 0.2);
                        }

                        .status-pill.inactive {
                            background: rgba(239, 68, 68, 0.1);
                            color: #ef4444;
                            border: 1px solid rgba(239, 68, 68, 0.2);
                        }

                        .status-dot {
                            width: 6px;
                            height: 6px;
                            border-radius: 50%;
                            background: currentColor;
                            box-shadow: 0 0 8px currentColor;
                        }

                        .action-btn-minimal {
                            width: 36px;
                            height: 36px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: transparent;
                            color: #94a3b8;
                            border-radius: 10px;
                            border: 1px solid #1e293b;
                            transition: all 0.2s;
                        }

                        .action-btn-minimal:hover {
                            color: #ffffff;
                            background: #1e293b;
                            transform: translateY(-2px);
                        }

                        .action-btn-minimal.danger:hover {
                            background: #ef4444;
                            border-color: #ef4444;
                            box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                        }
                    ` }} />
                </div>
            )
            }

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Promo Code *</label>
                                        <input
                                            className="form-input"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            required
                                            placeholder="e.g., SAVE20"
                                            style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Discount Type *</label>
                                            <select
                                                className="form-select"
                                                value={formData.discountType}
                                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount ($)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Discount Value *</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                step="0.01"
                                                value={formData.discountValue}
                                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                                required
                                                placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Min Purchase ($)</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                step="0.01"
                                                value={formData.minPurchaseAmount}
                                                onChange={e => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Usage Limit</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                value={formData.usageLimit}
                                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                                placeholder="Unlimited"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Expiration Date</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            value={formData.expirationDate}
                                            onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                            <Save size={18} />
                                            {editingPromo ? 'Save Changes' : 'Create Code'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Statistics Modal */}
            {
                isStatsModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">Promo Code Statistics</h2>
                                <button onClick={() => setIsStatsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body">
                                {promoStats ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Codes</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{promoStats.totalCodes || 0}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active Codes</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>{promoStats.activeCodes || 0}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Expired Codes</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6464' }}>{promoStats.expiredCodes || 0}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Usage</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>{promoStats.totalUsage || 0}</div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setIsStatsModalOpen(false)} className="btn-secondary">
                                                Close
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state" style={{ padding: '40px 0' }}>
                                        <div className="spinner" style={{ border: '2px solid var(--color-bg-card)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                                        <p>Loading statistics...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Promo Code Details Modal */}
            {
                isDetailsModalOpen && selectedPromoStats && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">Promo Code Details - {selectedPromoStats.promoCode?.code}</h2>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="modal-close">
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {selectedPromoStats.promoCode && (
                                    <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Discount</div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff80' }}>
                                                    {selectedPromoStats.promoCode.discountType === 'percentage'
                                                        ? `${selectedPromoStats.promoCode.discountValue}%`
                                                        : formatCurrency(selectedPromoStats.promoCode.discountValue)
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Status</div>
                                                <span className={`status-badge ${selectedPromoStats.promoCode.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {selectedPromoStats.promoCode.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedPromoStats.usage && (
                                    <div>
                                        <h3 style={{ marginBottom: '16px' }}>Usage Statistics</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Orders</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedPromoStats.usage.totalOrders || 0}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Discount</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>
                                                    {formatCurrency(selectedPromoStats.usage.totalDiscount || 0)}
                                                </div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Revenue</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                                    {formatCurrency(selectedPromoStats.usage.totalRevenue || 0)}
                                                </div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Avg Discount</div>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                                    {formatCurrency(selectedPromoStats.usage.averageDiscount || 0)}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedPromoStats.recentOrders && selectedPromoStats.recentOrders.length > 0 && (
                                            <div>
                                                <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Recent Orders</h4>
                                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    <table className="data-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Order #</th>
                                                                <th>Total</th>
                                                                <th>Discount</th>
                                                                <th>Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedPromoStats.recentOrders.map((order, idx) => (
                                                                <tr key={idx}>
                                                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                                                        {order.orderNumber || '-'}
                                                                    </td>
                                                                    <td>{formatCurrency(order.total || 0)}</td>
                                                                    <td style={{ color: '#00ff80' }}>{formatCurrency(order.discount || 0)}</td>
                                                                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                                        {formatDate(order.createdAt)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="btn-secondary">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default PromoCodes;
