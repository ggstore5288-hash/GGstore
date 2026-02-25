import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, Shield } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
    const { t, isRTL } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { cart, loading, updateCartItem, removeFromCart, clearCart, total, applyPromoCode, loyaltyInfo, redeemPoints, removePoints } = useCart();
    const [promoCode, setPromoCode] = React.useState('');
    const [promoLoading, setPromoLoading] = React.useState(false);
    const [promoError, setPromoError] = React.useState('');
    const [pointsToRedeem, setPointsToRedeem] = React.useState('');
    const [pointsLoading, setPointsLoading] = React.useState(false);
    const [pointsError, setPointsError] = React.useState('');
    const navigate = useNavigate();

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            await applyPromoCode(promoCode);
            setPromoCode('');
        } catch (error) {
            setPromoError(error.response?.data?.message || 'Invalid promo code');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRedeemPoints = async (specificPoints = null) => {
        const points = specificPoints !== null ? specificPoints : parseInt(pointsToRedeem);
        if (isNaN(points) || points <= 0) return;
        setPointsLoading(true);
        setPointsError('');
        try {
            await redeemPoints(points);
            setPointsToRedeem('');
        } catch (error) {
            setPointsError(error.response?.data?.message || 'Failed to redeem points');
        } finally {
            setPointsLoading(false);
        }
    };

    const handleRemovePoints = async () => {
        try {
            await removePoints();
        } catch (error) {
            console.error('Error removing points:', error);
        }
    };

    // Helper to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h2 style={{ color: 'var(--color-text-primary)' }}>
                    {isRTL ? 'يرجى تسجيل الدخول لعرض سلة التسوق' : 'Please sign in to view your cart'}
                </h2>
                <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Empty State
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '32px', color: 'var(--color-cyan-primary)', marginBottom: 'var(--spacing-xl)' }}>
                    {t('cartTitle')}
                </h1>
                <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <ShoppingBag size={64} style={{ color: 'var(--color-text-muted)', marginBottom: '20px', opacity: 0.5 }} />
                    <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '10px' }}>{t('emptyCart')}</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                        {isRTL ? 'ابدأ بإضافة الألعاب إلى سلة التسوق!' : 'Start adding games to your cart!'}
                    </p>
                    <Link to="/games" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        {t('browseGames')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ minHeight: '80vh', padding: '40px 0', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: '32px', color: 'var(--color-cyan-primary)', marginBottom: '40px', letterSpacing: 'var(--ls-heading)' }}>
                {t('cartTitle')}
            </h1>

            <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px', alignItems: 'start' }}>

                {/* Cart Items List */}
                <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cart.items.map((item) => (
                        <div key={item._id} className="cart-item-card">
                            {/* Product Image */}
                            <div className="cart-item-image">
                                <img
                                    src={getImageUrl(item.product?.images?.[0])}
                                    alt={item.name}
                                />
                            </div>

                            <div className="cart-item-details">
                                <div>
                                    <h3 className="cart-item-title">
                                        <Link to={`/product/${item.product?._id}`} className="product-title-link">
                                            {item.name}
                                        </Link>
                                    </h3>

                                    <div className="product-details-grid">
                                        <div className="detail-row">
                                            <span className="detail-label">Platform:</span>
                                            <span className="detail-value">{item.product?.platform || 'PC'}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">Edition:</span>
                                            <span className="detail-value">{item.variant?.type || 'Standard Edition'}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">Developer:</span>
                                            <span className="detail-value">{item.product?.developer || 'Official Game'}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">Release:</span>
                                            <span className="detail-value">{item.product?.releaseDate ? new Date(item.product.releaseDate).toLocaleDateString() : 'Now Available'}</span>
                                        </div>

                                        <div className="detail-row full-width">
                                            <span className="detail-label">Format:</span>
                                            <span className="detail-value" style={{ textTransform: 'capitalize' }}>{item.product?.type || 'Digital'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="cart-item-price">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>

                            {/* Actions (Quantity & Delete) */}
                            <div className="cart-item-actions">
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    title={t('remove')}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'var(--color-bg-primary)',
                                    padding: '5px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <button
                                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-primary)',
                                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                            opacity: item.quantity <= 1 ? 0.3 : 1,
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ color: 'var(--color-text-primary)', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-primary)',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={clearCart}
                        style={{
                            alignSelf: 'flex-start',
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t('clearCart')}
                    </button>
                </div>

                {/* Order Summary */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative'
                    }}>
                        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', letterSpacing: 'var(--ls-heading)' }}>
                            {t('summary')}
                        </h2>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{isRTL ? 'لديك رمز ترويجي؟' : 'Have a promo code?'}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'أدخل الرمز' : 'Enter code'}
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="promo-input"
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleApplyPromoCode}
                                    disabled={!promoCode || promoLoading}
                                    className="promo-apply-btn"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--color-cyan-primary)',
                                        color: 'var(--color-cyan-primary)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {promoLoading ? '...' : (isRTL ? 'تطبيق' : 'Apply')}
                                </button>
                            </div>
                            {promoError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>{promoError}</div>}
                            {cart.discount > 0 && cart.promoCode && (
                                <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>
                                    Applied: {cart.promoCode.code} (-{formatPrice(cart.discount)})
                                </div>
                            )}
                        </div>

                        {/* Loyalty Points Redemption */}
                        {loyaltyInfo && loyaltyInfo.settings?.isActive && (
                            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                                {cart.pointsUsed > 0 ? (
                                    <div style={{
                                        background: 'rgba(255, 215, 0, 0.1)',
                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.1)'
                                    }}>
                                        <div>
                                            <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Orbitron, sans-serif' }}>
                                                {cart.pointsUsed} Points Active
                                            </div>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                                                Value: {formatPrice(cart.pointsDiscount)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemovePoints}
                                            style={{
                                                color: '#ef4444',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {loyaltyInfo.loyalty?.points < (loyaltyInfo.settings?.minPointsToRedeem || 0) ? (
                                            <div style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px dashed rgba(255, 215, 0, 0.2)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: '600', fontFamily: 'Orbitron, sans-serif' }}>
                                                    {loyaltyInfo.loyalty?.points || 0} Points Available
                                                </div>
                                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '6px' }}>
                                                    You need at least {loyaltyInfo.settings?.minPointsToRedeem} points to start redeeming.
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const maxPoints = loyaltyInfo.loyalty.points;
                                                    setPointsToRedeem(maxPoints);
                                                    handleRedeemPoints(maxPoints);
                                                }}
                                                disabled={pointsLoading}
                                                className="loyalty-redeem-btn"
                                                style={{
                                                    width: '100%',
                                                    padding: '14px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                                                    color: '#000',
                                                    border: 'none',
                                                    fontWeight: '900',
                                                    fontFamily: 'Orbitron, sans-serif',
                                                    fontSize: '14px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <span style={{ fontSize: '16px' }}>
                                                    {pointsLoading ? '...' : (isRTL ? 'استخدام النقاط' : 'Use Points for Discount')}
                                                </span>
                                                <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: '600' }}>
                                                    {isRTL ? 'متاح' : 'Available'}: {loyaltyInfo.loyalty?.points || 0} pts (≈ {formatPrice((loyaltyInfo.loyalty?.points || 0) / (loyaltyInfo.settings?.pointsToMoneyRatio || 100))})
                                                </span>
                                            </button>
                                        )}
                                        {pointsError && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center' }}>{pointsError}</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--color-text-secondary)' }}>
                            <span>{t('subtotal')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        {cart.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#10b981' }}>
                                <span>Promo Discount</span>
                                <span>-{formatPrice(cart.discount)}</span>
                            </div>
                        )}

                        {cart.pointsDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#FFD700' }}>
                                <span>Points Discount</span>
                                <span>-{formatPrice(cart.pointsDiscount)}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                            <span>{t('total')}</span>
                            <span>{formatPrice(total - (cart.discount || 0) - (cart.pointsDiscount || 0))}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary checkout-btn"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0, 217, 255, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {t('checkout')}
                        </button>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                            <Shield size={14} />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .cart-item-card {
                    display: grid;
                    grid-template-columns: 120px 1fr auto;
                    gap: 40px;
                    background: linear-gradient(145deg, rgba(22, 22, 26, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%);
                    padding: 30px;
                    borderRadius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                }

                .cart-item-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .cart-item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .cart-item-details {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    justify-content: center;
                }

                .cart-item-title {
                    margin: 0 0 16px 0;
                    color: var(--color-text-primary);
                    fontSize: 20px;
                    font-family: var(--font-display);
                    font-weight: var(--fw-medium);
                    letter-spacing: var(--ls-heading);
                }

                .cart-item-title a {
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .product-details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px 40px;
                    maxWidth: 750px;
                    fontSize: 12px;
                    fontFamily: var(--font-body);
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 4px;
                }

                .detail-row.full-width {
                    grid-column: span 2;
                }

                .detail-label {
                    color: rgba(148, 163, 184, 0.7);
                }

                .detail-value {
                    color: #ffffff;
                }

                .cart-item-price {
                    color: var(--color-cyan-primary);
                    font-weight: var(--fw-semibold);
                    font-size: 24px;
                    font-family: var(--font-body);
                    text-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
                    margin-top: 8px;
                }

                .cart-item-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: space-between;
                }

                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 768px) {
                    .cart-item-card {
                        grid-template-columns: 100px 1fr;
                        gap: 20px;
                        padding: 20px;
                    }

                    .cart-item-actions {
                        grid-column: span 2;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                    }

                    .product-details-grid {
                        grid-template-columns: 1fr !important;
                        gap: 8px 0 !important;
                    }
                    
                    .detail-row.full-width {
                        grid-column: span 1;
                    }

                    .cart-item-title {
                        font-size: 18px;
                    }

                    .cart-item-price {
                        font-size: 22px;
                    }
                }

                @media (max-width: 480px) {
                    .cart-item-card {
                        grid-template-columns: 1fr;
                    }
                    
                    .cart-item-image {
                        width: 100%;
                        height: 200px;
                    }
                    
                    .cart-item-actions {
                        grid-column: span 1;
                    }
                }

                .promo-input {
                    transition: all 0.3s ease;
                }

                .promo-input:focus {
                    border-color: var(--color-cyan-primary) !important;
                    box-shadow: 0 0 10px rgba(0, 217, 255, 0.2) !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .promo-apply-btn:hover:not(:disabled) {
                    background: var(--color-cyan-primary) !important;
                    color: #000 !important;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
                }

                .promo-apply-btn.loyalty-btn:hover:not(:disabled) {
                    background: #FFD700 !important;
                    color: #000 !important;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
                    border-color: #FFD700 !important;
                }

                .loyalty-redeem-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(218, 165, 32, 0.4);
                    filter: brightness(1.1);
                }

                .loyalty-redeem-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .product-title-link:hover {
                    color: var(--color-cyan-primary) !important;
                }

                .checkout-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 217, 255, 0.4) !important;
                    filter: brightness(1.1);
                }

                .checkout-btn:active {
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};

export default Cart;
