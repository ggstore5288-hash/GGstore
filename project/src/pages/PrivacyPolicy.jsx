import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Shield, Lock, Eye, Share2, Cpu, UserCheck,
    Cookie, Headset, Calendar, ChevronRight,
    Activity, Globe, Terminal, Box
} from 'lucide-react';

const PrivacyPolicy = () => {
    const { t, isRTL } = useLanguage();
    const [activeSection, setActiveSection] = useState('1');

    const sections = [
        { id: '1', icon: Terminal, title: 'privacyIntroTitle', desc: 'privacyIntroDesc' },
        {
            id: '2',
            icon: Eye,
            title: 'privacyCollectTitle',
            desc: 'privacyCollectDesc',
            items: ['privacyCollectItem1', 'privacyCollectItem2', 'privacyCollectItem3', 'privacyCollectItem4', 'privacyCollectItem5']
        },
        {
            id: '3',
            icon: Cpu,
            title: 'privacyUseTitle',
            desc: 'privacyUseDesc',
            items: ['privacyUseItem1', 'privacyUseItem2', 'privacyUseItem3', 'privacyUseItem4', 'privacyUseItem5', 'privacyUseItem6']
        },
        {
            id: '4',
            icon: Share2,
            title: 'privacySharingTitle',
            desc: 'privacySharingDesc',
            items: ['privacySharingItem1', 'privacySharingItem2', 'privacySharingItem3', 'privacySharingItem4']
        },
        { id: '5', icon: Shield, title: 'privacySecurityTitle', desc: 'privacySecurityDesc' },
        {
            id: '6',
            icon: UserCheck,
            title: 'privacyRightsTitle',
            desc: 'privacyRightsDesc',
            items: ['privacyRightsItem1', 'privacyRightsItem2', 'privacyRightsItem3', 'privacyRightsItem4', 'privacyRightsItem5']
        },
        { id: '7', icon: Cookie, title: 'privacyCookiesTitle', desc: 'privacyCookiesDesc' },
        { id: '8', icon: Headset, title: 'privacyContactTitle', desc: 'privacyContactDesc' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(`section-${s.id}`));
            const scrollPosition = window.scrollY + 200;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const el = sectionElements[i];
                if (el && scrollPosition >= el.offsetTop) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 120,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="privacy-elite-hub" style={{
            minHeight: '100vh',
            padding: '120px 0 80px',
            direction: isRTL ? 'rtl' : 'ltr',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Atmosphere */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: isRTL ? 'auto' : '5%',
                right: isRTL ? '5%' : 'auto',
                width: '400px',
                height: '400px',
                background: 'var(--color-primary-glow)',
                filter: 'blur(150px)',
                opacity: '0.05',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <style>{`
                .privacy-layout {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                    position: relative;
                    z-index: 1;
                }

                @media (max-width: 992px) {
                    .privacy-layout {
                        grid-template-columns: 1fr;
                    }
                    .security-navigator {
                        display: none;
                    }
                }

                .security-navigator {
                    position: sticky;
                    top: 100px;
                    height: fit-content;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }

                .nav-title {
                    font-family: var(--font-display);
                    font-size: 12px;
                    font-weight: var(--fw-bold);
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: var(--font-display);
                    font-size: 13px;
                    font-weight: var(--fw-medium);
                    color: var(--color-text-secondary);
                    margin-bottom: 4px;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--color-text-primary);
                }

                .nav-item.active {
                    background: rgba(0, 217, 255, 0.08);
                    color: var(--color-cyan-primary);
                    border: 1px solid rgba(0, 217, 255, 0.1);
                }

                .content-hub {
                    display: grid;
                    gap: 32px;
                }

                .hub-header {
                    margin-bottom: 40px;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 100px;
                    color: #10b981;
                    font-family: var(--font-display);
                    font-size: 11px;
                    font-weight: var(--fw-bold);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .status-pulse {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .hub-title {
                    font-family: var(--font-display);
                    font-size: clamp(32px, 5vw, 56px);
                    font-weight: var(--fw-bold);
                    color: var(--color-text-primary);
                    line-height: 1.1;
                    letter-spacing: var(--ls-heading);
                    margin-bottom: 16px;
                }

                .last-update-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-family: var(--font-body);
                    font-size: 14px;
                    color: var(--color-text-muted);
                }

                .protocol-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 40px;
                    transition: border-color 0.3s ease;
                }

                .protocol-card:hover {
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .protocol-card.active {
                    border-color: rgba(0, 217, 255, 0.2);
                    background: rgba(0, 217, 255, 0.01);
                }

                .card-icon-box {
                    width: 48px;
                    height: 48px;
                    background: rgba(0, 217, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-cyan-primary);
                    margin-bottom: 24px;
                }

                .card-title {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: var(--fw-semibold);
                    margin-bottom: 16px;
                    color: var(--color-text-primary);
                    letter-spacing: var(--ls-heading);
                    text-transform: uppercase;
                }

                .card-desc {
                    font-family: var(--font-body);
                    font-size: 16px;
                    line-height: 1.8;
                    color: var(--color-text-secondary);
                    font-weight: var(--fw-light);
                }

                .protocol-list {
                    margin-top: 24px;
                    display: grid;
                    gap: 12px;
                }

                .protocol-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    font-family: var(--font-body);
                    font-size: 15px;
                    color: var(--color-text-secondary);
                }

                .item-bullet {
                    width: 8px;
                    height: 8px;
                    background: var(--color-cyan-primary);
                    border-radius: 2px;
                    margin-top: 6px;
                    flex-shrink: 0;
                    box-shadow: 0 0 10px var(--color-primary-glow);
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                    margin-top: 24px;
                }

                .contact-infobox {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }

                .infobox-label {
                    font-family: var(--font-display);
                    font-size: 11px;
                    font-weight: var(--fw-bold);
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 8px;
                }

                .infobox-value {
                    font-family: var(--font-body);
                    font-size: 15px;
                    color: var(--color-text-primary);
                }

                .scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 3px;
                    background: var(--color-cyan-primary);
                    z-index: 1000;
                    transition: width 0.1s ease;
                }
            `}</style>

            <div className="scroll-progress" style={{ width: `${(sections.indexOf(sections.find(s => s.id === activeSection)) + 1) / sections.length * 100}%` }} />

            <div className="privacy-layout">
                {/* Fixed Security Navigator */}
                <aside className="security-navigator">
                    <div className="nav-title">
                        <Activity size={14} />
                        Protocol Sections
                    </div>
                    {sections.map(section => (
                        <div
                            key={section.id}
                            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(section.id)}
                        >
                            <section.icon size={16} />
                            {t(section.title).split('. ')[1] || t(section.title)}
                        </div>
                    ))}
                    <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                        <Shield style={{ color: '#10b981', marginBottom: '8px' }} size={24} />
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>System Integrity</div>
                        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>VERIFIED</div>
                    </div>
                </aside>

                {/* Main Content Hub */}
                <main className="content-hub">
                    <header className="hub-header">
                        <div className="status-badge">
                            <div className="status-pulse" />
                            Fortified Node Active
                        </div>
                        <h1 className="hub-title">{t('privacyTitle')}</h1>
                        <div className="last-update-bar">
                            <Globe size={16} />
                            <span>v2.0 Legal Engine</span>
                            <Box size={16} />
                            <span>{t('privacyLastUpdated')}: 2/19/2026</span>
                        </div>
                    </header>

                    {sections.map((section) => (
                        <section
                            key={section.id}
                            id={`section-${section.id}`}
                            className={`protocol-card ${activeSection === section.id ? 'active' : ''}`}
                        >
                            <div className="card-icon-box">
                                <section.icon size={24} />
                            </div>
                            <h2 className="card-title">{t(section.title)}</h2>
                            <p className="card-desc">{t(section.desc)}</p>

                            {section.items && (
                                <div className="protocol-list">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="protocol-item">
                                            <div className="item-bullet" />
                                            <span>{t(item)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.id === '8' && (
                                <div className="contact-grid">
                                    <div className="contact-infobox">
                                        <span className="infobox-label">Transmission Channel</span>
                                        <span className="infobox-value">privacy@subhub.com</span>
                                    </div>
                                    <div className="contact-infobox">
                                        <span className="infobox-label">Headquarters</span>
                                        <span className="infobox-value">{isRTL ? 'مصر' : 'Cairo, Egypt'}</span>
                                    </div>
                                </div>
                            )}
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
