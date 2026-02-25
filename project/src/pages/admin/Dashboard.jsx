import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Gamepad2, ShoppingCart, DollarSign, TrendingUp, CreditCard, Package, Clock, Zap, MessageSquare, Shield, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminAPI from '../../api/admin';
import StatCard from '../../components/admin/StatCard';
import ActionCard from '../../components/admin/ActionCard';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        users: 0,
        orders: 0,
        revenue: 0,
        todayRevenue: 0,
        todayOrders: 0,
        monthlyGrowth: 0,
        pendingOrders: 0,
        pendingPayments: 0,
        pendingReviews: 0,
        activeFlashSales: 0,
        activePriceAlerts: 0,
        totalLoyaltyUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        loadDashboardData();

        // Auto-refresh every 30 seconds for "live" feel
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            // Only show loading on initial load to avoid flickering during auto-refresh
            if (stats.products === 0 && loading) {
                setLoading(true);
            }

            const statsData = await adminAPI.getStats();

            if (statsData) {
                const { overview, today, thisMonth, pending, topProducts, recentOrders } = statsData;

                setStats({
                    products: overview?.totalProducts || 0,
                    users: overview?.totalUsers || 0,
                    orders: overview?.totalOrders || 0,
                    revenue: thisMonth?.revenue || 0,
                    todayRevenue: today?.revenue || 0,
                    todayOrders: today?.orders || 0,
                    monthlyGrowth: thisMonth?.growth || 0,
                    pendingOrders: pending?.orders || 0,
                    pendingPayments: pending?.payments || 0,
                    pendingReviews: pending?.reviews || 0,
                    activeFlashSales: overview?.activeFlashSales || 0,
                    activePriceAlerts: overview?.activePriceAlerts || 0,
                    totalLoyaltyUsers: overview?.totalLoyaltyUsers || 0
                });

                setRecentOrders(recentOrders || []);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && stats.products === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--color-text-muted)' }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <style>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }
                
                .section-header {
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .live-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--color-success);
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .live-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--color-success);
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .refresh-text {
                    font-size: 12px;
                    color: var(--color-text-muted);
                    margin-left: 12px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .data-table th, .data-table td {
                    padding: 16px 24px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }

                .data-table th {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-muted);
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .data-table td {
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }

                .data-table tr:last-child td {
                    border-bottom: none;
                }

                .data-table tr:hover td {
                    background: var(--color-bg-card-hover);
                }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 99px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-pending { background: rgba(255, 200, 0, 0.1); color: #ffc800; border: 1px solid rgba(255, 200, 0, 0.2); }
                .status-processing { background: rgba(0, 217, 255, 0.1); color: #00d9ff; border: 1px solid rgba(0, 217, 255, 0.2); }
                .status-completed { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
                .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

                @media (max-width: 1200px) {
                    .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
                    .content-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .section-header > div {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px;
                    }
                    .refresh-text {
                        margin-left: 0;
                    }
                }
            `}</style>

            <div className="section-header">
                <h2 className="section-title">Dashboard Overview</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="live-badge">
                        <div className="live-dot"></div>
                        LIVE MONITORING
                    </div>
                    <span className="refresh-text">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={loadDashboardData}
                        style={{ background: 'none', color: 'var(--color-primary)', marginLeft: '16px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
                    >
                        REFRESH NOW
                    </button>
                </div>
            </div>

            {/* 1. TOP STATS */}
            <div className="dashboard-grid">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={DollarSign}
                    color="0, 217, 255"
                    trend={stats.monthlyGrowth}
                    subtitle="vs last month"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingCart}
                    color="255, 200, 0"
                    subtitle={`${stats.pendingOrders} pending`}
                />
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="16, 185, 129"
                    subtitle={`${stats.totalLoyaltyUsers} loyalty members`}
                />
                <StatCard
                    title="Total Products"
                    value={stats.products}
                    icon={Gamepad2}
                    color="139, 92, 246"
                    subtitle={`${stats.activeFlashSales} on flash sale`}
                />
            </div>

            {/* 2. MIDDLE SECTION */}
            <div className="content-grid">
                {/* Recent Orders */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Recent Orders</div>
                        <Link to="/admin/orders" style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 500 }}>View All</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No orders yet.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>#{order.orderNumber}</td>
                                            <td>{order.customerInfo?.name || order.user?.name || '-'}</td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                                            <td>
                                                <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                                {formatDate(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Alerts / Side Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Pending Actions Widget */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Attention Needed</div>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {!stats.pendingOrders && !stats.pendingPayments && !stats.pendingReviews ? (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>All caught up! 🎉</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {stats.pendingOrders > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffc800' }}>
                                            <Clock size={18} />
                                            <span><strong>{stats.pendingOrders}</strong> orders pending</span>
                                        </div>
                                    )}
                                    {stats.pendingPayments > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                                            <CreditCard size={18} />
                                            <span><strong>{stats.pendingPayments}</strong> payments to confirm</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Mini Stat */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 0, 0, 0))' }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>TODAY'S REVENUE</div>
                            <div style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                                {formatCurrency(stats.todayRevenue)}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                from {stats.todayOrders} orders
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. BOTTOM QUICK ACTIONS */}
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
            <div className="dashboard-grid">
                <ActionCard
                    title="Add Product"
                    description="Create a new product listing"
                    icon={Package}
                    to="/admin/products"
                    color="#00d9ff"
                />
                <ActionCard
                    title="Manage Users"
                    description="View and manage user accounts"
                    icon={Users}
                    to="/admin/users"
                    color="#10b981"
                />
                <ActionCard
                    title="Promo Codes"
                    description="Create discounts and coupons"
                    icon={CreditCard}
                    to="/admin/promo-codes"
                    color="#f59e0b"
                />
                <ActionCard
                    title="Categories"
                    description="Organize your catalog"
                    icon={Tag}
                    to="/admin/categories"
                    color="#8b5cf6"
                />
            </div>
        </div>
    );
};

export default Dashboard;
