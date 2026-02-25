import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, Award, Trash2, ShoppingCart, Star } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

const Profile = () => {
    const { user, logout, checkAuth } = useAuth();
    const { addToast } = useToast();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, phone: user.phone || '' }));
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'favorites' && favorites.length === 0) {
            fetchFavorites();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await client.get('/orders');
            if (res.data.success) setOrders(res.data.data.orders);
        } catch (error) {
            // silently fail
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            setLoadingFavorites(true);
            const res = await client.get('/wishlist');
            if (res.data.success) {
                setFavorites(res.data.data.wishlist.products || []);
            }
        } catch (error) {
            addToast('Could not load favorites', 'error');
        } finally {
            setLoadingFavorites(false);
        }
    };

    const handleRemoveFavorite = async (productId) => {
        try {
            await client.delete(`/wishlist/${productId}`);
            setFavorites(prev => prev.filter(item => item.product._id !== productId));
            addToast('Removed from favorites', 'success');
        } catch (error) {
            addToast('Failed to remove', 'error');
        }
    };

    const handleAddToCartFromFavorites = async (product) => {
        try {
            await addToCart(product._id, 1);
            addToast(`${product.name} added to cart`, 'success');
        } catch (error) {
            addToast('Could not add to cart', 'error');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await client.put('/users/profile', { name: formData.name, phone: formData.phone });
            if (res.data.success) {
                addToast('Profile updated successfully', 'success');
                setIsEditing(false);
                checkAuth();
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Update failed', 'error');
        }
    };

    const navBtn = (tab, Icon, label) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', width: '100%',
                background: activeTab === tab ? 'var(--color-primary, #ffc800)' : 'var(--color-bg-card)',
                color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left',
                fontSize: '14px'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(22,22,24,0.9), rgba(10,10,12,0.95))',
                borderRadius: '16px', padding: '28px 32px', border: '1px solid var(--color-border)',
                marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px',
                flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
            }}>
                {/* Glow accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--color-primary, #ffc800)', borderRadius: '16px 16px 0 0' }} />

                <div style={{
                    width: '90px', height: '90px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', border: '2px solid var(--color-primary, #ffc800)',
                    boxShadow: '0 0 24px rgba(255,200,0,0.2)'
                }}>
                    <User size={42} style={{ color: 'var(--color-primary, #ffc800)' }} />
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                    <h1 style={{ fontSize: '28px', fontFamily: 'Orbitron, sans-serif', color: 'white', marginBottom: '4px' }}>
                        {user?.name}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px', fontSize: '14px' }}>{user?.email}</p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(255,200,0,0.1)', padding: '5px 14px', borderRadius: '20px',
                        border: '1px solid rgba(255,200,0,0.3)', color: 'var(--color-primary, #ffc800)',
                        fontSize: '13px', fontWeight: '700'
                    }}>
                        <Award size={14} />
                        {user?.loyaltyTier ? user.loyaltyTier.toUpperCase() : 'BRONZE'} TIER
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px',
                    border: '1px solid var(--color-border)', textAlign: 'center', minWidth: '120px'
                }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', letterSpacing: '0.5px' }}>LOYALTY POINTS</p>
                    <p style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-primary, #ffc800)', fontFamily: 'Orbitron, sans-serif' }}>
                        {(user?.loyaltyPoints || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'clamp(200px, 25%, 260px) 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'sticky', top: '20px' }}>
                    {navBtn('overview', User, 'Profile Overview')}
                    {navBtn('orders', Package, 'My Orders')}
                    {navBtn('favorites', Heart, 'My Favorites')}
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                            background: 'rgba(255,50,50,0.08)', color: '#ff4d4d',
                            border: '1px solid rgba(255,50,50,0.2)', borderRadius: '12px',
                            cursor: 'pointer', fontWeight: '600', textAlign: 'left', fontSize: '14px',
                            marginTop: '4px', transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                {/* Content */}
                <div>
                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div style={{ background: 'var(--color-bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Personal Information</h2>
                                <button onClick={() => setIsEditing(!isEditing)}
                                    style={{ color: 'var(--color-primary, #ffc800)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '16px', maxWidth: '440px' }}>
                                    {[['Full Name', 'text', 'name'], ['Phone Number', 'text', 'phone']].map(([label, type, key]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>{label}</label>
                                            <input type={type} value={formData[key]}
                                                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                                style={{ width: '100%', padding: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                    <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '4px' }}>Save Changes</button>
                                </form>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                                    {[
                                        ['Full Name', user?.name],
                                        ['Email Address', user?.email],
                                        ['Phone Number', user?.phone || 'Not set'],
                                        ['Member Since', new Date(user?.createdAt).toLocaleDateString()]
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{label}</p>
                                            <p style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ORDERS ── */}
                    {activeTab === 'orders' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>Order History</h2>
                            {loadingOrders ? (
                                <p style={{ color: 'var(--color-text-muted)' }}>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
                                    <p style={{ color: 'var(--color-text-secondary)' }}>No orders found.</p>
                                </div>
                            ) : (
                                orders.map(order => {
                                    const statusStyle = (() => {
                                        if (order.orderStatus === 'completed') return { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '#4ade80' };
                                        if (order.orderStatus === 'processing') return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '#60a5fa' };
                                        if (order.orderStatus === 'cancelled') return { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: '#f87171' };
                                        return { bg: 'rgba(250,204,21,0.1)', color: '#facc15', border: '#facc15' };
                                    })();
                                    return (
                                        <div key={order._id} style={{
                                            background: 'var(--color-bg-card)', padding: '20px 24px', borderRadius: '12px',
                                            border: '1px solid var(--color-border)', display: 'flex',
                                            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>{order.orderNumber}</span>
                                                    <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <p style={{ fontWeight: '800', color: 'var(--color-primary, #ffc800)', fontSize: '18px' }}>
                                                EGP {order.total}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── FAVORITES ── */}
                    {activeTab === 'favorites' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Heart size={22} style={{ color: '#ff4d6d' }} fill="#ff4d6d" />
                                    My Favorites
                                </h2>
                                {favorites.length > 0 && (
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                        {favorites.length} saved game{favorites.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {loadingFavorites ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ background: 'var(--color-bg-card)', borderRadius: '14px', height: '260px', border: '1px solid var(--color-border)', opacity: 0.5 }} />
                                    ))}
                                </div>
                            ) : favorites.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                                    <Heart size={52} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
                                    <h3 style={{ color: 'white', marginBottom: '8px', fontFamily: 'Orbitron, sans-serif', fontSize: '16px' }}>No favorites yet</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                                        Browse games and click the heart icon to save them here.
                                    </p>
                                    <button onClick={() => navigate('/games')} style={{
                                        padding: '10px 24px', background: 'var(--color-primary, #ffc800)', color: '#000',
                                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                                    }}>
                                        Browse Games
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                    {favorites.map(item => {
                                        const product = item.product;
                                        if (!product) return null;
                                        const img = getImageUrl(product.images?.[0]);
                                        const isOnSale = product.discountPrice && product.discountPrice < product.price;

                                        return (
                                            <div key={item._id} style={{
                                                background: 'var(--color-bg-card)', borderRadius: '14px',
                                                border: '1px solid var(--color-border)', overflow: 'hidden',
                                                display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, border-color 0.2s',
                                                cursor: 'pointer', position: 'relative'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--color-primary, #ffc800)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                {/* Remove button */}
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleRemoveFavorite(product._id); }}
                                                    title="Remove from favorites"
                                                    style={{
                                                        position: 'absolute', top: '10px', right: '10px', zIndex: 2,
                                                        background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', cursor: 'pointer', color: '#ff4d6d', backdropFilter: 'blur(4px)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,109,0.3)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                {/* Sale badge */}
                                                {isOnSale && (
                                                    <div style={{
                                                        position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                                                        background: '#ff4d6d', color: '#fff', fontSize: '10px', fontWeight: '800',
                                                        padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px'
                                                    }}>
                                                        SALE
                                                    </div>
                                                )}

                                                {/* Cover image */}
                                                <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                                                    <img src={img} alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <p style={{
                                                        color: 'white', fontWeight: '600', fontSize: '13px', lineHeight: '1.3',
                                                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                                    }}>
                                                        {product.name}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                                                        <span style={{ color: 'var(--color-primary, #ffc800)', fontWeight: '800', fontSize: '14px' }}>
                                                            EGP {isOnSale ? product.discountPrice : product.price}
                                                        </span>
                                                        {isOnSale && (
                                                            <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '11px' }}>
                                                                EGP {product.price}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Add to cart */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleAddToCartFromFavorites(product); }}
                                                        style={{
                                                            marginTop: '6px', padding: '8px', background: 'var(--color-primary, #ffc800)', color: '#000',
                                                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                                                            fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                            transition: 'opacity 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                    >
                                                        <ShoppingCart size={13} />
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile responsive */}
            <style>{`
                @media (max-width: 700px) {
                    div[style*="grid-template-columns: clamp"] {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="grid-template-columns: clamp"] > div:first-child {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        position: static !important;
                    }
                    div[style*="grid-template-columns: clamp"] > div:first-child button {
                        flex: 1 1 120px !important;
                        justify-content: center !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
