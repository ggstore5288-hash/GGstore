import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Smartphone,
    Zap,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react';
import adminAPI from '../../api/admin';
import { useToast } from '../../context/ToastContext';

const PaymentMethods = () => {
    const { addToast } = useToast();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        number: '',
        isActive: true,
        icon: 'CreditCard',
        order: 0
    });

    const ICONS = {
        CreditCard: <CreditCard size={20} />,
        Smartphone: <Smartphone size={20} />,
        Zap: <Zap size={20} />,
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAdminPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Fetch Methods Error:', error);
            addToast('Failed to load payment methods', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (method = null) => {
        if (method) {
            setEditingMethod(method);
            setFormData({
                id: method.id,
                name: method.name,
                number: method.number,
                isActive: method.isActive,
                icon: method.icon || 'CreditCard',
                order: method.order || 0
            });
        } else {
            setEditingMethod(null);
            setFormData({
                id: '',
                name: '',
                number: '',
                isActive: true,
                icon: 'CreditCard',
                order: methods.length + 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMethod) {
                await adminAPI.updatePaymentMethod(editingMethod.id, formData);
                addToast('Payment method updated successfully', 'success');
            } else {
                await adminAPI.createPaymentMethod(formData);
                addToast('Payment method created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchMethods();
        } catch (error) {
            console.error('Submit Method Error:', error);
            addToast(error.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handleToggleActive = async (method) => {
        try {
            await adminAPI.updatePaymentMethod(method.id, { isActive: !method.isActive });
            addToast(`Method ${method.isActive ? 'disabled' : 'enabled'} successfully`, 'success');
            fetchMethods();
        } catch (error) {
            addToast('Toggle failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            try {
                await adminAPI.deletePaymentMethod(id);
                addToast('Payment method deleted', 'success');
                fetchMethods();
            } catch (error) {
                addToast('Delete failed', 'error');
            }
        }
    };

    if (loading && methods.length === 0) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Decoding payment matrix...</p>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Payment Methods</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage visibility and details for your payment gateways
                    </p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus size={18} />
                    Add New Method
                </button>
            </header>

            <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {methods.map(method => (
                    <div key={method.id} className={`method-card ${!method.isActive ? 'inactive' : ''}`} style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '24px',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        opacity: method.isActive ? 1 : 0.6
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div className="method-icon-v2" style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(0, 217, 255, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-cyan-primary)'
                            }}>
                                {ICONS[method.icon] || <CreditCard size={24} />}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleToggleActive(method)} className="icon-btn" title={method.isActive ? 'Deactivate' : 'Activate'}>
                                    {method.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => handleOpenModal(method)} className="icon-btn" title="Edit">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(method.id)} className="icon-btn delete" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{method.name}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            ID: <code style={{ color: 'var(--color-cyan-primary)' }}>{method.id}</code>
                        </p>

                        <div className="wallet-number-display" style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Wallet Number:</span>
                            <span style={{ fontWeight: '700', letterSpacing: '1px' }}>{method.number}</span>
                        </div>

                        {!method.isActive && (
                            <div style={{
                                marginTop: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#ff3366',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                <AlertCircle size={14} />
                                Hidden from Checkout
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingMethod ? 'Edit Gateway' : 'New Gateway'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label>Gateway ID</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    required
                                    disabled={!!editingMethod}
                                    placeholder="e.g. instapay"
                                />
                            </div>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. InstaPay Business"
                                />
                            </div>
                            <div className="form-group">
                                <label>Wallet / Identifier</label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    required
                                    placeholder="010xxxxxxx / @username"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Icon Package</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        <option value="CreditCard">Digital Card</option>
                                        <option value="Smartphone">Mobile Wallet</option>
                                        <option value="Zap">Instant Transfer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span style={{ marginLeft: '12px', fontSize: '0.9rem', fontWeight: '500' }}>
                                    Active (Visible in Checkout)
                                </span>
                            </label>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary btn-save">
                                    <Save size={18} />
                                    {editingMethod ? 'Update Matrix' : 'Initialize Gateway'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .payment-methods-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                .method-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .method-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--color-cyan-primary);
                    box-shadow: 0 15px 40px rgba(0, 217, 255, 0.15);
                }

                .method-card.inactive {
                    opacity: 0.6;
                    border-style: dashed;
                }

                .method-icon-v2 {
                    width: 56px;
                    height: 56px;
                    background: rgba(0, 217, 255, 0.05);
                    border: 1px solid rgba(0, 217, 255, 0.1);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-cyan-primary);
                    transition: all 0.3s ease;
                }

                .method-card:hover .method-icon-v2 {
                    background: rgba(0, 217, 255, 0.1);
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
                }

                .icon-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: var(--color-text-muted);
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-btn:hover {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-cyan-primary);
                    border-color: var(--color-cyan-primary);
                    transform: translateY(-2px);
                }

                .icon-btn.delete:hover {
                    background: rgba(255, 51, 102, 0.1);
                    color: #ff3366;
                    border-color: #ff3366;
                }

                /* MODAL & FORM IMPROVEMENTS */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(5, 5, 5, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 550px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .modal-header {
                    padding: 32px 32px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .modal-header h2 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.75rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .close-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--color-text-muted);
                    padding: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                }

                .close-btn:hover {
                    background: rgba(255, 51, 102, 0.1);
                    color: #ff3366;
                    border-color: #ff3366;
                    transform: rotate(90deg);
                }

                .admin-form {
                    padding: 32px;
                }

                .form-group {
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .form-group input, 
                .form-group select {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 18px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    width: 100%;
                }

                .form-group input:focus, 
                .form-group select:focus {
                    background: rgba(0, 217, 255, 0.05);
                    border-color: var(--color-cyan-primary);
                    outline: none;
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
                }

                .form-group input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: rgba(0, 0, 0, 0.4);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .checkbox-wrapper {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 16px 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .checkbox-wrapper:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .checkbox-wrapper input {
                    width: 20px;
                    height: 20px;
                    accent-color: var(--color-cyan-primary);
                    cursor: pointer;
                }

                .modal-actions {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 16px;
                    margin-top: 32px;
                }

                .btn-save {
                    background: var(--color-cyan-primary);
                    color: #000;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .btn-cancel {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default PaymentMethods;
