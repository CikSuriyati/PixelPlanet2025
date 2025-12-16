import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const RankIcon = ({ rank }) => {
    if (rank === 1) return <Trophy size={20} color="#fbbf24" />;
    if (rank === 2) return <Medal size={20} color="#94a3b8" />;
    if (rank === 3) return <Medal size={20} color="#b45309" />; // Bronze-ish
    return <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>#{rank}</span>;
};

const Leaderboard = ({ groups }) => {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Award className="text-gradient" size={28} />
                <h2 style={{ fontSize: '1.5rem' }}>General Leaderboard</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', width: '80px' }}>Rank</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Group Name</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Score (Avg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group, index) => (
                            <tr
                                key={group.name}
                                style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    background: index < 3 ? 'rgba(255,255,255,0.02)' : 'transparent'
                                }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div className="flex-center" style={{ justifyContent: 'flex-start', width: '30px' }}>
                                        <RankIcon rank={index + 1} />
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: index < 3 ? 600 : 400 }}>
                                    {group.name}
                                    {index === 0 && <span style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.75rem',
                                        background: 'rgba(251, 191, 36, 0.2)',
                                        color: '#fbbf24',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>Leader</span>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                    {group.formattedScore}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
