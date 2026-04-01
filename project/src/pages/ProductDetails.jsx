import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productsAPI from '../api/products';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, ShoppingCart, Gamepad2, Globe, Tag, Home, Shield, Zap, CheckCircle, MessageCircle, AlertTriangle, Download, CreditCard, Clock, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReviewForm from '../components/ReviewForm';

import { getImageUrl } from '../utils/imageUtils';

// Add useToast to imports
import { useToast } from '../context/ToastContext';

// ... other imports

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { t, isRTL } = useLanguage();
    const { addToast } = useToast(); // Destructure addToast

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Image Loading State for Skeleton
    const [imageLoaded, setImageLoaded] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productsAPI.getProductById(id);
                setProduct(data);
            } catch (err) {
                console.error('Failed to load product:', err);
                setError('Product not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                const response = await client.get(`/reviews/product/${id}`);
                if (response.data.success) {
                    setReviews(response.data.data.reviews);
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const handleReviewAdded = (newReview) => {
        // Since reviews are moderated, we might not want to show it immediately
        // unless it's already approved. For now, let's just re-fetch or add if approved.
        // Actually, the backend creates it as isApproved: true by default (based on models/Review.js)
        setReviews(prev => [newReview, ...prev]);
    };

    const handleAddToCart = async () => {
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            addToast('Please select an account type/option', 'info');
            return;
        }

        try {
            setAdding(true);
            const variantData = selectedVariant ? { type: selectedVariant.type, price: selectedVariant.price } : null;
            await addToCart(id, quantity, variantData);
            addToast('Added to cart successfully!', 'success');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            addToast('Failed to add to cart. Please make sure you are logged in.', 'error');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <h2>{error || 'Product not found'}</h2>
                <button onClick={() => navigate('/games')} className="btn-secondary">Back to Games</button>
            </div>
        );
    }

    // Set default price or selected variant price
    const hasDiscount = !selectedVariant && product.discountPrice && product.discountPrice < product.price;
    const currentPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);
    const regularPrice = product.price;
    const mainImage = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : 'https://placehold.co/600x400';

    return (
        <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
            <main className="product-details-page" style={{ padding: 'clamp(20px, 5vw, 60px) 0' }}>
                <div className="container">
                    {/* Back Button */}
                    {/* Breadcrumbs */}
                    <div className="breadcrumb-nav">
                        <span onClick={() => navigate('/')} className="breadcrumb-item">
                            <Home size={14} /> Home
                        </span>
                        <ChevronRight size={14} />
                        <span onClick={() => navigate('/games')} className="breadcrumb-item">
                            {t('games')}
                        </span>
                        <ChevronRight size={14} />
                        <span className="breadcrumb-item active">
                            {product.name}
                        </span>
                    </div>

                    <div className="product-details-grid">
                        {/* Image Section */}
                        <div className="product-image-section">
                            {/* Skeleton Loader */}
                            {!imageLoaded && (
                                <div className="skeleton-image" />
                            )}

                            <div className="image-wrapper" style={{ display: imageLoaded ? 'block' : 'none' }}>
                                {/* Ambient Glow */}
                                <div className="ambient-glow" style={{ backgroundImage: `url(${mainImage})` }} />

                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    onLoad={() => setImageLoaded(true)}
                                    className="main-product-image"
                                    loading="eager"
                                    fetchpriority="high"
                                    decoding="async"
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0, 217, 255, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.6)';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="product-info-section">

                            {/* Title */}
                            <h1 className="product-title">{product.name}</h1>

                            {/* Description */}
                            <div className="product-description">
                                {product.description}
                            </div>

                            {/* Consolidated Metadata (Pills) */}
                            <div className="product-meta-pills">
                                {[
                                    { icon: Gamepad2, label: product.platform },
                                    { icon: Globe, label: product.region },
                                    { icon: Tag, label: product.type },
                                    { icon: product.stock > 0 ? CheckCircle : AlertTriangle, label: product.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK', color: product.stock > 0 ? '#10b981' : '#ef4444' }
                                ].map((meta, idx) => (
                                    <div key={idx} className="meta-pill" style={{ color: meta.color || '#e4e4e7' }}>
                                        <meta.icon size={14} color={meta.color || '#a1a1aa'} />
                                        {meta.label}
                                    </div>
                                ))}
                            </div>

                            {/* Price & Actions Row */}
                            <div className="product-actions-row">

                                {/* Pricing Block */}
                                <div className="pricing-block">
                                    <span className="current-price">
                                        <span className="currency-symbol">EGP</span>
                                        {parseFloat(currentPrice).toFixed(2)}
                                    </span>

                                    {hasDiscount && (
                                        <div className="discount-block">
                                            <div className="discount-badge">
                                                SAVE {Math.round(((regularPrice - currentPrice) / regularPrice) * 100)}%
                                            </div>
                                            <span className="old-price">
                                                {parseFloat(regularPrice).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Block */}
                                <div className="actions-block">

                                    {/* Quantity */}
                                    <div className="quantity-selector">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <span className="qty-value">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Power CTA */}
                                    <button
                                        className={`add-to-cart-btn ${adding || product.stock <= 0 ? 'disabled' : ''}`}
                                        onClick={handleAddToCart}
                                        disabled={adding || product.stock <= 0}
                                    >
                                        <ShoppingCart size={20} strokeWidth={2.5} />
                                        <span>{adding ? t('adding') : product.stock <= 0 ? t('outOfStock') : t('addToCart')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Variant Selector (If exists) - Refined */}
                            {product.variants && product.variants.length > 0 && (
                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 style={{ fontSize: '0.85rem', marginBottom: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
                                        {t('selectOption')}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                        {product.variants.map((variant, idx) => (
                                            <label
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 16px',
                                                    background: selectedVariant === variant ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${selectedVariant === variant ? 'var(--color-cyan-primary)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    transform: selectedVariant === variant ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        checked={selectedVariant === variant}
                                                        onChange={() => setSelectedVariant(variant)}
                                                        style={{ accentColor: 'var(--color-cyan-primary)' }}
                                                    />
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: selectedVariant === variant ? '#fff' : '#d4d4d8', fontFamily: '"Inter", sans-serif' }}>
                                                        {variant.type}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: '700', color: selectedVariant === variant ? 'var(--color-cyan-primary)' : '#fff', fontFamily: '"Inter", sans-serif' }}>
                                                    {variant.price}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="product-reviews-section">
                        <div className="reviews-layout">
                            {/* Write Review Column */}
                            <div className="write-review-col">
                                <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
                            </div>

                            {/* Show Reviews Column */}
                            <div className="reviews-list-col">
                                <div className="reviews-header">
                                    <h2 className="reviews-title">
                                        CUSTOMER REVIEWS
                                    </h2>
                                    <div className="underline-accent"></div>
                                </div>

                                {reviewsLoading ? (
                                    <div className="loading-container"><LoadingSpinner /></div>
                                ) : reviews.length === 0 ? (
                                    <div className="empty-reviews-card">
                                        <div className="empty-reviews-icon">
                                            <MessageCircle size={32} color="var(--color-primary, #ffc800)" style={{ opacity: 0.6 }} />
                                        </div>
                                        <div className="empty-reviews-text">
                                            <h4 className="empty-title">Be the first to review</h4>
                                            <p className="empty-subtitle">
                                                Share your thoughts with other gamers. Your feedback helps the community grow!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="reviews-stack">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="review-card">
                                                <div className="review-card-header">
                                                    <div className="user-info">
                                                        <div className="user-avatar">
                                                            {review.user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="user-meta">
                                                            <div className="user-name">{review.user?.name}</div>
                                                            <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="rating-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill={i < review.rating ? 'var(--color-primary, #ffc800)' : 'transparent'}
                                                                color={i < review.rating ? 'var(--color-primary, #ffc800)' : 'rgba(255,255,255,0.1)'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <h4 className="review-title">{review.title}</h4>
                                                <p className="review-content">{review.comment}</p>
                                                {review.isVerified && (
                                                    <div className="verified-badge">
                                                        <CheckCircle size={14} /> Verified Purchase
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </main>

            <style>{`
                .product-details-page {
                    padding: clamp(20px, 5vw, 60px) 0;
                }

                .container {
                    padding: 0 clamp(16px, 4vw, 24px);
                    max-width: 1280px;
                    margin: 0 auto;
                }

                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 30px;
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                }

                .breadcrumb-item {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: color 0.2s;
                }

                .breadcrumb-item:hover {
                    color: var(--color-cyan-primary);
                }

                .breadcrumb-item.active {
                    color: var(--color-text-primary);
                    font-weight: var(--fw-semibold);
                    cursor: default;
                }

                .product-details-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                    align-items: start;
                }

                .product-image-section {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                }

                .image-wrapper {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
                }

                .main-product-image {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 3/4;
                    object-fit: cover;
                    border-radius: 12px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .product-info-section {
                    padding: clamp(20px, 5vw, 40px);
                    background: rgba(22, 22, 24, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    backdrop-filter: blur(16px);
                    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
                }

                .product-title {
                    margin-bottom: 16px;
                    color: var(--color-text-primary);
                    font-family: var(--font-display);
                    font-size: clamp(2rem, 6vw, 3.5rem);
                    font-weight: var(--fw-semibold);
                    line-height: 1.1;
                    letter-spacing: var(--ls-heading);
                    text-transform: uppercase;
                    word-wrap: break-word;
                }

                .product-description {
                    margin-bottom: 32px;
                    color: #a1a1aa;
                    font-size: 1rem;
                    line-height: 1.6;
                    font-family: var(--font-body);
                    max-width: 100%;
                }

                .product-meta-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .meta-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 100px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    font-size: 0.65rem;
                    fontWeight: var(--fw-bold);
                    letter-spacing: var(--ls-nav);
                    text-transform: uppercase;
                    font-family: var(--font-display);
                    white-space: nowrap;
                }

                .product-actions-row {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .pricing-block {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .current-price {
                    font-size: clamp(2rem, 8vw, 3rem);
                    font-weight: var(--fw-semibold);
                    color: var(--color-text-primary);
                    font-family: var(--font-body);
                    letter-spacing: -0.02em;
                    display: flex;
                    align-items: flex-start;
                }

                .currency-symbol {
                    font-size: 0.5em;
                    margin-right: 4px;
                    opacity: 0.8;
                    margin-top: 0.2em;
                }

                .discount-block {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .discount-badge {
                    background: #ef4444;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    line-height: 1;
                    width: fit-content;
                }

                .old-price {
                    font-size: 0.9rem;
                    color: #71717a;
                    text-decoration: line-through;
                    font-family: var(--font-body);
                }

                .actions-block {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .quantity-selector {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    height: 56px;
                    max-width: 140px;
                }

                .qty-btn {
                    width: 48px;
                    height: 100%;
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: color 0.2s;
                }

                .qty-btn:hover {
                    color: var(--color-cyan-primary);
                }

                .qty-value {
                    font-size: 1.1rem;
                    font-weight: var(--fw-semibold);
                    font-family: var(--font-body);
                }

                .add-to-cart-btn {
                    height: 56px;
                    flex: 1;
                    background: var(--color-cyan-primary);
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: var(--fw-bold);
                    font-family: var(--font-display);
                    letter-spacing: var(--ls-nav);
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .add-to-cart-btn:not(.disabled):hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                    box-shadow: 0 0 30px rgba(0, 217, 255, 0.6);
                    cursor: pointer;
                }

                .add-to-cart-btn.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .product-reviews-section {
                    margin-top: clamp(40px, 10vw, 80px);
                }

                .reviews-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 40px;
                }

                .reviews-header {
                    margin-bottom: 30px;
                }

                .reviews-title {
                    font-family: var(--font-display);
                    font-size: clamp(24px, 5vw, 28px);
                    color: #fff;
                    margin-bottom: 8px;
                }

                .underline-accent {
                    width: 60px;
                    height: 4px;
                    background: var(--color-primary, #ffc800);
                    border-radius: 2px;
                }

                .empty-reviews-card {
                    padding: clamp(30px, 8vw, 50px) 20px;
                    text-align: center;
                    background: rgba(255,255,255,0.02);
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }

                .empty-reviews-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(255, 200, 0, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 200, 0, 0.1);
                }

                .empty-title {
                    color: var(--color-text-primary);
                    fontSize: 18px;
                    marginBottom: 8px;
                    font-family: var(--font-display);
                }

                .empty-subtitle {
                    color: rgba(255,255,255,0.4);
                    fontSize: 14px;
                    maxWidth: 300px;
                    margin: 0 auto;
                    lineHeight: 1.6;
                }

                .review-card {
                    padding: 24px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    transition: all 0.3s;
                }

                .review-card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #ffc800 0%, #ff9d00 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: black;
                }

                .user-name {
                    fontWeight: 700;
                    color: #fff;
                    fontSize: 14px;
                }

                .review-date {
                    color: rgba(255,255,255,0.4);
                    fontSize: 11px;
                }

                .rating-stars {
                    display: flex;
                    gap: 2px;
                }

                .review-title {
                    color: #fff;
                    marginBottom: 8px;
                    fontSize: 16px;
                }

                .review-content {
                    color: rgba(255,255,255,0.6);
                    fontSize: 14px;
                    lineHeight: 1.6;
                }

                .verified-badge {
                    marginTop: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #2ed573;
                    fontSize: 12px;
                    fontWeight: 600;
                }

                @media (min-width: 640px) {
                    .actions-block {
                        flex-direction: row;
                    }

                    .add-to-cart-btn {
                        flex: 1;
                    }
                }

                @media (min-width: 1024px) {
                    .product-details-grid {
                        grid-template-columns: repeat(12, 1fr);
                        gap: 40px;
                    }

                    .product-image-section {
                        grid-column: span 4;
                        position: sticky;
                        top: 100px;
                    }

                    .product-info-section {
                        grid-column: span 8;
                    }

                    .product-actions-row {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .actions-block {
                        flex: 1;
                        justify-content: flex-end;
                        min-width: 380px;
                    }

                    .reviews-layout {
                        grid-template-columns: 1fr 1.5fr;
                        gap: 60px;
                    }

                    .main-product-image:hover {
                        transform: scale(1.05) translateY(-10px);
                        box-shadow: 0 30px 60px -15px rgba(0, 217, 255, 0.3);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
