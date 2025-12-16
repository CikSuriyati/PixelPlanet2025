import { clsx } from 'clsx';

export const StatCard = ({ title, value, subtext, icon: Icon, className }) => {
    return (
        <div className={clsx("pixel-card p-6", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{title}</p>
                    <h3 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</h3>
                    {subtext && <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>{subtext}</p>}
                </div>
                {Icon && (
                    <div className="p-3 border-2 border-black bg-green-400 shadow-[2px_2px_0px_0px_#000]">
                        <Icon className="w-6 h-6 text-black" />
                    </div>
                )}
            </div>
        </div>
    );
};
