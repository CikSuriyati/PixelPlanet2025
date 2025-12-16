import React from 'react';
import { Star, Zap, Presentation } from 'lucide-react';

const AwardCard = ({ title, icon: Icon, qualifiedCount, candidates }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                    <Icon size={20} color="var(--accent-secondary)" />
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
            </div>

            <div>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                    {qualifiedCount}
                </span>
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>Qualified Groups</span>
            </div>

            <div style={{
                marginTop: '0.5rem',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '1rem',
                maxHeight: '200px',
                overflowY: 'auto'
            }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Top Candidates
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {candidates.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No qualifications yet</p>
                    ) : (
                        candidates.map((c, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span>{c.name}</span>
                                <span style={{ color: 'var(--accent-primary)' }}>{c.votes} Votes</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const AwardsPanel = ({ awards }) => {
    const getIcon = (id) => {
        if (id === 'campus') return Star;
        if (id === 'innovation') return Zap;
        return Presentation;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Special Awards Qualifications</h2>
            <div className="grid-auto">
                {awards.map(award => (
                    <AwardCard
                        key={award.id}
                        title={award.name}
                        icon={getIcon(award.id)}
                        qualifiedCount={award.qualifiedCount}
                        candidates={award.rankings}
                    />
                ))}
            </div>
        </div>
    );
};

export default AwardsPanel;
