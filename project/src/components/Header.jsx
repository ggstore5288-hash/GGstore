import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, X, LogOut, LayoutDashboard, ShoppingCart, Home, Gamepad2, Layers, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const { getSetting } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const siteName = getSetting('site.name', 'SUB HUB');
    const bannerText = getSetting('marketing.banner_text', '');
    const isMaintenance = getSetting('site.maintenance', false);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header">
            <style>{`
                .header {
                    background: rgba(10, 10, 20, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--color-border);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    height: 70px;
                }

                .header-wrapper {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }

                .promo-banner {
                    color: white;
                    text-align: center;
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: var(--font-display);
                    letter-spacing: 0.5px;
                    background-size: cover;
                    background-position: center;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .maintenance-banner {
                    background: #ff4444;
                    color: white;
                    text-align: center;
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: var(--font-display);
                    letter-spacing: 0.5px;
                }

                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 24px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 16px;
                }

                .header-center {
                    display: flex;
                    justify-content: center;
                }

                .logo {
                    font-family: var(--font-display);
                    font-size: 24px;
                    font-weight: var(--fw-bold);
                    text-transform: uppercase;
                    letter-spacing: var(--ls-heading);
                    color: var(--color-cyan-primary);
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-shadow: 0 0-10px rgba(0, 217, 255, 0.5);
                }

                .nav-links {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                }

                .nav-link {
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    font-family: var(--font-display);
                    font-weight: var(--fw-medium);
                    text-transform: uppercase;
                    letter-spacing: var(--ls-nav);
                    transition: color 0.2s;
                    font-size: 14px;
                    position: relative;
                }

                .nav-link:hover, .nav-link.active {
                    color: var(--color-cyan-primary);
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    justify-content: flex-end;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-primary);
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                }

                .icon-btn:hover {
                    color: var(--color-cyan-primary);
                    background: rgba(255, 255, 255, 0.05);
                }

                .mobile-toggle {
                    display: none;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-left: 16px;
                    border-left: 1px solid var(--color-border);
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-text-primary);
                    font-weight: var(--fw-medium);
                    font-size: 14px;
                }

                .user-name {
                    max-width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .auth-buttons {
                    display: flex;
                    gap: 8px;
                }

                .btn-login {
                    color: var(--color-text-primary);
                    text-decoration: none;
                    font-family: var(--font-display);
                    font-weight: var(--fw-medium);
                    padding: 8px 16px;
                    font-size: 14px;
                }

                .btn-signup {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    text-decoration: none;
                    font-family: var(--font-display);
                    font-weight: var(--fw-semibold);
                    padding: 8px 20px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    font-size: 14px;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
                }
                
                .btn-signup:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
                }

                .cart-btn-wrapper {
                    position: relative;
                }

                .cart-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: #ff4444;
                    color: white;
                    font-size: 10px;
                    font-weight: var(--fw-bold);
                    min-width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--color-bg-primary);
                }

                /* Mobile Menu Styles */
                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .mobile-menu-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-menu-content {
                    position: fixed;
                    top: 0;
                    left: -300px;
                    width: 300px;
                    height: 100vh;
                    background: #0a0a14;
                    z-index: 2001;
                    padding: 30px 24px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                }

                .mobile-menu-overlay.active + .mobile-menu-content {
                    left: 0;
                }

                .mobile-close-btn {
                    align-self: flex-end;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px;
                    margin-bottom: 20px;
                }

                .mobile-nav-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    color: white;
                    text-decoration: none;
                    font-size: 18px;
                    font-weight: var(--fw-semibold);
                    padding: 16px;
                    border-radius: 12px;
                    transition: background 0.2s;
                    background: rgba(255, 255, 255, 0.03);
                }

                .mobile-nav-link:hover, .mobile-nav-link.active {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-cyan-primary);
                }

                @media (max-width: 1024px) {
                    .header-container {
                        grid-template-columns: auto 1fr auto;
                        padding: 0 16px;
                        gap: 12px;
                    }
                    
                    .nav-links {
                        display: none;
                    }

                    .mobile-toggle {
                        display: flex;
                    }

                    .user-name {
                        display: none;
                    }

                    .user-profile {
                        padding-left: 0;
                        border-left: none;
                        gap: 12px;
                    }
                }

                @media (max-width: 640px) {
                    .logo {
                        font-size: 20px;
                    }
                    
                    .auth-buttons .btn-login {
                        display: none;
                    }
                    
                    .header-actions {
                        gap: 10px;
                    }
                }
            `}</style>

            <div className="header-wrapper">
                {isMaintenance && (
                    <div className="maintenance-banner">
                        🚧 Site is currently in maintenance mode. Only admins have full access. 🚧
                    </div>
                )}
                {!isMaintenance && bannerText && (
                    <div
                        className="promo-banner"
                        style={{
                            backgroundImage: bannerText.startsWith('http') || bannerText.startsWith('/') ? `url(${bannerText})` : 'none',
                            background: !(bannerText.startsWith('http') || bannerText.startsWith('/')) ? 'var(--color-cyan-primary, #00d9ff)' : undefined,
                            color: !(bannerText.startsWith('http') || bannerText.startsWith('/')) ? '#000' : 'white'
                        }}
                    >
                        {!(bannerText.startsWith('http') || bannerText.startsWith('/')) && bannerText}
                    </div>
                )}

                <div className="header" style={{ position: 'relative' }}>
                    <div className="header-container">
                        {/* Left: Brand & Mobile Toggle */}
                        <div className="header-left">
                            <button
                                className="icon-btn mobile-toggle"
                                onClick={() => setIsMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu size={24} />
                            </button>
                            <Link to="/" className="logo">
                                {siteName}
                            </Link>
                        </div>

                        {/* Center: Navigation (Desktop) */}
                        <div className="header-center">
                            <nav className="nav-links">
                                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                                <Link to="/games" className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}>Games</Link>
                                <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>Categories</Link>
                                <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                            </nav>
                        </div>

                        {/* Right: User Actions */}
                        <div className="header-actions">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/cart" className="icon-btn cart-btn-wrapper" title="Cart">
                                        <ShoppingCart size={22} />
                                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                                    </Link>

                                    <div className="user-profile">
                                        {isAdmin && (
                                            <Link to="/admin" className="icon-btn" title="Admin Dashboard">
                                                <LayoutDashboard size={20} />
                                            </Link>
                                        )}

                                        <Link to="/profile" className="user-info" style={{ textDecoration: 'none' }}>
                                            <User size={20} className="text-cyan-primary" />
                                            <span className="user-name">{user?.name || 'User'}</span>
                                        </Link>

                                        <button className="icon-btn" onClick={handleLogout} title="Logout">
                                            <LogOut size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="auth-buttons">
                                    <Link to="/login" className="btn-login">Login</Link>
                                    <Link to="/signup" className="btn-signup">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay & Drawer */}
                <div
                    className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className={`mobile-menu-content ${isMenuOpen ? 'active' : ''}`}>
                    <button className="mobile-close-btn" onClick={() => setIsMenuOpen(false)}>
                        <X size={28} />
                    </button>

                    <div className="mobile-nav-links">
                        <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            <Home size={20} /> Home
                        </Link>
                        <Link to="/games" className={`mobile-nav-link ${location.pathname === '/games' ? 'active' : ''}`}>
                            <Gamepad2 size={20} /> Games
                        </Link>
                        <Link to="/categories" className={`mobile-nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>
                            <Layers size={20} /> Categories
                        </Link>
                        <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                            <Info size={20} /> About
                        </Link>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {isAuthenticated ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link to="/profile" className="mobile-nav-link">
                                    <User size={20} /> {user?.name || 'Profile'}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="mobile-nav-link"
                                    style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link to="/login" className="mobile-nav-link">Login</Link>
                                <Link to="/signup" className="mobile-nav-link" style={{ background: 'var(--color-cyan-primary)', color: 'black' }}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
