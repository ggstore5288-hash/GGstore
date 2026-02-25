import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';
import client from '../api/client';

const GameCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    // Check if already in wishlist on mount (only if logged in)
    useEffect(() => {
        if (!isAuthenticated || !product?._id) return;
        client.get(`/wishlist/check/${product._id}`)
            .then(res => { if (res.data?.data?.isInWishlist) setIsFavorited(true); })
            .catch(() => { });
    }, [product._id, isAuthenticated]);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            addToast('Please login to add items to cart', 'info');
            return;
        }

        try {
            await addToCart(product._id, 1);
            addToast('Added to cart', 'success');
        } catch (error) {
            addToast('Failed to add to cart', 'error');
        }
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            addToast('Please login to save favorites', 'info');
            return;
        }

        if (favLoading) return;
        setFavLoading(true);
        try {
            if (isFavorited) {
                await client.delete(`/wishlist/${product._id}`);
                setIsFavorited(false);
                addToast('Removed from favorites', 'success');
            } else {
                await client.post('/wishlist', { productId: product._id });
                setIsFavorited(true);
                addToast('Added to favorites ❤️', 'success');
            }
        } catch (error) {
            addToast(error.message || 'Could not update favorites', 'error');
        } finally {
            setFavLoading(false);
        }
    };

    const discountPercentage = product.price && product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const isFlashSale = product.isFlashSale && product.flashSaleEndsAt && new Date(product.flashSaleEndsAt) > new Date();

    // Default image if missing
    const image = product.images && product.images.length > 0
        ? getImageUrl(product.images[0])
        : 'https://placehold.co/300x400?text=No+Image';

    return (
        <Link to={`/product/${product._id}`} className="game-card">
            <style>{`
                .game-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                }

                .game-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 
                                0 0 0 1px var(--color-cyan-primary);
                }

                .card-image-container {
                    position: relative;
                    padding-top: 133%; /* 3:4 Aspect Ratio */
                    overflow: hidden;
                    background: #05050a;
                }

                .card-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .game-card:hover .card-image {
                    transform: scale(1.1);
                }

                .card-badges {
                    position: absolute;
                    top: clamp(8px, 2vw, 12px);
                    left: clamp(8px, 2vw, 12px);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    z-index: 2;
                }

                .badge {
                    padding: 4px clamp(6px, 1.5vw, 10px);
                    border-radius: 4px;
                    font-size: clamp(9px, 1.1vw, 11px);
                    font-weight: var(--fw-bold);
                    text-transform: uppercase;
                    letter-spacing: var(--ls-heading);
                }

                .badge-sale {
                    background: #ff4444;
                    color: white;
                    box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
                }

                .badge-flash {
                    background: #ffc800;
                    color: black;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 0 15px rgba(255, 200, 0, 0.5);
                }

                .badge-new {
                    background: var(--color-cyan-primary);
                    color: black;
                    box-shadow: 0 0 10px rgba(0, 217, 255, 0.4);
                }

                .card-actions {
                    position: absolute;
                    top: clamp(8px, 2vw, 12px);
                    right: clamp(8px, 2vw, 12px);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 2;
                    transform: translateX(10px);
                }

                .game-card:hover .card-actions {
                    opacity: 1;
                    transform: translateX(0);
                }

                .action-btn {
                    width: clamp(28px, 4vw, 36px);
                    height: clamp(28px, 4vw, 36px);
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--color-cyan-primary);
                    color: black;
                    border-color: var(--color-cyan-primary);
                    transform: scale(1.1);
                }

                .card-content {
                    padding: clamp(12px, 3vw, 16px);
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(to bottom, transparent, rgba(0, 217, 255, 0.02));
                }

                .card-title {
                    font-family: var(--font-display);
                    font-size: clamp(13px, 1.5vw, 15px);
                    color: var(--color-text-primary);
                    margin: 0 0 6px 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 1.4;
                    font-weight: var(--fw-medium);
                    letter-spacing: var(--ls-heading);
                }

                .card-category {
                    font-size: clamp(10px, 1.1vw, 11px);
                    color: var(--color-text-muted);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: var(--ls-nav);
                    font-weight: var(--fw-medium);
                }

                .card-footer {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .price-container {
                    display: flex;
                    flex-direction: column;
                }

                .original-price {
                    font-size: clamp(9px, 1.1vw, 11px);
                    color: var(--color-text-muted);
                    text-decoration: line-through;
                    margin-bottom: -2px;
                }

                .current-price {
                    font-size: clamp(15px, 2vw, 18px);
                    font-weight: var(--fw-semibold);
                    color: var(--color-cyan-primary);
                    font-family: var(--font-body);
                }

                .flash-timer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(255, 200, 0, 0.4), #ffc800);
                    color: black;
                    padding: 8px;
                    font-size: 10px;
                    font-weight: var(--fw-bold);
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 3;
                }

                .game-card:hover .flash-timer {
                    opacity: 1;
                }

                @media (max-width: 640px) {
                    .card-actions {
                        opacity: 1;
                        transform: none;
                    }
                    
                    .badge {
                        padding: 3px 6px;
                    }
                }
            `}</style>

            <div className="card-image-container">
                <img src={image} alt={product.name} className="card-image" />

                <div className="card-badges">
                    {isFlashSale && (
                        <span className="badge badge-flash">⚡ FLASH</span>
                    )}
                    {discountPercentage > 0 && !isFlashSale && (
                        <span className="badge badge-sale">-{discountPercentage}%</span>
                    )}
                    {product.isNew && (
                        <span className="badge badge-new">NEW</span>
                    )}
                </div>

                <div className="card-actions">
                    <button
                        className="action-btn"
                        onClick={handleToggleFavorite}
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        style={{ opacity: favLoading ? 0.5 : 1 }}
                    >
                        <Heart
                            size={16}
                            fill={isFavorited ? '#ff4d6d' : 'none'}
                            color={isFavorited ? '#ff4d6d' : 'white'}
                        />
                    </button>
                    <button className="action-btn" onClick={handleAddToCart} title="Add to Cart">
                        <ShoppingCart size={16} />
                    </button>
                </div>

                {isFlashSale && (
                    <div className="flash-timer">
                        ENDS SOON
                    </div>
                )}
            </div>

            <div className="card-content">
                <h3 className="card-title" title={product.name}>{product.name}</h3>
                <div className="card-category">{product.category?.name || 'Game'}</div>

                <div className="card-footer">
                    <div className="price-container">
                        {product.discountPrice && product.discountPrice < product.price ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="current-price" style={{ color: isFlashSale ? '#ffc800' : 'var(--color-cyan-primary)' }}>
                                    ${product.discountPrice.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="current-price">${product.price?.toFixed(2)}</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} fill="var(--color-cyan-primary)" color="var(--color-cyan-primary)" />
                        <span style={{ fontSize: '11px', fontWeight: 'var(--fw-bold)' }}>{product.averageRating || '5.0'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;
