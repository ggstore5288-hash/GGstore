import React, { useState, useEffect } from 'react';
import { Check, X as XIcon, Star, Eye, Filter, BarChart3 } from 'lucide-react';
import adminAPI from '../../api/admin';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        approved: '',
        rating: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        averageRating: 0
    });

    useEffect(() => {
        loadReviews();
        loadStats();
    }, [page, filters]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getReviews(page, 50, filters.approved, filters.rating);
            setReviews(result?.data?.reviews || []);
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const allReviews = await adminAPI.getReviews(1, 1000, '', '');
            const reviewsList = allReviews?.data?.reviews || [];
            const total = reviewsList.length;
            const approved = reviewsList.filter(r => r.isApproved).length;
            const pending = total - approved;
            const avgRating = reviewsList.length > 0
                ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length
                : 0;

            setStats({ total, approved, pending, averageRating: avgRating });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleModerate = async (reviewId, isApproved, showInSlider) => {
        try {
            await adminAPI.moderateReview(reviewId, isApproved, showInSlider);
            loadReviews();
            loadStats();
        } catch (error) {
            alert('Failed to moderate review: ' + error.message);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ approved: '', rating: '' });
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                style={{
                    fill: i < rating ? '#ffc800' : 'none',
                    color: i < rating ? '#ffc800' : 'var(--color-text-muted)'
                }}
            />
        ));
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Reviews</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Moderate product reviews
                    </p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                    <Filter size={18} />
                    Filters
                </button>
            </header>

            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Reviews</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Approved</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>{stats.approved}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Pending</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc800' }}>{stats.pending}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Average Rating</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                        {stats.averageRating.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Approval Status</label>
                            <select
                                className="form-select"
                                value={filters.approved}
                                onChange={e => handleFilterChange('approved', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Rating</label>
                            <select
                                className="form-select"
                                value={filters.rating}
                                onChange={e => handleFilterChange('rating', e.target.value)}
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '16px' }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="empty-state">
                    <Star size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No reviews found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Status</th>
                                    <th>Slider</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {review.product?.images?.[0] && (
                                                    <img
                                                        src={review.product.images[0]}
                                                        alt=""
                                                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{review.product?.name || '-'}</div>
                                                    {review.isVerified && (
                                                        <span style={{ fontSize: '10px', color: '#00ff80' }}>✓ Verified Purchase</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{review.user?.name || '-'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {review.user?.email || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {renderStars(review.rating)}
                                                <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>{review.rating}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '300px' }}>
                                                {review.title && (
                                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{review.title}</div>
                                                )}
                                                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                                    {review.comment ? (review.comment.length > 100 ? review.comment.substring(0, 100) + '...' : review.comment) : '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${review.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                                                {review.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleModerate(review._id, undefined, !review.showInSlider)}
                                                className={`icon-btn ${review.showInSlider ? 'active' : ''}`}
                                                style={{
                                                    color: review.showInSlider ? '#ffc800' : 'rgba(255,255,255,0.2)',
                                                    filter: review.showInSlider ? 'drop-shadow(0 0 5px rgba(255, 200, 0, 0.4))' : 'none'
                                                }}
                                                title={review.showInSlider ? "Remove from Slider" : "Add to Slider"}
                                            >
                                                <Star size={18} fill={review.showInSlider ? '#ffc800' : 'none'} />
                                            </button>
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(review.createdAt)}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button onClick={() => setSelectedReview(review)} className="icon-btn" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                {!review.isApproved && (
                                                    <button
                                                        onClick={() => handleModerate(review._id, true)}
                                                        className="icon-btn"
                                                        title="Approve"
                                                        style={{ color: '#00ff80' }}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                                {review.isApproved && (
                                                    <button
                                                        onClick={() => handleModerate(review._id, false)}
                                                        className="icon-btn"
                                                        title="Reject"
                                                        style={{ color: '#ff6464' }}
                                                    >
                                                        <XIcon size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary"
                            >
                                Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Review Details Modal */}
            {selectedReview && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Review Details</h2>
                            <button onClick={() => setSelectedReview(null)} className="modal-close">
                                <XIcon size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>PRODUCT</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {selectedReview.product?.images?.[0] && (
                                            <img
                                                src={selectedReview.product.images[0]}
                                                alt=""
                                                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{selectedReview.product?.name || '-'}</div>
                                            {selectedReview.isVerified && (
                                                <span style={{ fontSize: '11px', color: '#00ff80', marginTop: '4px', display: 'block' }}>
                                                    ✓ Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>USER</h4>
                                    <div style={{ fontWeight: 500 }}>{selectedReview.user?.name || '-'}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                        {selectedReview.user?.email || '-'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>RATING</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {renderStars(selectedReview.rating)}
                                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedReview.rating} / 5</span>
                                </div>
                            </div>

                            {selectedReview.title && (
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>TITLE</h4>
                                    <p style={{ fontWeight: 500 }}>{selectedReview.title}</p>
                                </div>
                            )}

                            {selectedReview.comment && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>COMMENT</h4>
                                    <p style={{ lineHeight: '1.6' }}>{selectedReview.comment}</p>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>STATUS</h4>
                                    <span className={`status-badge ${selectedReview.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                                        {selectedReview.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>DATE</h4>
                                    <p style={{ fontSize: '13px' }}>{formatDate(selectedReview.createdAt)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>MODERATION</h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!selectedReview.isApproved ? (
                                        <button
                                            onClick={() => {
                                                handleModerate(selectedReview._id, true);
                                                setSelectedReview(null);
                                            }}
                                            className="btn-primary"
                                            style={{ flex: 1 }}
                                        >
                                            <Check size={18} />
                                            Approve Review
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                handleModerate(selectedReview._id, false);
                                                setSelectedReview(null);
                                            }}
                                            className="btn-secondary"
                                            style={{ flex: 1, background: '#ff6464', borderColor: '#ff6464' }}
                                        >
                                            <XIcon size={18} />
                                            Reject Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedReview(null)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
