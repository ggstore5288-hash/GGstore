import React, { useState, useEffect } from 'react';
import { Award, Plus, Minus, TrendingUp, Filter, Trophy, X, Save, Settings } from 'lucide-react';
import adminAPI from '../../api/admin';
import LoyaltySettingsModal from '../../components/admin/LoyaltySettingsModal';

const Loyalty = () => {
    const [loyaltyPoints, setLoyaltyPoints] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        tier: '',
        minPoints: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adjustFormData, setAdjustFormData] = useState({
        points: '',
        reason: ''
    });

    useEffect(() => {
        loadLoyaltyPoints();
        loadLeaderboard();
    }, [page, filters]);

    const loadLoyaltyPoints = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getLoyaltyPoints(page, 50, filters.tier, filters.minPoints);
            setLoyaltyPoints(result?.data?.loyaltyPoints || []);
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load loyalty points:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const result = await adminAPI.getLeaderboard(10);
            setLeaderboard(result?.data?.leaderboard || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    };

    const handleAdjust = (user) => {
        setSelectedUser(user);
        setAdjustFormData({ points: '', reason: '' });
        setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await adminAPI.adjustLoyaltyPoints(selectedUser.user?._id || selectedUser.user, parseFloat(adjustFormData.points), adjustFormData.reason);
            setIsAdjustModalOpen(false);
            setSelectedUser(null);
            loadLoyaltyPoints();
            loadLeaderboard();
        } catch (error) {
            alert('Failed to adjust points: ' + error.message);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const getTierColor = (tier) => {
        const colors = {
            bronze: '#b45309',
            silver: '#94a3b8',
            gold: '#fbbf24',
            platinum: '#40E0D0'
        };
        return colors[tier?.toLowerCase()] || '#94a3b8';
    };

    const getTierName = (tier) => {
        return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Bronze';
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Loyalty Points</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage customer loyalty points
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsSettingsModalOpen(true)} className="btn-secondary">
                        <Settings size={18} />
                        Settings
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </header>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div style={{ marginBottom: '30px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} style={{ color: '#ffc800' }} />
                        Top Customers Leaderboard
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {leaderboard.slice(0, 5).map((entry, index) => (
                            <div key={entry._id || index} style={{
                                padding: '12px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: index === 0 ? '#40E0D0' : index === 1 ? '#fbbf24' : index === 2 ? '#94a3b8' : 'var(--color-bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: index < 3 ? '#000' : 'var(--color-text-muted)',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{entry.user?.name || '-'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {entry.points || 0} pts •
                                        <span style={{ color: getTierColor(entry.tier), fontWeight: '600' }}>
                                            {getTierName(entry.tier)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tier</label>
                            <select
                                className="form-select"
                                value={filters.tier}
                                onChange={e => handleFilterChange('tier', e.target.value)}
                            >
                                <option value="">All Tiers</option>
                                <option value="bronze">Bronze</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Points</label>
                            <input
                                type="number"
                                className="form-input"
                                value={filters.minPoints}
                                onChange={e => handleFilterChange('minPoints', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading loyalty points...</div>
            ) : loyaltyPoints.length === 0 ? (
                <div className="empty-state">
                    <Award size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No loyalty points data found.</p>
                </div>
            ) : (
                <>

                    <div className="loyalty-list-minimal">
                        {/* Grid Header */}
                        <div className="loyalty-grid-header-minimal">
                            <div>User</div>
                            <div style={{ textAlign: 'center' }}>Current Points</div>
                            <div style={{ textAlign: 'center' }}>Total Earned</div>
                            <div style={{ textAlign: 'center' }}>Total Spent</div>
                            <div style={{ textAlign: 'center' }}>Tier</div>
                            <div style={{ textAlign: 'center' }}>Transactions</div>
                            <div style={{ textAlign: 'center' }}>Actions</div>
                        </div>

                        {/* Grid Body */}
                        <div className="loyalty-grid-body-minimal">
                            {loyaltyPoints.map((loyalty, index) => (
                                <div
                                    key={loyalty._id}
                                    className="loyalty-grid-row-minimal"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* User Identity */}
                                    <div className="user-info-col-minimal">
                                        <div className="user-name-minimal">{loyalty.user?.name || '-'}</div>
                                        <div className="user-email-minimal">{loyalty.user?.email || '-'}</div>
                                    </div>

                                    {/* Current Points */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="points-current-minimal">
                                            {loyalty.points || 0}
                                        </span>
                                    </div>

                                    {/* Total Earned */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="points-earned-minimal">
                                            {loyalty.totalEarned || 0}
                                        </span>
                                    </div>

                                    {/* Total Spent */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="points-spent-minimal">
                                            {loyalty.totalSpent || 0}
                                        </span>
                                    </div>

                                    {/* Tier */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span className={`tier-badge-minimal tier-${loyalty.tier?.toLowerCase() || 'bronze'}`}>
                                            <span className="tier-dot"></span>
                                            {getTierName(loyalty.tier)}
                                        </span>
                                    </div>

                                    {/* Transactions */}
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="transactions-link-minimal">
                                            {loyalty.transactions?.length || 0} transactions
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleAdjust(loyalty)}
                                            className="action-btn-minimal"
                                            title="Adjust Points"
                                        >
                                            <TrendingUp size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                            .loyalty-list-minimal {
                                margin-top: 24px;
                                font-family: 'Inter', sans-serif;
                            }

                            .loyalty-grid-header-minimal {
                                display: grid;
                                grid-template-columns: 2.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
                                padding: 12px 0;
                                color: #94a3b8;
                                font-size: 13px;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                                border-bottom: 2px solid #1e293b;
                            }

                            .loyalty-grid-row-minimal {
                                display: grid;
                                grid-template-columns: 2.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr;
                                padding: 16px 0;
                                align-items: center;
                                border-bottom: 1px solid #1e293b;
                                transition: all 0.2s ease;
                                animation: fadeIn 0.3s ease forwards;
                            }

                            .loyalty-grid-row-minimal:hover {
                                background: rgba(30, 41, 59, 0.2);
                            }

                            .user-name-minimal {
                                font-weight: 700;
                                font-size: 16px;
                                color: #ffffff;
                                text-transform: capitalize;
                            }

                            .user-email-minimal {
                                font-size: 12px;
                                color: #64748b;
                                margin-top: 2px;
                            }

                            .points-current-minimal {
                                color: #00d9ff;
                                font-weight: 800;
                                font-size: 18px;
                            }

                            .points-earned-minimal {
                                color: #10b981;
                                font-weight: 600;
                                font-size: 15px;
                            }

                            .points-spent-minimal {
                                color: #94a3b8;
                                font-size: 15px;
                            }

                            .tier-badge-minimal {
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                padding: 6px 16px;
                                border-radius: 20px;
                                font-size: 11px;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                            }

                            .tier-dot {
                                width: 6px;
                                height: 6px;
                                border-radius: 50%;
                                background: currentColor;
                                box-shadow: 0 0 8px currentColor;
                            }

                            .tier-platinum {
                                background: rgba(64, 224, 208, 0.1);
                                color: #40E0D0;
                                border: 1px solid rgba(64, 224, 208, 0.2);
                            }

                            .tier-gold {
                                background: rgba(251, 191, 36, 0.1);
                                color: #fbbf24;
                                border: 1px solid rgba(251, 191, 36, 0.2);
                            }

                            .tier-silver {
                                background: rgba(148, 163, 184, 0.1);
                                color: #94a3b8;
                                border: 1px solid rgba(148, 163, 184, 0.2);
                            }

                            .tier-bronze {
                                background: rgba(180, 83, 9, 0.1);
                                color: #b45309;
                                border: 1px solid rgba(180, 83, 9, 0.2);
                            }

                            .transactions-link-minimal {
                                font-size: 13px;
                                color: #64748b;
                                font-weight: 500;
                            }

                            .action-btn-minimal {
                                width: 36px;
                                height: 36px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: transparent;
                                color: #94a3b8;
                                border-radius: 10px;
                                border: 1px solid #1e293b;
                                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                                cursor: pointer;
                            }

                            .action-btn-minimal:hover {
                                color: #ffffff;
                                background: #1e293b;
                                transform: translateY(-2px);
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                            }

                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        ` }} />


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

            {/* Adjust Points Modal */}
            {isAdjustModalOpen && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Adjust Loyalty Points</h2>
                            <button onClick={() => { setIsAdjustModalOpen(false); setSelectedUser(null); }} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>User</div>
                                <div style={{ fontWeight: 500 }}>{selectedUser.user?.name || '-'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    Current Points: <span style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                        {selectedUser.points || 0}
                                    </span>
                                </div>
                            </div>
                            <form onSubmit={handleAdjustSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Points Adjustment *</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '100' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Plus size={16} />
                                            +100
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '500' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Plus size={16} />
                                            +500
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '-100' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Minus size={16} />
                                            -100
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={adjustFormData.points}
                                        onChange={e => setAdjustFormData({ ...adjustFormData, points: e.target.value })}
                                        placeholder="Enter points (positive to add, negative to deduct)"
                                        required
                                        style={{ marginTop: '12px' }}
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        Positive number adds points, negative number deducts points
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reason *</label>
                                    <textarea
                                        className="form-textarea"
                                        value={adjustFormData.reason}
                                        onChange={e => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
                                        placeholder="Reason for adjustment (e.g., Bonus for referral, Refund adjustment)"
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAdjustModalOpen(false); setSelectedUser(null); }}
                                        className="btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Save size={18} />
                                        Adjust Points
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsModalOpen && (
                <LoyaltySettingsModal onClose={() => setIsSettingsModalOpen(false)} />
            )}
        </div>
    );
};

export default Loyalty;
