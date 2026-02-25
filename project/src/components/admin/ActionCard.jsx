import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ActionCard = ({ title, icon: Icon, to, color, description }) => {
    return (
        <Link to={to} className="action-card">
            <style>{`
                .action-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    height: 100%;
                }

                .action-card:hover {
                    border-color: var(--color-primary);
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .action-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-bg-secondary);
                    transition: all 0.2s;
                }

                .action-card:hover .action-icon-wrapper {
                    background: rgba(0, 217, 255, 0.1);
                    color: var(--color-primary);
                }

                .action-content {
                    flex: 1;
                }

                .action-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin-bottom: 4px;
                }

                .action-desc {
                    font-size: 13px;
                    color: var(--color-text-muted);
                    line-height: 1.4;
                }

                .action-arrow {
                    position: absolute;
                    bottom: 24px;
                    right: 24px;
                    color: var(--color-text-muted);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.2s;
                }

                .action-card:hover .action-arrow {
                    opacity: 1;
                    transform: translateX(0);
                    color: var(--color-primary);
                }
            `}</style>

            <div className="action-icon-wrapper" style={{ color: color }}>
                <Icon size={24} />
            </div>

            <div className="action-content">
                <div className="action-title">{title}</div>
                <div className="action-desc">{description}</div>
            </div>

            <ArrowRight className="action-arrow" size={20} />
        </Link>
    );
};

export default ActionCard;
