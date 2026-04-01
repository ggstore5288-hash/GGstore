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
                position: 'relative', 
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.03)', // Subtle placeholder
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
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'opacity'
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
                    background: '#1a1a24',
                    color: 'rgba(255,255,255,0.1)',
                    gap: '8px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Image Unavailable</span>
                </div>
            )}
        </div>
    );
};

export default SmartImage;
