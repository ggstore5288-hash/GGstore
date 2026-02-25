import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    // Parse color to rgb if needed or use hex
    // Assumption: color is like "0, 217, 255" or hex. 
    // If it's hex, we need to handle it. If rgb string, it works with rgba.
    // The previous dashboard used "0, 217, 255". Let's stick to that or variables.

    // Better: Accept a CSS variable or hex for the icon color.

    return (
        <div className="stat-card">
            <style>{`
                .stat-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 120px;
                }

                .stat-card:hover {
                    border-color: var(--color-border-hover);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .stat-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                }

                .stat-value {
                    font-family: 'Inter', sans-serif;
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }

                .stat-footer {
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                }

                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
                }

                .trend-up { color: var(--color-success); }
                .trend-down { color: var(--color-danger); }
                
                .stat-subtitle {
                    color: var(--color-text-muted);
                    margin-left: 6px;
                }
            `}</style>

            <div className="stat-header">
                <span className="stat-title">{title}</span>
                <div className="stat-icon-wrapper" style={{
                    background: `rgba(${color}, 0.1)`,
                    color: `rgb(${color})`
                }}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="stat-value">{value}</div>

            {(subtitle || trend) && (
                <div className="stat-footer">
                    {trend && (
                        <span className={`stat-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                    {subtitle && <span className="stat-subtitle">{subtitle}</span>}
                </div>
            )}
        </div>
    );
};

export default StatCard;
