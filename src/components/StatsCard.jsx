import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'var(--text-primary)', subtext }) => {
    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
                    <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: color, fontFamily: 'var(--font-pixel)', letterSpacing: '-0.05em' }}>{value}</h3>
                </div>
                {Icon && (
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)'
                    }}>
                        <Icon size={24} color={color} />
                    </div>
                )}
            </div>
            {subtext && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{subtext}</p>
            )}
        </div>
    );
};

export default StatsCard;
