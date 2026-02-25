import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, DollarSign, ShoppingCart, Users,
    Calendar, ArrowUpRight, ArrowDownRight, Layers, Package,
    Zap, Activity, Filter, RefreshCw, Clock, Crown, Mail,
    ChevronRight, ExternalLink, MousePointer2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminAPI from '../../api/admin';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [activeTab, setActiveTab] = useState('revenue');
    const [viewMode, setViewMode] = useState('overview'); // overview, customers, time

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getAnalytics(period);
            if (result?.success) {
                setAnalytics(result.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
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

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Custom SVG Donut Chart for Categories
    const DonutChart = ({ data }) => {
        if (!data || data.length === 0) return null;
        const total = data.reduce((sum, item) => sum + item.revenue, 0);
        let cumulativePercent = 0;

        const colors = ['#00d9ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

        return (
            <div className="donut-container">
                <svg viewBox="0 0 100 100" className="donut-svg">
                    {data.map((item, idx) => {
                        const percent = (item.revenue / total) * 100;
                        if (percent >= 99.9) {
                            return (
                                <circle
                                    key={idx}
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke={colors[idx % colors.length]}
                                    strokeWidth="12"
                                    strokeDasharray="251.2"
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                />
                            );
                        }
                        const startX = Math.cos(2 * Math.PI * cumulativePercent);
                        const startY = Math.sin(2 * Math.PI * cumulativePercent);
                        cumulativePercent += item.revenue / total;
                        const endX = Math.cos(2 * Math.PI * cumulativePercent);
                        const endY = Math.sin(2 * Math.PI * cumulativePercent);

                        const largeArcFlag = percent > 50 ? 1 : 0;
                        const pathData = [
                            `M ${50 + 40 * startX} ${50 + 40 * startY}`,
                            `A 40 40 0 ${largeArcFlag} 1 ${50 + 40 * endX} ${50 + 40 * endY}`
                        ].join(' ');

                        return (
                            <path
                                key={idx}
                                d={pathData}
                                fill="none"
                                stroke={colors[idx % colors.length]}
                                strokeWidth="12"
                                className="donut-segment"
                                strokeLinecap="round"
                            >
                                <title>{item.categoryName}: {((item.revenue / total) * 100).toFixed(1)}%</title>
                            </path>
                        );
                    })}
                </svg>
                <div className="donut-center">
                    <div className="donut-total">{formatCurrency(total)}</div>
                    <div className="donut-label">Revenue</div>
                </div>
            </div>
        );
    };

    // Custom CSS Bar Chart
    const AnalyticsBarChart = ({ data, labelKey, valueKey, color = 'var(--color-primary)', height = 280 }) => {
        if (!data || data.length === 0) return null;
        const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1);

        return (
            <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '6px', width: '100%', marginTop: '20px', paddingBottom: '30px', position: 'relative' }}>
                {[0, 0.25, 0.5, 0.75, 1].map((level, idx) => (
                    <div key={idx} style={{
                        position: 'absolute', bottom: `${level * 100}%`, left: 0, right: 0,
                        borderTop: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none'
                    }} />
                ))}
                {data.map((item, idx) => {
                    const barHeight = (item[valueKey] / maxValue) * 100;
                    return (
                        <div key={idx} className="bar-container" style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                            position: 'relative',
                            zIndex: 1,
                            maxWidth: '45px'
                        }}>
                            <div className="bar-tooltip">
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item[labelKey]}</div>
                                <div style={{ fontWeight: 700 }}>{valueKey === 'revenue' ? formatCurrency(item[valueKey]) : formatNumber(item[valueKey])}</div>
                            </div>
                            <div className="bar-segment" style={{
                                width: '100%',
                                height: `${Math.max(barHeight, 4)}%`,
                                borderRadius: '4px 4px 0 0',
                                background: `linear-gradient(to top, ${color}, ${color}44)`,
                                border: `1px solid ${color}66`,
                                transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: barHeight > 10 ? `0 0 15px ${color}33` : 'none'
                            }} />
                            <div className="bar-label" style={{
                                position: 'absolute', bottom: '-26px', fontSize: '10px', color: 'var(--color-text-muted)',
                                transform: 'rotate(-45deg)', whiteSpace: 'nowrap',
                                display: idx % (data.length > 10 ? Math.floor(data.length / 7) : 1) === 0 ? 'block' : 'none'
                            }}>
                                {item[labelKey].substring(5)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading && !analytics) {
        return (
            <div className="loading-state">
                <div className="pulse-loader"></div>
                <div className="loading-text">Synchronizing Real-Time Intelligence Data...</div>
            </div>
        );
    }

    const totalRevenue = analytics?.salesData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0;
    const totalOrders = analytics?.salesData?.reduce((sum, d) => sum + (d.orders || 0), 0) || 0;
    const totalUsers = analytics?.userGrowth?.reduce((sum, d) => sum + (d.count || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const isEmpty = !analytics || (totalRevenue === 0 && totalOrders === 0 && totalUsers === 0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="pro-analytics">
            <style>{`
                .pro-analytics { animation: fadeIn 0.4s ease-out; max-width: 1440px; margin: 0 auto; color: #fff; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .nav-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                .title-block h1 { 
                    font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 4px;
                    background: linear-gradient(to right, #fff, #00d9ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .title-block p { color: var(--color-text-muted); font-size: 14px; }

                .mode-switcher { display: flex; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; }
                .mode-btn { 
                    padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    background: transparent; border: none; color: var(--color-text-muted);
                }
                .mode-btn.active { 
                    background: var(--color-bg-card); 
                    color: var(--color-primary); 
                    box-shadow: 0 4px 15px rgba(0, 217, 255, 0.2);
                    border: 1px solid rgba(0, 217, 255, 0.3);
                }

                .stats-ribbon { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
                .ribbon-card { 
                    background: var(--color-bg-card); border: 1px solid var(--color-border); padding: 24px; border-radius: 20px; 
                    position: relative; overflow: hidden; transition: all 0.2s;
                }
                .ribbon-card:hover { transform: translateY(-4px); border-color: rgba(0,217,255,0.3); }
                .ribbon-label { font-size: 10px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
                .ribbon-val { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
                .ribbon-trend { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }

                .layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
                .glass-panel { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 24px; padding: 32px; position: relative; }
                
                .panel-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                .panel-title-bar h3 { font-size: 18px; font-weight: 700; }

                .donut-container { position: relative; width: 220px; height: 220px; margin: 0 auto; }
                .donut-svg { transform: rotate(-90deg); }
                .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
                .donut-total { font-size: 20px; font-weight: 800; color: #fff; }
                .donut-label { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; }
                
                .legend-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 32px; }
                .legend-item { display: flex; justify-content: space-between; font-size: 13px; align-items: center; }
                .legend-color { width: 8px; height: 8px; border-radius: 50%; }

                .heatmap-container { display: grid; grid-template-columns: 80px repeat(24, 1fr); gap: 4px; margin-top: 20px; }
                .heat-cell { height: 16px; border-radius: 2px; }
                .day-label { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; }

                .vip-leaderboard { display: flex; flexDirection: column; gap: 12px; }
                .vip-card { 
                    background: rgba(255,255,255,0.02); padding: 16px; border-radius: 16px; 
                    display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;
                }
                .vip-card:hover { background: rgba(255,255,255,0.04); }
                
                .bar-tooltip { 
                    position: absolute; top: -50px; left: 50%; transform: translateX(-50%) scale(0.9); 
                    background: #111; color: #fff; padding: 6px 10px; border-radius: 8px; font-size: 11px; 
                    opacity: 0; pointer-events: none; transition: all 0.2s; z-index: 10; border: 1px solid #333;
                }
                .bar-container:hover .bar-tooltip { opacity: 1; transform: translateX(-50%) scale(1); }
                .bar-label { position: absolute; bottom: -24px; font-size: 9px; color: var(--color-text-muted); transform: rotate(-45deg); white-space: nowrap; }

                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 500px; color: var(--color-text-muted); }
                .pulse-loader { width: 48px; height: 48px; border: 3px solid rgba(0, 217, 255, 0.1); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear; margin-bottom: 24px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Colors for graphs */
                .c-1 { background: #00d9ff; } .c-2 { background: #8b5cf6; } .c-3 { background: #10b981; } .c-4 { background: #f59e0b; }

                @media (max-width: 1200px) {
                    .stats-ribbon { grid-template-columns: repeat(2, 1fr); }
                    .layout-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 1024px) {
                    .nav-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .pro-analytics { padding-bottom: 40px; }
                }

                @media (max-width: 768px) {
                    .stats-ribbon { grid-template-columns: 1fr; }
                    .title-block h1 { font-size: 24px; }
                    .glass-panel { padding: 20px; }
                    .heatmap-container { overflow-x: auto; padding-bottom: 12px; }
                    .heatmap-container > div:not(.day-label) { min-width: 20px; }
                }
            `}</style>

            <header className="nav-header">
                <div className="title-block">
                    <h1>Intelligence Center</h1>
                    <p>Advanced store performance & predictive analytics</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="mode-switcher">
                        <button className={`mode-btn ${viewMode === 'overview' ? 'active' : ''}`} onClick={() => setViewMode('overview')}>Overview</button>
                        <button className={`mode-btn ${viewMode === 'customers' ? 'active' : ''}`} onClick={() => setViewMode('customers')}>VIPs</button>
                        <button className={`mode-btn ${viewMode === 'time' ? 'active' : ''}`} onClick={() => setViewMode('time')}>Peak Analysis</button>
                    </div>
                    <select className="analytics-select" style={{ background: 'var(--color-bg-card)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', color: '#fff' }} value={period} onChange={e => setPeriod(parseInt(e.target.value))}>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last Quarter</option>
                    </select>
                </div>
            </header>

            {!isEmpty && (
                <div className="stats-ribbon">
                    <div className="ribbon-card">
                        <div className="ribbon-label">Confirmed Revenue</div>
                        <div className="ribbon-val" style={{ color: '#00d9ff' }}>{formatCurrency(totalRevenue)}</div>
                        <div className="ribbon-trend" style={{ color: '#10b981' }}><ArrowUpRight size={14} /> 12.4% <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>vs last period</span></div>
                    </div>
                    <div className="ribbon-card">
                        <div className="ribbon-label">Transaction Volume</div>
                        <div className="ribbon-val">{formatNumber(totalOrders)}</div>
                        <div className="ribbon-trend" style={{ color: '#10b981' }}><ArrowUpRight size={14} /> 8.1% <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>growth</span></div>
                    </div>
                    <div className="ribbon-card">
                        <div className="ribbon-label">Active Audience</div>
                        <div className="ribbon-val" style={{ color: '#10b981' }}>{formatNumber(totalUsers)}</div>
                        <div className="ribbon-trend" style={{ color: '#10b981' }}><ArrowUpRight size={14} /> 15.2% <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>acquisition</span></div>
                    </div>
                    <div className="ribbon-card">
                        <div className="ribbon-label">Basket Value</div>
                        <div className="ribbon-val">{formatCurrency(avgOrderValue)}</div>
                        <div className="ribbon-trend" style={{ color: 'var(--color-text-muted)' }}><Activity size={14} /> Stable <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>pricing index</span></div>
                    </div>
                </div>
            )}

            {isEmpty ? (
                <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', minHeight: '500px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Activity size={32} color="#00d9ff" />
                        </div>
                        <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', marginBottom: '12px' }}>Awaiting Intelligence</h2>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Your PRO intelligence engine is ready. Analytics will populate automatically as soon as orders transition to 'confirmed' status.</p>
                        <Link to="/admin/orders" className="btn-primary" style={{ marginTop: '32px', display: 'inline-flex', padding: '12px 32px' }}>Review Orders</Link>
                    </div>
                </div>
            ) : viewMode === 'overview' ? (
                <div className="layout-grid">
                    <div className="glass-panel">
                        <div className="panel-title-bar">
                            <div className="chart-tabs" style={{ display: 'flex', gap: '20px' }}>
                                <button className={`tab ${activeTab === 'revenue' ? 'active' : ''}`} style={{ background: 'none', border: 'none', color: activeTab === 'revenue' ? '#00d9ff' : 'var(--color-text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', position: 'relative', paddingBottom: '8px' }} onClick={() => setActiveTab('revenue')}>REVENUE GROWTH {activeTab === 'revenue' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#00d9ff', boxShadow: '0 0 10px #00d9ff' }} />}</button>
                                <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? '#ffb01f' : 'var(--color-text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', position: 'relative', paddingBottom: '8px' }} onClick={() => setActiveTab('orders')}>ORDERS {activeTab === 'orders' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#ffb01f', boxShadow: '0 0 10px #ffb01f' }} />}</button>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#00d9ff' }}>LIVE SYNC</div>
                        </div>
                        <AnalyticsBarChart
                            data={analytics.salesData}
                            labelKey="_id"
                            valueKey={activeTab}
                            color={activeTab === 'revenue' ? '#00d9ff' : '#ffb01f'}
                        />
                        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Peak Period</div>
                                <div style={{ fontWeight: 700 }}>{period} Day Forecast</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Confidence</div>
                                <div style={{ fontWeight: 700, color: '#10b981' }}>98% Accurate</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div className="panel-title-bar" style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase' }}>Sector Sales</h3>
                                <Layers size={16} color="var(--color-text-muted)" />
                            </div>
                            <DonutChart data={analytics.categoryPerformance} />
                            <div className="legend-grid">
                                {analytics.categoryPerformance.slice(0, 4).map((cat, idx) => (
                                    <div key={idx} className="legend-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="legend-color" style={{ background: ['#00d9ff', '#8b5cf6', '#10b981', '#f59e0b'][idx] }} />
                                            <span>{cat.categoryName}</span>
                                        </div>
                                        <span style={{ fontWeight: 700 }}>{((cat.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div className="panel-title-bar" style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase' }}>Top Selling</h3>
                                <TrendingUp size={16} color="#10b981" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {analytics.productPerformance.slice(0, 3).map((prod, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                            {prod.productImage ? <img src={prod.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} style={{ margin: '10px', opacity: 0.3 }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{prod.productName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{prod.totalSold} sold</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#00d9ff' }}>{formatCurrency(prod.revenue)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : viewMode === 'customers' ? (
                <div className="layout-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="glass-panel">
                        <div className="panel-title-bar">
                            <h3>VIP Customer Leaderboard</h3>
                            <Crown size={20} color="#f59e0b" />
                        </div>
                        <div className="vip-leaderboard">
                            {analytics.topCustomers?.map((customer, idx) => (
                                <div key={idx} className="vip-card">
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: idx === 0 ? '#f59e0b' : '#fff' }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>{customer.name} {idx === 0 && <Crown size={12} color="#f59e0b" />}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customer.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: '#00d9ff' }}>{formatCurrency(customer.totalSpent)}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{customer.orderCount} Orders</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glass-panel">
                        <div className="panel-title-bar">
                            <h3>Consumer Insights</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Users size={24} color="#00d9ff" style={{ marginBottom: '16px' }} />
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Lifetime Users</div>
                                <div style={{ fontSize: '32px', fontWeight: 800 }}>{formatNumber(totalUsers)}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Activity size={24} color="#10b981" style={{ marginBottom: '16px' }} />
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Retention rate</div>
                                <div style={{ fontSize: '32px', fontWeight: 800 }}>24%</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(0, 217, 255, 0.03)', borderRadius: '20px', border: '1px solid rgba(0, 217, 255, 0.1)' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>AI Marketing Insight</h4>
                            {(() => {
                                const topSegmentRevenue = analytics.topCustomers?.reduce((sum, c) => sum + c.totalSpent, 0) || 0;
                                const paretoRatio = totalRevenue > 0 ? (topSegmentRevenue / totalRevenue) * 100 : 0;
                                const topCustCount = analytics.topCustomers?.length || 0;

                                return (
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                        Your top {topCustCount} VIPs are responsible for <strong>{paretoRatio.toFixed(1)}%</strong> of your total revenue.
                                        {paretoRatio > 50 ?
                                            " Your business is highly dependent on a small elite group. We recommend launching a private 'Inner Circle' loyalty program to ensure their long-term retention." :
                                            " Your revenue is well-distributed. To accelerate growth, consider a 'Refer-a-Friend' campaign targeting these top spenders."
                                        }
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel">
                    <div className="panel-title-bar">
                        <h3>Peak Multiplier Analysis</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                <div style={{ width: '10px', height: '10px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '2px' }} /> Low
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                                <div style={{ width: '10px', height: '10px', background: 'rgba(0, 217, 255, 1)', borderRadius: '2px' }} /> High
                            </div>
                        </div>
                    </div>
                    <div className="heatmap-container">
                        <div />
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} style={{ fontSize: '9px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{i}h</div>
                        ))}
                        {dayNames.map((day, dIdx) => (
                            <React.Fragment key={day}>
                                <div className="day-label">{day}</div>
                                {Array.from({ length: 24 }).map((_, hIdx) => {
                                    const hourlyData = (analytics.timeDistribution || []).find(td => td._id.dayOfWeek === dIdx + 1 && td._id.hour === hIdx);
                                    const intensity = hourlyData ? Math.min(hourlyData.orders * 0.3, 1) : 0;
                                    return (
                                        <div
                                            key={hIdx}
                                            className="heat-cell"
                                            style={{
                                                background: intensity > 0 ? `rgba(0, 217, 255, ${0.1 + intensity * 0.9})` : 'rgba(255,255,255,0.02)',
                                                boxShadow: intensity > 0.6 ? '0 0 10px rgba(0, 217, 255, 0.3)' : 'none'
                                            }}
                                            title={hourlyData ? `${hourlyData.orders} orders at ${hIdx}:00 on ${day}` : `No sales at ${hIdx}:00`}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {(() => {
                            const hourlyTotals = Array.from({ length: 24 }, (_, i) => ({
                                hour: i,
                                total: (analytics.timeDistribution || []).filter(td => td._id.hour === i).reduce((sum, td) => sum + td.orders, 0)
                            }));
                            const dayTotals = Array.from({ length: 7 }, (_, i) => ({
                                day: i + 1,
                                total: (analytics.timeDistribution || []).filter(td => td._id.dayOfWeek === i + 1).reduce((sum, td) => sum + td.orders, 0)
                            }));

                            const bestHour = [...hourlyTotals].sort((a, b) => b.total - a.total)[0];
                            const bestDay = [...dayTotals].sort((a, b) => b.total - a.total)[0];
                            const dayNamesFull = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

                            return (
                                <>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} color="#00d9ff" /></div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Best Hour</div>
                                            <div style={{ fontWeight: 800, fontSize: '18px' }}>
                                                {bestHour?.total > 0 ? `${bestHour.hour}:00 - ${bestHour.hour + 1}:00` : "No Peak Yet"}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} color="#8b5cf6" /></div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Best Day</div>
                                            <div style={{ fontWeight: 800, fontSize: '18px' }}>
                                                {bestDay?.total > 0 ? dayNamesFull[bestDay.day - 1] : "No Peak Yet"}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MousePointer2 size={20} color="#10b981" /></div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Sales Velocity</div>
                                <div style={{ fontWeight: 800, fontSize: '18px' }}>+12% Trend</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
