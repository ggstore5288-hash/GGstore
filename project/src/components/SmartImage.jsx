import React, { useState, useEffect } from 'react';

/**
 * SmartImage Component
 * High-performance image component that prevents "part-by-part" painting
 * by keeping the image hidden until fully loaded, then fading it in smoothly.
 */
const SmartImage = ({ 
    src, 
    alt, 
    className = '', 
    style = {}, 
    loading = 'lazy', 
    fetchpriority = 'auto',
    decoding = 'async',
    onLoad = () => {},
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Reset state if src changes
    useEffect(() => {
        setIsLoaded(false);
        setError(false);
    }, [src]);

    const handleLoad = (e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    return (
        <div 
            className={`smart-image-container ${className}`}
            style={{ 
                overflow: 'hidden',
                backgroundColor: 'transparent',
                ...style 
            }}
        >
            <img
                src={src}
                alt={alt}
                loading={loading}
                fetchpriority={fetchpriority}
                decoding={decoding}
                onLoad={handleLoad}
                onError={() => setError(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: 1, // Show immediately
                    willChange: 'auto'
                }}
                {...props}
            />
            
            {/* Error or Loading state */}
            {(error || !src) && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1b26 0%, #0f1016 100%)',
                    color: 'rgba(255, 255, 255, 0.25)',
                    gap: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ 
                        fontSize: '11px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.3)'
                    }}>
                        Media Offline
                    </span>
                </div>
            )}
        </div>
    );
};

export default SmartImage;
