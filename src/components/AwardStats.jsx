import { Award } from 'lucide-react';

export const AwardStats = ({ data }) => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 font-primary uppercase border-b-2 border-black pb-2 flex items-center gap-2">
                <Award size={20} className="text-purple-500" />
                Category Finalists
            </h2>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {data.map((item, index) => (
                    <div key={index} className="pixel-card p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                        <div className="flex items-center gap-3 mb-2 border-b-2 border-dashed border-gray-200 pb-2">
                            <span className="text-2xl">{item.icon}</span>
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">{item.name}</h3>
                        </div>
                        <div className="min-h-[40px]">
                            {item.finalists.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {item.finalists.map((group, idx) => (
                                        <li key={idx} className="font-primary text-lg text-black truncate">
                                            {group}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-slate-400 font-mono italic text-sm">Waiting for nominations...</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
