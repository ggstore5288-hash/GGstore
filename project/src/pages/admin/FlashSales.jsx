import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Trash2, Clock, Zap, Timer, Search, Filter, AlertTriangle, Calendar } from 'lucide-react';
import adminAPI from '../../api/admin';
import { getImageUrl } from '../../utils/imageUtils';

const FlashSales = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        productId: '',
        discountPrice: '',
        endsAt: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [salesRes, productsRes] = await Promise.all([
                adminAPI.getFlashSales(),
                adminAPI.getProducts(1, 1000)
            ]);
            setFlashSales(salesRes?.data?.flashSales || []);
            setProducts(productsRes?.products || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            productId: '',
            discountPrice: '',
            endsAt: ''
        });
        setSearchTerm('');
        setIsModalOpen(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to end this flash sale?')) {
            try {
                await adminAPI.endFlashSale(productId);
                loadData();
            } catch (error) {
                alert('Failed to end flash sale: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createFlashSale({
                productId: formData.productId,
                discountPrice: parseFloat(formData.discountPrice),
                endsAt: formData.endsAt
            });
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to create flash sale: ' + error.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const calculateDiscount = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.isFlashSale
    );

    return (
        <div className="pro-flash-sales">
            <style>{`
                .pro-flash-sales { animation: fadeIn 0.4s ease-out; max-width: 1440px; margin: 0 auto; color: #fff; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .nav-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                .title-block h1 { 
                    font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 4px;
                    background: linear-gradient(to right, #fff, var(--color-primary, #ffc800)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .title-block p { color: var(--color-text-muted); font-size: 14px; }

                .stats-ribbon { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px; }
                .ribbon-card { 
                    background: var(--color-bg-card, #161618); border: 1px solid var(--color-border, rgba(255,255,255,0.05)); padding: 24px; border-radius: 20px; 
                    position: relative; overflow: hidden; transition: all 0.2s;
                }
                .ribbon-card:hover { transform: translateY(-4px); border-color: rgba(255,200,0,0.3); }
                .ribbon-label { font-size: 10px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
                .ribbon-val { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
                
                .sales-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                .sale-card {
                    background: var(--color-bg-card, #161618);
                    border: 1px solid var(--color-border, rgba(255,255,255,0.05));
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .sale-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--color-primary, #ffc800);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 200, 0, 0.1);
                }

                .sale-image {
                    height: 200px;
                    position: relative;
                }

                .sale-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sale-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                }

                .discount-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: #ff4d4d;
                    color: white;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(255, 77, 77, 0.4);
                }

                .timer-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(12px);
                    color: var(--color-primary, #ffc800);
                    padding: 6px 12px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid rgba(255, 200, 0, 0.3);
                }

                .sale-content {
                    padding: 24px;
                }

                .sale-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .price-info {
                    display: flex;
                    align-items: baseline;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .new-price {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--color-primary, #ffc800);
                }

                .old-price {
                    font-size: 16px;
                    color: var(--color-text-muted, rgba(255, 255, 255, 0.4));
                    text-decoration: line-through;
                }

                .sale-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--color-text-muted, rgba(255, 255, 255, 0.4));
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .end-btn-container {
                    margin-top: 20px;
                }

                .end-btn {
                    width: 100%;
                    background: rgba(255, 77, 77, 0.05);
                    color: #ff4d4d;
                    border: 1px solid rgba(255, 77, 77, 0.2);
                    padding: 14px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 700;
                    font-size: 14px;
                }

                .end-btn:hover {
                    background: #ff4d4d;
                    color: white;
                    transform: scale(1.02);
                    box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
                }

                .btn-primary-pro {
                    background: linear-gradient(135deg, #ffc800 0%, #ff9d00 100%);
                    color: #000;
                    padding: 12px 28px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(255, 200, 0, 0.3);
                    font-family: 'Inter', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 14px;
                }

                .btn-primary-pro:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 200, 0, 0.5);
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }

                .modal-content {
                    background: #111113;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    width: 100%;
                    max-width: 550px;
                    padding: 40px;
                    position: relative;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 10px;
                    color: var(--color-text-muted, rgba(255, 255, 255, 0.6));
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input, .form-select {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 16px;
                    border-radius: 16px;
                    color: white;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    transition: all 0.2s;
                }

                .form-input:focus, .form-select:focus {
                    border-color: var(--color-primary, #ffc800);
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 0 4px rgba(255, 200, 0, 0.1);
                }

                .empty-state {
                    text-align: center;
                    padding: 100px 40px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 2px dashed rgba(255, 255, 255, 0.05);
                    border-radius: 32px;
                }

                .spin { animation: spin 1s infinite linear; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <header className="nav-header">
                <div className="title-block">
                    <h1>Flash Sales</h1>
                    <p>Manage high-velocity limited-time product discounts</p>
                </div>
                <button onClick={handleAdd} className="btn-primary-pro">
                    <Plus size={18} strokeWidth={3} />
                    Create Flash Sale
                </button>
            </header>

            <div className="stats-ribbon">
                <div className="ribbon-card">
                    <div className="ribbon-label">Active Sales</div>
                    <div className="ribbon-val" style={{ color: '#ffc800' }}>{flashSales.length}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <Timer size={14} color="#ffc800" />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Real-time monitoring enabled</span>
                    </div>
                </div>
                <div className="ribbon-card">
                    <div className="ribbon-label">Expiring Soon</div>
                    <div className="ribbon-val" style={{ color: '#ff4d4d' }}>
                        {flashSales.filter(s => {
                            const diff = new Date(s.flashSaleEndsAt) - new Date();
                            return diff > 0 && diff < (1000 * 60 * 60 * 24);
                        }).length}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <AlertTriangle size={14} color="#ff4d4d" />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Critical timeline (24h)</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 24px', position: 'relative' }}>
                        <Clock className="spin" size={48} color="#ffc800" />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Synchronizing flash sale intelligence...</p>
                </div>
            ) : flashSales.length === 0 ? (
                <div className="empty-state">
                    <Zap size={64} style={{ marginBottom: '24px', color: '#ffc800', opacity: 0.3 }} />
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', marginBottom: '12px' }}>No Active Power-ups</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Your store is currently running at base prices. Create a flash sale to boost performance.</p>
                    <button onClick={handleAdd} className="btn-primary-pro" style={{ margin: '0 auto' }}>
                        Activate First Sale
                    </button>
                </div>
            ) : (
                <div className="sales-grid">
                    {flashSales.map(sale => {
                        const product = sale;
                        const discount = calculateDiscount(product.price, product.discountPrice);
                        const timeRemaining = getTimeRemaining(product.flashSaleEndsAt);

                        return (
                            <div key={product._id} className="sale-card">
                                <div className="sale-image">
                                    <img
                                        src={getImageUrl(product.images?.[0] || product.image)}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loops
                                            e.target.src = 'https://placehold.co/400x300/1a212c/64748b?text=Image+Not+Found';
                                        }}
                                    />
                                    <div className="sale-overlay" />
                                    <div className="discount-badge">-{discount}%</div>
                                    <div className="timer-badge">
                                        <Clock size={14} />
                                        {timeRemaining}
                                    </div>
                                </div>

                                <div className="sale-content">
                                    <h3 className="sale-title">{product.name}</h3>
                                    <div className="price-info">
                                        <span className="new-price">${product.discountPrice}</span>
                                        <span className="old-price">${product.price}</span>
                                    </div>
                                    <div className="sale-footer">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            Ends {formatDate(product.flashSaleEndsAt)}
                                        </span>
                                    </div>
                                    <div className="end-btn-container">
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="end-btn"
                                        >
                                            <Trash2 size={18} />
                                            Terminate Flash Sale
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsModalOpen(false)}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 800 }}>New Campaign</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '12px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Search Intelligence</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: '52px' }}
                                        placeholder="Scan products by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Target Product *</label>
                                <select
                                    className="form-select"
                                    value={formData.productId}
                                    onChange={e => {
                                        const product = products.find(p => p._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            productId: e.target.value,
                                            discountPrice: product ? (product.price * 0.5).toFixed(2) : ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">{searchTerm ? `Results for "${searchTerm}"` : 'Select target unit'}</option>
                                    {filteredProducts.slice(0, 15).map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} (${product.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Sale Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={formData.discountPrice}
                                        onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiration Date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.endsAt}
                                        onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary-pro" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '18px' }}>
                                <Zap size={20} strokeWidth={3} />
                                Deploy Flash Sale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashSales;
