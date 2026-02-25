import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Tag,
    CreditCard,
    BarChart2,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    FileText,
    Mail,
    Zap,
    Gift,
    Award,
    MessageSquare,
    Globe,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const menuGroups = [
        {
            title: 'CORE',
            items: [
                { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' }
            ]
        },
        {
            title: 'COMMERCE',
            items: [
                { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
                { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
                { path: '/admin/categories', icon: <Tag size={20} />, label: 'Categories' },
                { path: '/admin/payments', icon: <CreditCard size={20} />, label: 'Payments' },
                { path: '/admin/payment-methods', icon: <Settings size={20} />, label: 'Payment Methods' },
                { path: '/admin/promo-codes', icon: <Gift size={20} />, label: 'Promo Codes' },
                { path: '/admin/flash-sales', icon: <Zap size={20} />, label: 'Flash Sales' }
            ]
        },
        {
            title: 'MARKETING',
            items: [
                { path: '/admin/loyalty', icon: <Award size={20} />, label: 'Loyalty Program' },
                { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Reviews' },
                { path: '/admin/chatbot', icon: <MessageSquare size={20} />, label: 'AI ChatBot' },
                { path: '/admin/content', icon: <Globe size={20} />, label: 'Content' },
                { path: '/admin/newsletter', icon: <Mail size={20} />, label: 'Newsletter' },
                { path: '/admin/email-queue', icon: <Mail size={20} />, label: 'Email Queue' },
                { path: '/admin/email-templates', icon: <FileText size={20} />, label: 'Email Templates' }
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
                { path: '/admin/audit-logs', icon: <Shield size={20} />, label: 'Audit Logs' }
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' }
            ]
        }
    ];

    const currentPathLabel = menuGroups
        .flatMap(g => g.items)
        .find(item => item.path === location.pathname || (item.path !== '/admin' && location.pathname.startsWith(item.path)))?.label;

    return (
        <div className="admin-layout">
            <style>{`
                .admin-layout {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                    background: var(--color-bg-primary);
                }

                /* -- SIDEBAR -- */
                .admin-sidebar {
                    width: ${isSidebarOpen ? '280px' : '80px'};
                    background: var(--color-bg-card);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    height: 100%;
                    z-index: 50;
                    overflow-x: hidden;
                    box-shadow: var(--shadow-xl);
                }

                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 45;
                    animation: fadeIn 0.2s ease-out;
                }

                .sidebar-header {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    border-bottom: 1px solid var(--color-border);
                    justify-content: ${isSidebarOpen ? 'space-between' : 'center'};
                }

                .brand-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--color-primary);
                    white-space: nowrap;
                    opacity: ${isSidebarOpen ? 1 : 0};
                    transition: opacity 0.2s;
                }

                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .nav-group {
                    padding: 0 16px;
                }

                .nav-group-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                    padding-left: 12px;
                    display: ${isSidebarOpen ? 'block' : 'none'};
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 12px;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    border-radius: var(--radius-md);
                    transition: all 0.2s ease;
                    margin-bottom: 4px;
                    justify-content: ${isSidebarOpen ? 'flex-start' : 'center'};
                    position: relative;
                }

                .nav-item:hover {
                    color: var(--color-text-primary);
                    background: var(--color-bg-card-hover);
                }

                .nav-item.active {
                    color: var(--color-primary);
                    background: rgba(0, 217, 255, 0.1);
                    font-weight: 500;
                }

                .nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 16px;
                    background: var(--color-primary);
                    border-radius: 0 4px 4px 0;
                    display: ${isSidebarOpen ? 'none' : 'block'};
                }

                .nav-icon-wrapper {
                    display: flex;
                    width: 24px;
                    justify-content: center;
                    margin-right: ${isSidebarOpen ? '12px' : '0'};
                }

                .nav-label {
                    font-size: 14px;
                    white-space: nowrap;
                    display: ${isSidebarOpen ? 'block' : 'none'};
                }

                /* -- MAIN CONTENT -- */
                .admin-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .mobile-toggle {
                    display: none;
                    background: transparent;
                    border: none;
                    color: var(--color-text-primary);
                    padding: 8px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }

                .admin-header {
                    height: 70px;
                    background: var(--color-bg-primary); /* Blend with page bg usually, or card if distinctive header wanted */
                    background: rgba(15, 20, 25, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    position: sticky;
                    top: 0;
                    z-index: 40;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .toggle-btn {
                    background: transparent;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: var(--radius-md);
                    transition: color 0.2s;
                }

                .toggle-btn:hover {
                    color: var(--color-text-primary);
                    background: var(--color-bg-card-hover);
                }

                .page-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-text-muted);
                    font-size: 14px;
                }

                .breadcrumb-active {
                    color: var(--color-text-primary);
                    font-weight: 500;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 6px 12px;
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-full);
                    transition: border-color 0.2s;
                }

                .user-profile:hover {
                    border-color: var(--color-border-hover);
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--color-primary), var(--color-cyan-dark));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.2;
                }

                .user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                
                .user-role {
                    font-size: 11px;
                    color: var(--color-text-muted);
                }

                .logout-icon-btn {
                    color: var(--color-text-muted);
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logout-icon-btn:hover {
                    color: var(--color-danger);
                    background: rgba(239, 68, 68, 0.1);
                }

                .admin-content {
                    padding: 40px 48px;
                    overflow-y: auto;
                    flex: 1;
                    width: 100%;
                }

                /* -- RESPONSIVE MEDIA QUERIES -- */
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        position: fixed;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 280px;
                        transform: translateX(${isMobileMenuOpen ? '0' : '-100%'});
                        z-index: 100;
                        box-shadow: ${isMobileMenuOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'};
                    }

                    .sidebar-overlay {
                        display: ${isMobileMenuOpen ? 'block' : 'none'};
                    }

                    .mobile-toggle {
                        display: flex;
                        align-items: center;
                    }

                    .toggle-btn {
                        display: none;
                    }

                    .admin-content {
                        padding: 24px;
                    }

                    .admin-header {
                        padding: 0 20px;
                    }
                }

                @media (max-width: 768px) {
                    .page-breadcrumb {
                        display: none;
                    }
                    
                    .admin-content {
                        padding: 16px;
                    }

                    .mobile-hidden {
                        display: none;
                    }

                    .header-right {
                        gap: 12px !important;
                    }
                }

                @media (max-width: 480px) {
                    .admin-header {
                        height: 60px;
                        padding: 0 16px;
                    }

                    .admin-sidebar {
                        width: 100%;
                        max-width: 300px;
                    }
                }

                /* Scrollbar polish - Updated for Admin Panel */
                .sidebar-content,
                .admin-content {
                    scrollbar-width: thin;
                    scrollbar-color: var(--color-primary) transparent;
                }
                
                /* Webkit scrollbar styling */
                .sidebar-content::-webkit-scrollbar,
                .admin-content::-webkit-scrollbar { 
                    width: 3px;
                    height: 3px;
                }
                
                .sidebar-content::-webkit-scrollbar-track,
                .admin-content::-webkit-scrollbar-track { 
                    background: transparent; 
                }
                
                .sidebar-content::-webkit-scrollbar-thumb,
                .admin-content::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    border-radius: 10px;
                    box-shadow: 0 0 5px var(--color-primary-glow);
                }
                
                .sidebar-content:hover::-webkit-scrollbar-thumb,
                .admin-content:hover::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    box-shadow: 0 0 8px var(--color-primary-glow);
                }

                /* -- GLOBAL ADMIN STYLES -- */
                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: 4px;
                }

                .btn-primary {
                    background: var(--color-primary);
                    color: var(--color-bg-primary);
                    border: none;
                    padding: 8px 16px;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-primary:hover {
                    background: var(--color-primary-glow);
                    box-shadow: 0 0 10px var(--color-primary-glow);
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: var(--color-bg-card);
                    color: var(--color-text-primary);
                    border: 1px solid var(--color-border);
                    padding: 8px 16px;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-secondary:hover {
                    border-color: var(--color-text-muted);
                    background: var(--color-bg-card-hover);
                    transform: translateY(-1px);
                }

                .empty-state {
                    text-align: center;
                    padding: 48px;
                    background: var(--color-bg-card);
                    border: 1px dashed var(--color-border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-muted);
                }

                /* -- MODAL STYLES -- */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-xl);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }

                .modal-body {
                    padding: 32px;
                    overflow-y: auto;
                }

                .modal-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                }

                .modal-close {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                    display: flex;
                }

                .modal-close:hover {
                    color: var(--color-text-primary);
                    background: var(--color-bg-secondary);
                }

                /* -- FORM STYLES -- */
                .form-group {
                    margin-bottom: 24px;
                }

                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    margin-bottom: 10px;
                }

                .form-input,
                .form-select {
                    width: 100%;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 12px 14px;
                    color: var(--color-text-primary);
                    font-family: inherit;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-input:focus,
                .form-select:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.1);
                    outline: none;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="brand-title">ADMIN PANEL</div>
                    <button className="toggle-btn" onClick={toggleSidebar} style={{ marginLeft: isSidebarOpen ? 'auto' : '0' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button className="mobile-toggle" onClick={toggleMobileMenu} style={{ marginLeft: 'auto' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {menuGroups.map((group, index) => (
                        <div key={index} className="nav-group">
                            <div className="nav-group-title">{group.title}</div>
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                        title={!isSidebarOpen ? item.label : ''}
                                        onClick={() => {
                                            if (window.innerWidth <= 1024) {
                                                closeMobileMenu();
                                            }
                                        }}
                                    >
                                        <div className="nav-icon-wrapper">
                                            {React.cloneElement(item.icon, {
                                                size: 20,
                                                strokeWidth: isActive ? 2.5 : 2
                                            })}
                                        </div>
                                        <span className="nav-label">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="mobile-toggle" onClick={toggleMobileMenu}>
                            <Menu size={24} />
                        </button>
                        <div className="page-breadcrumb">
                            <span>Admin</span>
                            <ChevronRight size={14} />
                            <span className="breadcrumb-active">
                                {currentPathLabel || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="user-profile">
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="user-info mobile-hidden">
                                <span className="user-name">{user?.name || 'Administrator'}</span>
                                <span className="user-role">Super Admin</span>
                            </div>
                        </div>
                        <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
                {/* Backdrop for mobile */}
                <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
            </main>
        </div>
    );
};

export default AdminLayout;
