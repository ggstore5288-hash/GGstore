import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import client from '../api/client';
import { getImageUrl } from '../utils/imageUtils';

const ReviewSlider = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    const fetchSliderReviews = async () => {
        try {
            const response = await client.get('/reviews/slider');
            if (response.data.success) {
                setReviews(response.data.data.reviews);
            }
        } catch (error) {
            console.error('Error fetching slider reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliderReviews();
    }, []);

    useEffect(() => {
        if (reviews.length > 0) {
            resetTimeout();
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
            }, 6000);
        }
        return () => resetTimeout();
    }, [currentIndex, reviews]);

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading) return null;
    if (reviews.length === 0) return null;

    return (
        <section className="review-slider-section">
            <div className="section-container">
                <div className="section-header">
                    <span className="section-tag">Testimonials</span>
                    <h2 className="section-title">GAMER EXPERIENCES</h2>
                    <div className="section-divider"></div>
                </div>

                <div className="slider-wrapper">
                    <div className="slider-controls">
                        <button className="control-btn" onClick={prevSlide}>
                            <ChevronLeft size={24} />
                        </button>
                        <button className="control-btn" onClick={nextSlide}>
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="slides-container">
                        {reviews.map((review, idx) => (
                            <div
                                key={review._id}
                                className={`review-slide ${idx === currentIndex ? 'active' : ''}`}
                                style={{ display: idx === currentIndex ? 'flex' : 'none' }}
                            >
                                <div className="review-visual">
                                    <div className="product-peek">
                                        <img
                                            src={getImageUrl(review.product?.images?.[0])}
                                            alt={review.product?.name}
                                        />
                                        <div className="product-name">{review.product?.name}</div>
                                    </div>
                                    <div className="quote-icon-bg">
                                        <Quote size={80} />
                                    </div>
                                </div>

                                <div className="review-content">
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                fill={i < review.rating ? 'var(--color-primary)' : 'transparent'}
                                                color={i < review.rating ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}
                                            />
                                        ))}
                                    </div>

                                    <h3 className="review-title">"{review.title}"</h3>
                                    <p className="review-text">{review.comment}</p>

                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {review.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="reviewer-details">
                                            <span className="reviewer-name">{review.user?.name}</span>
                                            <span className="verify-badge">Verified Buyer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="slider-dots">
                        {reviews.map((_, idx) => (
                            <button
                                key={idx}
                                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .review-slider-section {
                    padding: 100px 0;
                    background: radial-gradient(circle at 50% 50%, rgba(255, 200, 0, 0.03) 0%, transparent 70%);
                    overflow: hidden;
                    position: relative;
                }

                .section-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 40px;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 60px;
                }

                .section-tag {
                    color: var(--color-primary, #ffc800);
                    font-family: 'Inter', sans-serif;
                    font-weight: 800;
                    letter-spacing: 4px;
                    font-size: 12px;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 12px;
                }

                .section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 42px;
                    font-weight: 900;
                    color: white;
                    margin-bottom: 20px;
                    letter-spacing: 2px;
                }

                .section-divider {
                    width: 80px;
                    height: 4px;
                    background: var(--color-primary, #ffc800);
                    margin: 0 auto;
                    border-radius: 2px;
                }

                .slider-wrapper {
                    position: relative;
                    min-height: 400px;
                }

                .review-slide {
                    display: flex;
                    align-items: center;
                    gap: 60px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 40px;
                    padding: 60px;
                    backdrop-filter: blur(20px);
                    animation: slideFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideFadeIn {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .review-visual {
                    flex: 0 0 300px;
                    position: relative;
                }

                .product-peek {
                    position: relative;
                    z-index: 2;
                    transform: rotate(-5deg);
                    transition: transform 0.5s;
                }

                .product-peek:hover {
                    transform: rotate(0) scale(1.05);
                }

                .product-peek img {
                    width: 100%;
                    aspect-ratio: 3/4;
                    object-fit: cover;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }

                .product-name {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(10px);
                    padding: 10px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    text-align: center;
                    color: white;
                }

                .quote-icon-bg {
                    position: absolute;
                    top: -40px;
                    right: -20px;
                    color: rgba(255, 200, 0, 0.05);
                    z-index: 1;
                }

                .review-content {
                    flex: 1;
                }

                .rating-stars {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 24px;
                }

                .review-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 20px;
                    line-height: 1.4;
                }

                .review-text {
                    font-size: 18px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.8;
                    margin-bottom: 40px;
                    font-style: italic;
                }

                .reviewer-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .reviewer-avatar {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #ffc800 0%, #ff9d00 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 20px;
                    color: black;
                }

                .reviewer-details {
                    display: flex;
                    flex-direction: column;
                }

                .reviewer-name {
                    font-weight: 700;
                    font-size: 16px;
                    color: white;
                }

                .verify-badge {
                    font-size: 12px;
                    color: #2ed573;
                    font-weight: 600;
                }

                .slider-controls {
                    position: absolute;
                    top: 50%;
                    left: -20px;
                    right: -20px;
                    display: flex;
                    justify-content: space-between;
                    transform: translateY(-50%);
                    z-index: 10;
                    pointer-events: none;
                }

                .control-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    pointer-events: auto;
                    backdrop-filter: blur(10px);
                }

                .control-btn:hover {
                    background: var(--color-primary, #ffc800);
                    color: black;
                    border-color: var(--color-primary, #ffc800);
                    transform: scale(1.1);
                }

                .slider-dots {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 40px;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .dot.active {
                    background: var(--color-primary, #ffc800);
                    width: 30px;
                    border-radius: 5px;
                }

                @media (max-width: 968px) {
                    .review-slide {
                        flex-direction: column;
                        padding: 40px;
                        gap: 30px;
                        text-align: center;
                    }

                    .review-visual {
                        flex: 0 0 auto;
                        width: 200px;
                        margin: 0 auto;
                    }

                    .rating-stars, .reviewer-info {
                        justify-content: center;
                    }

                    .section-title {
                        font-size: 32px;
                    }

                    .review-title {
                        font-size: 22px;
                    }

                    .review-text {
                        font-size: 16px;
                    }
                }
            `}} />
        </section>
    );
};

export default ReviewSlider;
