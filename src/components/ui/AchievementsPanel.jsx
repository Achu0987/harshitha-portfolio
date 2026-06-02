import React from 'react';
import '../../styles/AchievementsPanel.scss';

const SERVICES = [
    {
        id: 'web',
        title: 'Website Development',
        desc: 'Custom, responsive websites built with modern technologies.'
    },
    {
        id: '3dweb',
        title: '3D Website Design',
        desc: 'Immersive, interactive 3D web experiences.'
    },
    {
        id: 'ecommerce',
        title: 'E-commerce Solutions',
        desc: 'Scalable and secure online stores optimized for sales.'
    },
    {
        id: 'mobile',
        title: 'Mobile App Dev',
        desc: 'Sleek, cross-platform mobile applications.'
    },
    {
        id: 'business',
        title: 'Business Designing',
        desc: 'Logo, Banner, Poster, Presentation, and others.'
    }
];

const AchievementsPanel = ({ isOpen, onClose }) => {
    return (
        <div className={`achievements-panel ${isOpen ? 'open' : ''}`} inert={!isOpen ? true : undefined}>
            <div className="achievements-card">
                <div className="achievements-header">
                    <h3>MY SERVICES</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close services"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="achievements-list">
                    {SERVICES.map((service) => (
                        <div key={service.id} className="achievement-item unlocked">
                            <div className="achievement-icon">
                                <svg viewBox="0 0 24 24" className="icon-unlocked" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="achievement-text">
                                <div className="achievement-title">{service.title}</div>
                                <div className="achievement-label" style={{ fontSize: '0.8rem', color: '#555', marginTop: '2px', lineHeight: '1.2' }}>
                                    {service.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="achievements-footer">
                    <span style={{ letterSpacing: '0.1em' }}>AVAILABLE FOR FREELANCE</span>
                </div>
            </div>
        </div>
    );
};

export default AchievementsPanel;
