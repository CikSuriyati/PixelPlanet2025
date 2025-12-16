import { Trophy } from 'lucide-react';

export const GroupRankings = ({ data }) => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 font-primary uppercase border-b-2 border-black pb-2 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                Live Leaderboard
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-[0_2px_0_0_#000]">
                        <tr>
                            <th className="py-2 px-2 font-black font-primary text-sm uppercase border-b-2 border-black w-16">Rank</th>
                            <th className="py-2 px-2 font-black font-primary text-sm uppercase border-b-2 border-black">Group</th>
                            <th className="py-2 px-2 font-black font-primary text-sm uppercase border-b-2 border-black text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, index) => (
                            <tr key={index} className="hover:bg-blue-50 transition-colors border-b border-gray-200">
                                <td className="py-3 px-2 font-bold font-mono border-r-2 border-black bg-gray-50 text-center">
                                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-800">
                                    {entry.groupNo}
                                </td>
                                <td className="py-3 px-2 text-right font-black font-mono text-lg text-blue-600">
                                    {entry.averageScore.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-slate-500 font-mono">
                                    Waiting for scores...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
