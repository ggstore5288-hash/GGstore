import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Plus, Minus, Trash2, Smartphone, CreditCard, Zap, Shield, CheckCircle2, Box, Rocket, MessageSquare, ShieldCheck, Lock, Receipt, Gamepad2, DollarSign } from 'lucide-react';
import client from '../api/client'; // Import client for API calls
import { getImageUrl } from '../utils/imageUtils';

import paymentMethodAPI from '../api/paymentMethods';

const Checkout = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated, user } = useAuth();
    const { cart, clearCart, fetchCart, applyPromoCode, updateCartItem, removeFromCart } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetchingMethods, setFetchingMethods] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Sender's number
    const [paymentProof, setPaymentProof] = useState(null);
    const [contactPhone, setContactPhone] = useState(user?.phone || '');

    // Fetch dynamic payment methods
    useEffect(() => {
        const fetchMethods = async () => {
            try {
                setFetchingMethods(true);
                const data = await paymentMethodAPI.getActiveMethods();
                setPaymentMethods(data);
            } catch (error) {
                console.error('Fetch Payment Methods Error:', error);
                addToast('Failed to load payment methods', 'error');
            } finally {
                setFetchingMethods(false);
            }
        };
        fetchMethods();
    }, []);

    // Helper to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const ICONS = {
        Zap: <Zap size={24} />,
        Smartphone: <Smartphone size={24} />,
        CreditCard: <CreditCard size={24} />
    };


    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            addToast('Please select a payment method', 'error');
            return;
        }

        if (!contactPhone) {
            addToast('Please enter your contact phone number', 'error');
            return;
        }

        if (paymentMethods.map(m => m.name).includes(paymentMethod) && (!paymentProof || !phoneNumber)) {
            addToast('Please upload payment proof and enter the sender number', 'error');
            return;
        }

        try {
            setLoading(true);

            // Upload proof if exists
            let proofUrl = null;
            if (paymentProof) {
                const formData = new FormData();
                formData.append('file', paymentProof);

                const response = await client.post('/upload', formData, {
                    headers: {
                        'Content-Type': undefined
                    }
                });

                const uploadRes = response.data;

                if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
                proofUrl = uploadRes.data.url;
            }

            // Create Order
            const orderData = {
                phone: contactPhone,
                paymentMethod,
                paymentProof: proofUrl,
                phoneNumber
            };

            const response = await client.post('/orders', orderData);
            const orderRes = response.data;

            if (orderRes.success) {
                addToast('Order placed successfully!', 'success');
                clearCart();
                // Redirect to success page or orders list
                // Since we don't have a success page, go to cart (empty) or home
                // User requirement: "user can do checkout... then upload message and order not confirmed until photo... products does not appear for admin"
                // Actually user said "add to cart open automatic... checkout". 
                // Redirecting to home or orders is standard.
                navigate('/');
            }

        } catch (error) {
            console.error('Checkout Error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Order failed';
            addToast(errorMessage, 'error');
            alert(`Order Failed: ${errorMessage}`); // Force alert for immediate visibility
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="checkout-auth-boundary container">
                <h2 className="auth-message">
                    {t('pleaseSignIn')}
                </h2>
                <Link to="/login" className="auth-btn">
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="checkout-empty-boundary container">
                <div className="empty-card">
                    <p className="empty-message">
                        {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                    </p>
                    <Link to="/products" className="auth-btn underline-none">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page-root" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="checkout-container container">
                <header className="checkout-header">
                    <h1 className="checkout-title">
                        {t('checkoutTitle')}
                    </h1>
                </header>

                <div className="checkout-main-grid">
                    {/* LEFT SIDE: Sequential Flow */}
                    <div className="checkout-primary-flow">
                        {/* 2. Contact Information */}
                        <section className="form-section">
                            <div className="section-card">
                                <h2 className="section-title">
                                    <span className="section-icon-group">
                                        <Smartphone className="s-icon" size={20} />
                                        <MessageSquare className="s-icon" size={20} />
                                        <ShieldCheck className="s-icon" size={20} />
                                    </span>
                                    Contact Information
                                </h2>
                                <div className="input-group">
                                    <label className="input-label">Communication Number</label>
                                    <input
                                        type="text"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="elite-input"
                                        placeholder="01xxxxxxxxx"
                                        required
                                    />
                                    <p className="input-hint">We'll use this for delivery updates via WhatsApp/Call.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Architecture */}
                        <form onSubmit={handleSubmit} className="elite-checkout-form">
                            <section className="form-section">
                                <div className="section-card">
                                    <h2 className="section-title">
                                        <span className="section-icon-group">
                                            <CreditCard className="s-icon" size={20} />
                                            <Zap className="s-icon" size={20} />
                                            <Lock className="s-icon" size={20} />
                                        </span>
                                        Payment Architecture
                                    </h2>
                                    <div className="payment-grid">
                                        {fetchingMethods ? (
                                            <div className="fetching-loader" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                                                Connecting to payment matrix...
                                            </div>
                                        ) : paymentMethods.length === 0 ? (
                                            <div className="no-methods" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                No payment methods currently available.
                                            </div>
                                        ) : (
                                            paymentMethods.map(method => (
                                                <label key={method.id} className={`payment-card ${paymentMethod === method.name ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.name}
                                                        checked={paymentMethod === method.name}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="payment-radio"
                                                    />
                                                    <div className="payment-card-content">
                                                        <div className="radio-circle"></div>
                                                        <div className="method-icon">{ICONS[method.icon] || <CreditCard size={24} />}</div>
                                                        <span className="method-name">{method.name}</span>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 4. Transfer Details */}
                            {paymentMethod && (
                                <section className="form-section payment-details-section">
                                    <div className="section-card details-card">
                                        <div className="transfer-instructions">
                                            <p className="instruction-head">Transfer Requirement</p>
                                            <div className="amount-display">
                                                <span className="currency">EGP</span>
                                                <span className="value">{formatPrice(cart.total).replace(/[^0-9.]/g, '')}</span>
                                            </div>
                                            <p className="transfer-to">Send to wallet:</p>
                                            <div className="wallet-number-box">
                                                {paymentMethods.find(m => m.name === paymentMethod)?.number}
                                            </div>
                                        </div>

                                        <div className="sender-info-fields">
                                            <div className="input-group">
                                                <label className="input-label">Sender Wallet Number</label>
                                                <input
                                                    type="text"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="01xxxxxxxxx"
                                                    className="elite-input"
                                                />
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Transfer Receipt (Screenshot)</label>
                                                <div className="file-upload-wrapper">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden-file-input"
                                                        id="payment-proof"
                                                    />
                                                    <label htmlFor="payment-proof" className="custom-file-btn">
                                                        {paymentProof ? paymentProof.name : 'Select File'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="form-section final-action-zone">
                                <div className="section-card final-card">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="checkout-power-cta"
                                    >
                                        {loading ? 'Securing Order...' : 'Confirm & Place Order'}
                                    </button>
                                    <div className="trust-badges small-badges">
                                        <div className="badge"><Shield size={12} /> Encrypted Checkout</div>
                                        <div className="badge"><Shield size={12} /> Buyer Protection</div>
                                    </div>
                                </div>
                            </section>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-page-root {
                    background-color: var(--color-bg-primary);
                    min-height: 100vh;
                    color: var(--color-text-primary);
                    direction: var(--dir);
                }

                .checkout-auth-boundary, .checkout-empty-boundary {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 32px;
                }

                .auth-message, .empty-message {
                    color: var(--color-text-primary);
                    font-family: Orbitron, sans-serif;
                    text-align: center;
                }

                .empty-card {
                    background: var(--color-bg-card);
                    border-radius: 24px;
                    border: 1px solid var(--color-border);
                    padding: 48px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }

                .underline-none { text-decoration: none; }

                .checkout-container {
                    padding: 0 clamp(16px, 4vw, 24px);
                    max-width: 1440px;
                    margin: 0 auto;
                }

                .checkout-header {
                    padding: clamp(32px, 6vw, 48px) 0;
                }

                .checkout-title {
                    font-family: Orbitron, sans-serif;
                    font-size: 2rem;
                    color: var(--color-cyan-primary);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
                    margin: 0 0 16px 0;
                    padding-left: 16px;
                }

                @media (min-width: 1024px) {
                    .checkout-title {
                        font-size: 3rem;
                        margin: 0 0 32px 0;
                        padding-left: 0;
                    }
                }

                .checkout-main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    padding-bottom: 64px;
                    align-items: start;
                }

                @media (min-width: 1024px) {
                    .checkout-main-grid {
                        grid-template-columns: 1fr;
                        max-width: 800px;
                        margin: 0 auto;
                        gap: 48px;
                    }

                    .checkout-primary-flow {
                        display: flex;
                        flex-direction: column;
                        gap: 32px;
                    }

                    .checkout-summary-sidebar {
                        position: sticky;
                        top: 32px;
                    }
                }

                .section-card {
                    background: linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%);
                    padding: 16px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(20px);
                    margin-bottom: 24px;
                }

                @media (min-width: 640px) {
                    .section-card {
                        padding: 32px;
                        margin-bottom: 32px;
                    }
                }

                .section-title {
                    font-family: Orbitron, sans-serif;
                    font-size: 1.25rem;
                    color: var(--color-text-primary);
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .section-icon-group {
                    display: flex;
                    gap: 8px;
                    background: rgba(0, 217, 255, 0.05);
                    padding: 8px 12px;
                    border-radius: 12px;
                    color: var(--color-cyan-primary);
                    opacity: 0.8;
                }

                .s-icon {
                    stroke-width: 1.5px;
                }

                .summary-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .summary-item-row {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .summary-item-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .summary-item-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .summary-item-image {
                    width: clamp(80px, 15vw, 100px);
                    height: clamp(100px, 20vw, 130px);
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .summary-item-image img { width: 100%; height: 100%; object-fit: cover; }
                .summary-item-info { flex: 1; min-width: 0; }
                .summary-item-name { font-weight: 700; font-size: clamp(1rem, 3vw, 1.25rem); margin-bottom: 4px; color: var(--color-text-primary); }
                .summary-item-meta { font-size: 0.85rem; color: var(--color-text-muted); font-family: "JetBrains Mono", monospace; margin-bottom: 12px; }

                .summary-item-qty-control {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .qty-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .qty-btn:hover {
                    background: var(--color-cyan-primary);
                    color: #000;
                    border-color: var(--color-cyan-primary);
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
                }

                .qty-value {
                    font-weight: 800;
                    font-family: Orbitron, sans-serif;
                    min-width: 24px;
                    text-align: center;
                    font-size: 1.1rem;
                }

                .summary-item-price-block { 
                    text-align: right; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 6px;
                    padding-left: 20px;
                }
                .summary-item-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
                .summary-item-price { font-family: Orbitron, sans-serif; font-weight: 900; color: #fff; font-size: 1.25rem; white-space: nowrap; }

                @media (max-width: 640px) {
                    .summary-item-row {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 24px;
                        padding-bottom: 24px;
                    }
                    .summary-item-header {
                        display: flex;
                        gap: 16px;
                    }
                    .summary-item-price-block {
                        text-align: left;
                        padding-left: 0;
                        padding-top: 12px;
                        border-top: 1px dashed rgba(255, 255, 255, 0.05);
                    }
                }

                .form-section { margin-bottom: 32px; }
                .input-group { margin-bottom: 20px; }
                .input-label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 10px; }

                .elite-input {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .elite-input:focus {
                    border-color: var(--color-cyan-primary);
                    background: rgba(0, 217, 255, 0.05);
                }

                .input-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 8px; font-weight: 400; opacity: 0.7; }

                .payment-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 12px; 
                }

                @media (min-width: 640px) {
                    .payment-grid {
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                        gap: 20px;
                    }
                }

                .payment-card-content {
                    padding: 24px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .payment-card.active .payment-card-content {
                    background: rgba(0, 217, 255, 0.1);
                    border-color: var(--color-cyan-primary);
                    box-shadow: 0 0 30px rgba(0, 217, 255, 0.15);
                    transform: translateY(-4px);
                }

                .method-name {
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    font-size: 1rem;
                }

                .radio-circle { width: 24px; height: 24px; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .payment-card.active .radio-circle { border-color: var(--color-cyan-primary); }
                .payment-card.active .radio-circle::after { content: ''; width: 12px; height: 12px; background: var(--color-cyan-primary); border-radius: 50%; }

                .transfer-instructions { 
                    text-align: center; 
                    margin-bottom: 32px; 
                    padding: 32px 24px; 
                    background: rgba(0, 217, 255, 0.03); 
                    border-radius: 24px; 
                    border: 1px solid rgba(0, 217, 255, 0.1);
                }

                .amount-display .value { 
                    font-size: 3rem; 
                    font-family: Orbitron, sans-serif; 
                    font-weight: 900; 
                    color: var(--color-cyan-primary); 
                    text-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
                }

                .wallet-number-box { 
                    font-size: 1.75rem; 
                    font-family: "JetBrains Mono", monospace; 
                    background: rgba(0, 0, 0, 0.4); 
                    padding: 16px 32px; 
                    border-radius: 16px; 
                    display: inline-block; 
                    margin-top: 16px; 
                    letter-spacing: 3px; 
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                @media (max-width: 640px) {
                    .transfer-instructions { padding: 24px 16px; }
                    .amount-display .value { font-size: 2.5rem; }
                    .wallet-number-box { width: 100%; font-size: 1.25rem; padding: 16px 0; text-align: center; }
                    .payment-card-content { padding: 16px 8px; gap: 8px; }
                    .method-name { font-size: 0.85rem; }
                }

                .loyalty-card { background: linear-gradient(145deg, rgba(255, 215, 0, 0.05) 0%, rgba(184, 134, 11, 0.02) 100%); border-color: rgba(255, 215, 0, 0.2); }
                .loyalty-title { color: #FFD700; }
                .loyalty-status { display: flex; justify-content: space-around; margin-bottom: 24px; background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 16px; }
                .status-value { font-weight: 800; color: #FFD700; font-family: Orbitron, sans-serif; }

                .loyalty-applied-box { display: flex; align-items: center; justify-content: space-between; background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 16px; }
                .loyalty-input-stack { display: flex; flex-direction: column; gap: 12px; }
                .stack-row { display: flex; gap: 12px; }
                @media (max-width: 480px) { .stack-row { flex-direction: column; } }
                .loyalty-apply-btn { background: #FFD700; color: #000; border: none; padding: 0 24px; border-radius: 12px; font-weight: 800; cursor: pointer; min-height: 52px; }


                .checkout-summary-sidebar { position: sticky; top: 100px; }
                .summary-sticky-card { background: rgba(30, 30, 35, 0.95); padding: 32px; border-radius: 28px; border: 1px solid rgba(0, 217, 255, 0.2); backdrop-filter: blur(40px); }
                .fare-breakdown { display: flex; flex-direction: column; gap: 16px; margin: 32px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 32px; }
                .fare-row { display: flex; justify-content: space-between; font-size: 1.1rem; color: var(--color-text-muted); }
                .discount-value { color: #ff3366; font-weight: 700; }
                .total-row { margin-top: 12px; padding-top: 24px; border-top: 2px solid rgba(255, 255, 255, 0.1); color: var(--color-text-primary); }
                .total-price { font-size: 2.25rem; font-family: Orbitron, sans-serif; font-weight: 900; color: var(--color-cyan-primary); text-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }

                .checkout-power-cta {
                    width: 100%;
                    height: 64px;
                    background: var(--color-cyan-primary);
                    color: #000;
                    border: none;
                    border-radius: 18px;
                    font-size: 1.1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    box-shadow: 0 0 30px rgba(0, 217, 255, 0.4);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .final-card {
                    background: linear-gradient(145deg, rgba(0, 217, 255, 0.05) 0%, rgba(22, 22, 26, 0.9) 100%);
                    border: 1px solid rgba(0, 217, 255, 0.2);
                    text-align: center;
                }

                .small-badges {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 24px;
                    opacity: 0.5;
                }

                .summary-footer-badges {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 24px;
                    opacity: 0.5;
                }
                
                .summary-heading {
                    font-family: Orbitron, sans-serif;
                    font-size: 1.25rem;
                    color: var(--color-text-primary);
                    margin-bottom: 24px;
                }

                .custom-file-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .custom-file-btn:hover { background: rgba(255, 255, 255, 0.1); }
                .hidden-file-input { display: none; }

                /* RTL Specifics */
                [dir="rtl"] .summary-item-price { text-align: left; }
                [dir="rtl"] .summary-item-info { text-align: right; }
                [dir="rtl"] .fare-row { flex-direction: row-reverse; }
                [dir="rtl"] .status-row { flex-direction: row-reverse; }
                [dir="rtl"] .applied-info { text-align: right; }
            `}</style>
        </div>
    );
};

export default Checkout;
