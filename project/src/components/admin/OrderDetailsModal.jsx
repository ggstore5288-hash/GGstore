import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import adminAPI from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
    const { addToast } = useToast();
    const [updating, setUpdating] = useState(false);

    if (!order) return null;

    const handlePaymentAction = async (action) => {
        if (!order.payment?._id) return;

        try {
            setUpdating(true);
            if (action === 'confirm') {
                await adminAPI.confirmPayment(order.payment._id);
                addToast('Payment confirmed successfully', 'success');
            } else if (action === 'reject') {
                await adminAPI.rejectPayment(order.payment._id); // Assuming rejectPayment exists or will be added
                addToast('Payment rejected', 'success');
            }
            onUpdate(); // Refresh parent data
            onClose();
        } catch (error) {
            console.error('Payment action failed:', error);
            addToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--color-bg-secondary)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Order Details</h2>
                        <p style={{ color: 'var(--color-cyan-primary)', fontFamily: 'monospace' }}>#{order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                        {/* Left Column: Products & Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Customer Info */}
                            <div style={{ background: 'var(--color-bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</h3>
                                <p style={{ color: 'white', fontWeight: '600' }}>{order.customerInfo?.name || order.user?.name}</p>
                                <p style={{ color: 'var(--color-text-secondary)' }}>{order.customerInfo?.email || order.user?.email}</p>
                                <p style={{ color: 'var(--color-text-secondary)' }}>{order.customerInfo?.phone || order.user?.phone}</p>
                            </div>

                            {/* Products */}
                            <div>
                                <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Products</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                            {item.product?.images?.[0] && (
                                                <img
                                                    src={getImageUrl(item.product.images[0])}
                                                    alt={item.name}
                                                    style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontWeight: '500' }}>{item.name}</p>
                                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Qty: {item.quantity}</p>
                                            </div>
                                            <p style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>${item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', textAlign: 'right', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>Total Amount</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>${order.total}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Payment Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--color-bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Information</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Method</p>
                                        <p style={{ color: 'white', fontWeight: '600' }}>{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status</p>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            marginTop: '4px',
                                            background: order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                            color: order.paymentStatus === 'confirmed' ? '#4ade80' : '#facc15',
                                            border: `1px solid ${order.paymentStatus === 'confirmed' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                                        }}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    {order.payment?.phoneNumber && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Sender Number</p>
                                            <p style={{ color: 'var(--color-cyan-primary)', fontWeight: '600', fontSize: '16px', fontFamily: 'monospace' }}>
                                                {order.payment.phoneNumber}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {order.payment?.proofImage ? (
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Payment Proof</p>
                                        <div style={{
                                            position: 'relative',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid var(--color-border)',
                                            cursor: 'pointer'
                                        }} onClick={() => window.open(getImageUrl(order.payment.proofImage), '_blank')}>
                                            <img
                                                src={getImageUrl(order.payment.proofImage)}
                                                alt="Payment Proof"
                                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }}
                                            />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '12px', textAlign: 'center' }}>
                                                Click to Open Original
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
                                        No payment proof available
                                    </div>
                                )}

                                {/* Admin Actions */}
                                {order.paymentStatus === 'pending' && order.payment?._id && (
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button
                                            onClick={() => handlePaymentAction('confirm')}
                                            disabled={updating}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Confirm Payment
                                        </button>
                                        <button
                                            onClick={() => handlePaymentAction('reject')}
                                            disabled={updating}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
