import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t, isRTL } = useLanguage();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* About Section */}
                    <div className="footer-section about">
                        <div className="footer-logo">
                            <span className="logo-text">SUB <span className="text-cyan">HUB</span></span>
                        </div>
                        <p className="footer-description">
                            SUB HUB is a premium digital marketplace curated for gamers who expect excellence.
                            We deliver top-tier games and subscription services with instant access,
                            secure transactions, and competitive pricing. Our platform is built on
                            reliability, performance, and trust.
                        </p>
                    </div>

                    {/* Explore Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">Explore</h3>
                        <ul className="footer-links-list">
                            <li><Link to="/">{t('home') || 'Home'}</Link></li>
                            <li><Link to="/games">Featured Games</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                            <li><Link to="/cart">{t('cart') || 'Cart'}</Link></li>
                            <li><Link to="/profile">{t('profile') || 'Profile'}</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">Customer Care</h3>
                        <ul className="footer-links-list">
                            <li><Link to="/about">{t('about')}</Link></li>
                            <li><Link to="/newsletter">{t('newsletter')}</Link></li>
                            <li><Link to="/privacy-policy">{t('privacyPolicy')}</Link></li>
                        </ul>
                    </div>

                    {/* Connect Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">Connect With Us</h3>
                        <div className="contact-info">
                            <a href="mailto:support@subhub.com" className="contact-item">
                                <Mail size={16} />
                                <span>support@subhub.com</span>
                            </a>
                            <p className="support-status">
                                <span className="status-dot"></span>
                                24/7 Premium Customer Support
                            </p>
                        </div>
                        <p className="social-prompt">Follow us for updates, releases, and exclusive deals.</p>
                        <div className="social-links-premium">
                            <a href="#" className="social-icon-btn" aria-label="Facebook"><Facebook size={18} /></a>
                            <a href="#" className="social-icon-btn" aria-label="Twitter"><Twitter size={18} /></a>
                            <a href="#" className="social-icon-btn" aria-label="YouTube"><Youtube size={18} /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-signature">
                        © 2026 SUB HUB. Elevating Your Digital Gaming Experience.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
