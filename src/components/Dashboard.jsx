import React from 'react';
import { Users, Gavel, CheckCircle, RefreshCcw } from 'lucide-react';
import StatsCard from './StatsCard';
import Leaderboard from './Leaderboard';
import AwardsPanel from './AwardsPanel';

const Dashboard = ({ data, onReset }) => {
    const { stats, leaderboard, awards } = data;

    return (
        <div className="animate-entry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Overview</h2>
                <button
                    onClick={onReset}
                    className="glass-card"
                    style={{
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <RefreshCcw size={16} />
                    Reset Data
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid-auto" style={{ marginBottom: '2rem' }}>
                <StatsCard
                    title="Total Groups"
                    value={stats.totalGroups}
                    icon={Users}
                    color="var(--accent-primary)"
                />
                <StatsCard
                    title="Jury Members"
                    value={stats.totalJury}
                    icon={Gavel}
                    color="var(--accent-secondary)"
                />
                <StatsCard
                    title="Judgment Completion"
                    value={`${stats.completionPct}%`}
                    subtext={`${stats.totalJudgements} total evaluations submitted`}
                    icon={CheckCircle}
                    color="var(--accent-success)"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <Leaderboard groups={leaderboard} />
                <AwardsPanel awards={awards} />
            </div>
        </div>
    );
};

export default Dashboard;
