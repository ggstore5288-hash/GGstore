import React from 'react';
import LogoLoop from '../Animations/logoloop';
import '../Animations/logoloop.css';

const CTAButtons = () => {
    // Platform/Brand logos data
    const logos = [
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00d9ff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 0 0-6 6c0 1.25.38 2.42 1.03 3.39l2.76-4.79.02-.03.03-.02a.76.76 0 0 1 .2-.12l.04-.01h.03a.5.5 0 0 1 .15-.01h3.5a.5.5 0 0 1 .4.2l2.8 4.8A6 6 0 0 0 12 6z" /></svg>
                    XBOX
                </div>
            )
        },
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" /></svg>
                    PLAYSTATION
                </div>
            )
        },
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00d9ff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" /></svg>
                    STEAM
                </div>
            )
        },
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H4V6h16v10z" /></svg>
                    NINTENDO
                </div>
            )
        },
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00d9ff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                    EPIC GAMES
                </div>
            )
        },
        {
            node: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" /></svg>
                    PC GAMING
                </div>
            )
        }
    ];

    return (
        <section className="cta-section">
            <div className="container" style={{ width: '100%', overflow: 'hidden' }}>
                <LogoLoop
                    logos={logos}
                    speed={50}
                    direction="left"
                    gap={60}
                    pauseOnHover={true}
                    logoHeight={40}
                />
            </div>
        </section>
    );
};

export default CTAButtons;
