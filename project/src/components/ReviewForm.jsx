import React, { useState } from 'react';
import { Star, Send, Loader2, AlertCircle } from 'lucide-react';
import client from '../api/client';

const ReviewForm = ({ productId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await client.post('/reviews', {
                productId,
                rating,
                title,
                comment
            });

            if (response.data.success) {
                setSuccess(true);
                setTitle('');
                setComment('');
                setRating(5);
                if (onReviewAdded) onReviewAdded(response.data.data.review);

                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            const backendError = err.response?.data?.message || err.response?.data?.error;
            setError(backendError || 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="review-success-panel">
                <div className="success-icon">✓</div>
                <h3>Review Submitted!</h3>
                <p>Thank you for your feedback. Your review has been sent for moderation.</p>
            </div>
        );
    }

    return (
        <form className="review-form-pro" onSubmit={handleSubmit}>
            <div className="form-header">
                <h3>Write a Review</h3>
                <p>Share your experience with this product</p>
            </div>

            {error && (
                <div className="error-alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="rating-selector">
                <label className="form-label">Overall Rating</label>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-btn ${(hover || rating) >= star ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star
                                size={28}
                                fill={(hover || rating) >= star ? 'var(--color-primary)' : 'transparent'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="review-title">Review Title</label>
                <input
                    id="review-title"
                    type="text"
                    className="form-input"
                    placeholder="Enter a brief summary of your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="review-comment">Detailed Feedback</label>
                <textarea
                    id="review-comment"
                    className="form-input textarea"
                    placeholder="What did you like or dislike? How's the performance?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    required
                />
            </div>

            <button
                type="submit"
                className="btn-submit-review"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Submitting...</span>
                    </>
                ) : (
                    <>
                        <Send size={20} />
                        <span>Submit Review</span>
                    </>
                )}
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .review-form-pro {
                    background: rgba(22, 22, 24, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 32px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .form-header {
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 20px;
                }

                .form-header h3 {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .form-header p {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }

                .rating-selector {
                    margin-bottom: 24px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 10px;
                }

                .star-rating {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }

                .star-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    color: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .star-btn.active {
                    color: var(--color-primary, #ffc800);
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 8px var(--color-primary, #ffc800));
                }

                .star-btn:hover {
                    transform: scale(1.2) translateY(-2px);
                    color: var(--color-primary, #ffc800);
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 18px;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--color-primary, #ffc800);
                    background: rgba(0, 0, 0, 0.3);
                    box-shadow: 0 0 15px rgba(255, 200, 0, 0.1);
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }

                .textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 12px 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-size: 14px;
                }

                .btn-submit-review {
                    width: 100%;
                    background: var(--color-primary, #ffc800);
                    color: black;
                    border: none;
                    padding: 18px;
                    border-radius: 14px;
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 800;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 10px;
                    box-shadow: 0 4px 15px rgba(255, 200, 0, 0.2);
                }

                .btn-submit-review:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 200, 0, 0.4);
                }

                .btn-submit-review:active:not(:disabled) {
                    transform: translateY(0);
                }

                .btn-submit-review:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .review-success-panel {
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                    animation: fadeIn 0.5s ease;
                }

                .success-icon {
                    width: 64px;
                    height: 64px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    margin: 0 auto 24px;
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
                }

                .review-success-panel h3 {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 24px;
                    color: white;
                    margin-bottom: 12px;
                }

                .review-success-panel p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 15px;
                    max-width: 300px;
                    margin: 0 auto;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </form>
    );
};

export default ReviewForm;
