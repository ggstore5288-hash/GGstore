import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Zap, Shield, Star, Send,
    Crown, Sparkles, CheckCircle2,
    Mail, ArrowRight
} from 'lucide-react';
import { subscribe } from '../api/newsletter';

const Newsletter = () => {
    const { t, isRTL } = useLanguage();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const benefits = [
        {
            icon: Zap,
            title: 'newsBenefit1Title',
            desc: 'newsBenefit1Desc',
            color: 'var(--color-cyan-primary)'
        },
        {
            icon: Crown,
            title: 'newsBenefit2Title',
            desc: 'newsBenefit2Desc',
            color: '#FFD700' // Gold for drops
        },
        {
            icon: Shield,
            title: 'newsBenefit3Title',
            desc: 'newsBenefit3Desc',
            color: '#10b981' // Green for security/loyalty
        }
    ];

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError('');

        try {
            await subscribe(email);
            setIsSubmitted(true);
        } catch (err) {
            console.error('Newsletter subscription error:', err);
            setError(err.response?.data?.error || 'Failed to subscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="newsletter-elite-flow" style={{
            minHeight: '100vh',
            padding: '120px 24px 80px',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            {/* Ambient Background Effects */}
            <div className="ambient-glow-1" />
            <div className="ambient-glow-2" />

            <style>{`
                .ambient-glow-1 {
                    position: absolute;
                    top: -10%;
                    left: -10%;
                    width: 50%;
                    height: 50%;
                    background: radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%);
                    opacity: 0.1;
                    filter: blur(80px);
                    pointer-events: none;
                }
                .ambient-glow-2 {
                    position: absolute;
                    bottom: -10%;
                    right: -10%;
                    width: 40%;
                    height: 40%;
                    background: radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%);
                    opacity: 0.05;
                    filter: blur(80px);
                    pointer-events: none;
                }

                .newsletter-content {
                    max-width: 1000px;
                    width: 100%;
                    position: relative;
                    z-index: 10;
                    text-align: center;
                }

                .elite-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 100px;
                    font-family: var(--font-display);
                    font-size: 12px;
                    font-weight: var(--fw-bold);
                    letter-spacing: 0.2em;
                    color: var(--color-cyan-primary);
                    margin-bottom: 24px;
                    text-transform: uppercase;
                }

                .newsletter-title {
                    font-family: var(--font-display);
                    font-size: clamp(32px, 8vw, 64px);
                    font-weight: var(--fw-bold);
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    margin-bottom: 16px;
                    background: linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.7) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .newsletter-subtitle {
                    font-family: var(--font-body);
                    font-size: 18px;
                    color: var(--color-text-secondary);
                    max-width: 600px;
                    margin: 0 auto 60px;
                    font-weight: var(--fw-light);
                    letter-spacing: 0.02em;
                }

                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-bottom: 60px;
                }

                .benefit-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 40px;
                    text-align: ${isRTL ? 'right' : 'left'};
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }

                .benefit-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.03);
                }

                .benefit-icon-box {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    background: rgba(255, 255, 255, 0.03);
                }

                .benefit-title {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: var(--fw-semibold);
                    margin-bottom: 12px;
                    color: var(--color-text-primary);
                }

                .benefit-desc {
                    font-family: var(--font-body);
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--color-text-muted);
                    font-weight: var(--fw-regular);
                }

                .subscription-module {
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 40px;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                }

                .subscription-form {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                @media (max-width: 600px) {
                    .subscription-form {
                        flex-direction: column;
                    }
                }

                .email-input-wrapper {
                    flex: 1;
                    position: relative;
                }

                .email-input {
                    width: 100%;
                    padding: 16px 20px;
                    padding-${isRTL ? 'right' : 'left'}: 52px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    color: #fff;
                    font-family: var(--font-body);
                    font-size: 16px;
                    transition: all 0.3s ease;
                }

                .email-input:focus {
                    outline: none;
                    border-color: var(--color-cyan-primary);
                    background: rgba(0, 217, 255, 0.02);
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
                }

                .input-icon {
                    position: absolute;
                    ${isRTL ? 'right' : 'left'}: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-muted);
                    pointer-events: none;
                }

                .newsletter-cta {
                    padding: 16px 32px;
                    background: var(--color-cyan-primary);
                    border: none;
                    border-radius: 16px;
                    color: #000;
                    font-family: var(--font-display);
                    font-size: 14px;
                    font-weight: var(--fw-bold);
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .newsletter-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 30px var(--color-primary-glow);
                    filter: brightness(1.1);
                }

                .newsletter-cta:active {
                    transform: translateY(0);
                }

                .success-state {
                    animation: fadeIn 0.5s ease forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .verification-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #10b981;
                    font-family: var(--font-body);
                    margin-top: 24px;
                }
            `}</style>

            <main className="newsletter-content">
                <div className="elite-badge">
                    <Sparkles size={14} />
                    Verified Inner Circle
                </div>

                <h1 className="newsletter-title">{t('newsTitle')}</h1>
                <p className="newsletter-subtitle">{t('newsSubtitle')}</p>

                <div className="benefits-grid">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="benefit-card">
                            <div className="benefit-icon-box">
                                <benefit.icon size={24} style={{ color: benefit.color }} />
                            </div>
                            <h3 className="benefit-title">{t(benefit.title)}</h3>
                            <p className="benefit-desc">{t(benefit.desc)}</p>
                        </div>
                    ))}
                </div>

                <div className="subscription-module">
                    {!isSubmitted ? (
                        <form className="subscription-form" onSubmit={handleSubmit}>
                            <div className="email-input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder={t('newsPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
                            <button
                                type="submit"
                                className="newsletter-cta"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Submitting...' : t('newsCTA')}
                                <ArrowRight size={18} style={{
                                    transform: isHovered ? (isRTL ? 'translateX(-4px)' : 'translateX(4px)') : 'none',
                                    transition: 'transform 0.3s ease'
                                }} />
                            </button>
                        </form>
                    ) : (
                        <div className="success-state">
                            <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '24px',
                                marginBottom: '8px'
                            }}>
                                {t('newsSuccess')}
                            </h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                Protocol established. Stand by for transmissions.
                            </p>
                        </div>
                    )}

                    {!isSubmitted && (
                        <p style={{
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            marginTop: '20px'
                        }}>
                            {t('newsPrivacy')}
                        </p>
                    )}
                </div>

                <div className="verification-badge">
                    <Shield size={14} />
                    End-to-End Encrypted Subscription Hub
                </div>
            </main>
        </div>
    );
};

export default Newsletter;
