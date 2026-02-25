import React from 'react';
import GameCard from './GameCard';

const GameGrid = ({ products, loading }) => {
    if (loading) {
        return (
            <div className="game-grid-loading">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="skeleton-card"></div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="no-products">
                <h3>No games found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="game-grid">
            <style>{`
                .game-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(clamp(150px, 45vw, 240px), 1fr));
                    gap: clamp(12px, 3vw, 24px);
                    padding: 24px 0;
                }

                .game-grid-loading {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(clamp(150px, 45vw, 240px), 1fr));
                    gap: clamp(12px, 3vw, 24px);
                }

                .skeleton-card {
                    aspect-ratio: 3/4.5;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-md);
                    animation: pulse 1.5s infinite;
                }

                .no-products {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--color-text-muted);
                    grid-column: 1 / -1;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 20px;
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                }

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }

                @media (max-width: 480px) {
                    .game-grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                        gap: 12px;
                    }
                }
            `}</style>

            {products.map(product => (
                <GameCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default GameGrid;
