import React, { useState, useEffect } from 'react';
import { Bell, Filter, RefreshCw, TrendingDown } from 'lucide-react';
import adminAPI from '../../api/admin';

const PriceAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        loadAlerts();
    }, [page, filters]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getPriceAlerts(page, 50, filters.status);
            setAlerts(result?.data?.alerts || []);
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load price alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPriceDrops = async () => {
        try {
            setChecking(true);
            await adminAPI.checkPriceDrops();
            alert('Price drop check completed');
            loadAlerts();
        } catch (error) {
            alert('Failed to check price drops: ' + error.message);
        } finally {
            setChecking(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getPriceChange = (currentPrice, targetPrice) => {
        if (!currentPrice || !targetPrice) return null;
        const change = ((currentPrice - targetPrice) / targetPrice) * 100;
        return change.toFixed(1);
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Price Alerts</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {alerts.length} price alert(s) displayed
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleCheckPriceDrops} className="btn-secondary" disabled={checking}>
                        <RefreshCw size={18} className={checking ? 'spinning' : ''} />
                        {checking ? 'Checking...' : 'Check Price Drops'}
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </header>

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
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Status</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="notified">Notified</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading price alerts...</div>
            ) : alerts.length === 0 ? (
                <div className="empty-state">
                    <Bell size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No price alerts found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Product</th>
                                    <th>Current Price</th>
                                    <th>Target Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map(alert => {
                                    const product = alert.product || {};
                                    const currentPrice = product.discountPrice || product.price || 0;
                                    const priceChange = getPriceChange(currentPrice, alert.targetPrice);

                                    return (
                                        <tr key={alert._id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{alert.user?.name || '-'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                        {alert.user?.email || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {product.images?.[0] && (
                                                        <img
                                                            src={product.images[0]}
                                                            alt=""
                                                            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{product.name || '-'}</div>
                                                        {priceChange !== null && (
                                                            <div style={{ 
                                                                fontSize: '12px', 
                                                                color: parseFloat(priceChange) <= 0 ? '#00ff80' : '#ff6464' 
                                                            }}>
                                                                {parseFloat(priceChange) <= 0 ? (
                                                                    <span>✓ Price dropped {Math.abs(parseFloat(priceChange))}%</span>
                                                                ) : (
                                                                    <span>Price is {priceChange}% above target</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                                    {formatCurrency(currentPrice)}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(alert.targetPrice)}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <span className={`status-badge ${alert.isActive ? 'status-active' : 'status-inactive'}`}>
                                                        {alert.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {alert.notified && (
                                                        <div style={{ fontSize: '11px', color: '#00ff80', marginTop: '4px' }}>
                                                            ✓ Notified
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                {formatDate(alert.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
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
        </div>
    );
};

export default PriceAlerts;
