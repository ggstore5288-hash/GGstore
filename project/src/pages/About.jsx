import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Zap, Star, Globe, Headset, Award, Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
    const { t, isRTL } = useLanguage();

    const offers = [
        { icon: Star, title: 'offer1Title', desc: 'offer1Desc' },
        { icon: Globe, title: 'offer2Title', desc: 'offer2Desc' },
        { icon: Shield, title: 'offer3Title', desc: 'offer3Desc' },
        { icon: Zap, title: 'offer4Title', desc: 'offer4Desc' },
        { icon: Headset, title: 'offer5Title', desc: 'offer5Desc' },
    ];

    const values = [
        { title: 'value1Title', desc: 'value1Desc', icon: Award },
        { title: 'value2Title', desc: 'value2Desc', icon: Shield },
        { title: 'value3Title', desc: 'value3Desc', icon: Star },
    ];

    return (
        <div className="about-page" style={{
            minHeight: '80vh',
            padding: '80px 0',
            direction: isRTL ? 'rtl' : 'ltr',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)'
        }}>
            <style>{`
                .about-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .about-hero {
                    text-align: center;
                    margin-bottom: 80px;
                }

                .about-title {
                    font-family: var(--font-display);
                    font-size: clamp(32px, 6vw, 56px);
                    font-weight: var(--fw-bold);
                    color: var(--color-cyan-primary);
                    margin-bottom: 24px;
                    letter-spacing: var(--ls-heading);
                    text-transform: uppercase;
                    text-shadow: 0 0 30px var(--color-primary-glow);
                }

                .about-subtitle {
                    font-family: var(--font-display);
                    font-size: 14px;
                    font-weight: var(--fw-medium);
                    color: var(--color-text-secondary);
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 40px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .section-header {
                    font-family: var(--font-display);
                    font-size: 24px;
                    font-weight: var(--fw-semibold);
                    color: var(--color-cyan-primary);
                    margin-bottom: 32px;
                    letter-spacing: var(--ls-heading);
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .who-we-are p {
                    font-family: var(--font-body);
                    font-size: 17px;
                    line-height: 1.8;
                    color: var(--color-text-secondary);
                    margin-bottom: 24px;
                    font-weight: var(--fw-regular);
                }

                .offers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-bottom: 60px;
                }

                .offer-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 24px;
                    transition: all 0.3s ease;
                }

                .offer-card:hover {
                    background: rgba(0, 217, 255, 0.05);
                    border-color: rgba(0, 217, 255, 0.2);
                    transform: translateY(-5px);
                }

                .offer-icon {
                    color: var(--color-cyan-primary);
                    margin-bottom: 16px;
                }

                .offer-title {
                    font-family: var(--font-display);
                    font-size: 16px;
                    font-weight: var(--fw-semibold);
                    margin-bottom: 8px;
                    color: var(--color-text-primary);
                }

                .offer-desc {
                    font-family: var(--font-body);
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--color-text-muted);
                }

                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 32px;
                }

                .value-item {
                    text-align: center;
                }

                .value-title {
                    font-family: var(--font-display);
                    font-size: 18px;
                    font-weight: var(--fw-semibold);
                    color: var(--color-text-primary);
                    margin-bottom: 12px;
                    letter-spacing: var(--ls-heading);
                }

                .value-desc {
                    font-family: var(--font-body);
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--color-text-secondary);
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 32px;
                    margin-top: 24px;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    color: var(--color-text-secondary);
                    font-family: var(--font-body);
                }

                .contact-icon {
                    color: var(--color-cyan-primary);
                    flex-shrink: 0;
                }
            `}</style>

            <div className="about-container">
                <div className="about-hero">
                    <div className="about-subtitle">{isRTL ? 'إرث التميز' : 'A LEGACY OF EXCELLENCE'}</div>
                    <h1 className="about-title">{t('aboutTitle')}</h1>
                </div>

                <div className="glass-card who-we-are">
                    <h2 className="section-header">
                        <Award size={24} />
                        {t('whoWeAreTitle')}
                    </h2>
                    <p>{t('whoWeAreDesc1')}</p>
                    <p style={{ margin: 0 }}>{t('whoWeAreDesc2')}</p>
                </div>

                <h2 className="section-header" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    {t('whatWeOfferTitle')}
                </h2>
                <div className="offers-grid">
                    {offers.map((offer, index) => (
                        <div key={index} className="offer-card">
                            <offer.icon className="offer-icon" size={32} />
                            <h3 className="offer-title">{t(offer.title)}</h3>
                            <p className="offer-desc">{t(offer.desc)}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-card">
                    <h2 className="section-header" style={{ justifyContent: 'center' }}>
                        {t('ourValuesTitle')}
                    </h2>
                    <div className="values-grid">
                        {values.map((v, index) => (
                            <div key={index} className="value-item">
                                <v.icon className="offer-icon" size={40} style={{ margin: '0 auto 16px' }} />
                                <h3 className="value-title">{t(v.title)}</h3>
                                <p className="value-desc">{t(v.desc)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: 0 }}>
                    <h2 className="section-header">
                        <Mail size={24} />
                        {t('contactUsTitle')}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                        {t('contactDesc')}
                    </p>
                    <div className="contact-grid">
                        <div className="contact-item">
                            <Mail className="contact-icon" size={20} />
                            <span>support@subhub.com</span>
                        </div>
                        <div className="contact-item">
                            <Phone className="contact-icon" size={20} />
                            <span>+20 XXX XXX XXXX</span>
                        </div>
                        <div className="contact-item">
                            <MapPin className="contact-icon" size={20} />
                            <span>{isRTL ? 'مصر' : 'Cairo, Egypt'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
