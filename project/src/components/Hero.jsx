import React from 'react';
import { useSettings } from '../context/SettingsContext';

const Hero = () => {
    const { getSetting, loadingSettings } = useSettings();

    if (loadingSettings) return null; // Or a skeleton

    // Fetch values from settings context, defaulting to GTA V fallback
    const heroImage = getSetting('marketing.hero_image');
    const heroTitle = getSetting('marketing.hero_title');
    const heroSubtitle = getSetting('marketing.hero_subtitle');
    const heroLink = getSetting('marketing.hero_link');
    const heroLabel = getSetting('marketing.hero_label');
    const heroButtonText = getSetting('marketing.hero_button_text');

    const displayImage = heroImage || "/images/banner.webp";
    const displayTitle = heroTitle || "Grand Theft Auto VI";
    const displaySubtitle = heroSubtitle || "Coming 2025";
    const displayLink = heroLink || "#";
    const displayLabel = heroLabel || "Featured Game";
    const displayButtonText = heroButtonText || (heroLink ? "View Details" : "Coming Soon");

    return (
        <section className="hero">
            <style>{`
                .hero {
                    padding: 0 20px 40px;
                }

                .hero-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .hero-banner-wrapper {
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    aspect-ratio: 16/7;
                    min-height: 280px;
                }

                .hero-banner-wrapper:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
                                0 0 0 1px rgba(0, 217, 255, 0.2);
                }

                .hero-banner-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .hero-banner-wrapper:hover .hero-banner-image {
                    transform: scale(1.05);
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.9) 0%,
                        rgba(0, 0, 0, 0.4) 40%,
                        transparent 70%,
                        rgba(0, 0, 0, 0.3) 100%
                    );
                    pointer-events: none;
                }

                .hero-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    padding: clamp(20px, 5vw, 60px);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 32px;
                    z-index: 2;
                }

                .hero-text {
                    flex: 1;
                    max-width: 600px;
                }

                .hero-label {
                    display: inline-block;
                    font-size: clamp(10px, 1.2vw, 12px);
                    font-weight: var(--fw-bold);
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    color: var(--color-cyan-primary);
                    margin-bottom: 12px;
                    font-family: var(--font-body);
                    padding: 4px 12px;
                    background: rgba(0, 217, 255, 0.1);
                    border-radius: 4px;
                    border-left: 3px solid var(--color-cyan-primary);
                }

                .hero-title {
                    font-family: var(--font-display);
                    font-size: clamp(24px, 5vw, 48px);
                    font-weight: var(--fw-semibold);
                    color: white;
                    margin: 0 0 12px 0;
                    text-shadow: 0 2px 15px rgba(0, 0, 0, 0.9);
                    line-height: 1.1;
                    letter-spacing: var(--ls-heading);
                }

                .hero-subtitle {
                    font-size: clamp(14px, 1.8vw, 18px);
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    font-weight: var(--fw-medium);
                    max-width: 500px;
                    line-height: 1.5;
                }

                .hero-cta {
                    padding: 16px 36px;
                    background: var(--color-cyan-primary);
                    border: none;
                    border-radius: 8px;
                    color: black;
                    font-size: 15px;
                    font-weight: var(--fw-bold);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    white-space: nowrap;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
                }

                .hero-cta:hover {
                    background: white;
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                }

                @media (max-width: 868px) {
                    .hero-banner-wrapper {
                        aspect-ratio: 16/9;
                    }
                    
                    .hero-overlay {
                        background: linear-gradient(
                            to top,
                            rgba(0, 0, 0, 0.9) 0%,
                            rgba(0, 0, 0, 0.4) 60%,
                            rgba(0, 0, 0, 0.2) 100%
                        );
                    }

                    .hero-content {
                        flex-direction: column;
                        justify-content: flex-end;
                        align-items: flex-start;
                        padding: 30px;
                        gap: 20px;
                    }

                    .hero-text {
                        max-width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .hero {
                        padding: 0 12px 24px;
                    }

                    .hero-banner-wrapper {
                        aspect-ratio: 4/5;
                        min-height: 350px;
                    }

                    .hero-content {
                        padding: 24px;
                    }
                    
                    .hero-cta {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="hero-container">
                <div className="hero-banner-wrapper">
                    <img
                        src={displayImage}
                        alt={displayTitle}
                        className="hero-banner-image"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
