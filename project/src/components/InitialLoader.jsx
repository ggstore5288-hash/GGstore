import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * InitialLoader
 * A premium full-screen loading scene that hides the "part-by-part" 
 * rendering of the page during the initial load.
 */
const InitialLoader = ({ ready, children }) => {
    const { getSetting } = useSettings();
    const [show, setShow] = useState(true);
    const [exiting, setExiting] = useState(false);
    const siteName = getSetting('site.name', 'GG STORE');

    useEffect(() => {
        if (ready && show) {
            // Start exit animation
            setExiting(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, 600); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [ready, show]);

    if (!show) return children;

    return (
        <>
            <div className={`initial-loader ${exiting ? 'exit' : ''}`}>
                <style>{`
                    .initial-loader {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: #05050a;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                                    visibility 0.6s;
                    }

                    .initial-loader.exit {
                        opacity: 0;
                        visibility: hidden;
                        pointer-events: none;
                    }

                    .loader-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 24px;
                        animation: loaderPulse 2s infinite ease-in-out;
                    }

                    .loader-logo {
                        font-family: 'Orbitron', sans-serif;
                        font-size: clamp(32px, 8vw, 48px);
                        font-weight: 800;
                        color: #00d9ff;
                        text-transform: uppercase;
                        letter-spacing: 4px;
                        text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
                    }

                    .loader-bar-container {
                        width: 200px;
                        height: 2px;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 2px;
                        overflow: hidden;
                        position: relative;
                    }

                    .loader-bar-progress {
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, #00d9ff, transparent);
                        animation: loaderProgress 1.5s infinite linear;
                    }

                    .loader-status {
                        font-size: 10px;
                        color: rgba(255, 255, 255, 0.3);
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }

                    @keyframes loaderPulse {
                        0%, 100% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.02); opacity: 1; }
                    }

                    @keyframes loaderProgress {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }
                `}</style>

                <div className="loader-content">
                    <div className="loader-logo">{siteName}</div>
                    <div className="loader-bar-container">
                        <div className="loader-bar-progress"></div>
                    </div>
                    <div className="loader-status">Initializing Secure Environment</div>
                </div>
            </div>
            {/* Render children in background so they are ready when loader fades */}
            <div style={{ visibility: exiting || !show ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </>
    );
};

export default InitialLoader;
