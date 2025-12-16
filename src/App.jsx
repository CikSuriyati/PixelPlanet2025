import { useState, useMemo, useEffect } from 'react';
import { Users, Gavel, Award, Activity, Database, RefreshCw, WifiOff } from 'lucide-react';
import { fetchAndParseData, calculateGroupAverages, getAwardFinalists, getCompletionStats } from './utils/analytics';
import { StatCard } from './components/StatCard';
import { GroupRankings } from './components/GroupRankings';
import { AwardStats } from './components/AwardStats';

// Fallback Demo Data (re-using the structure we had)
const DEMO_DATA = {
  evaluations: [
    { groupNo: "ELYSIUM", totalAverage: 3.8, awards: { campusNomination: "Yes", innovationNomination: "", presentationNomination: "" } },
    { groupNo: "RODONG 17", totalAverage: 3.5, awards: { campusNomination: "", innovationNomination: "Yes", presentationNomination: "" } },
    { groupNo: "4GREENS", totalAverage: 3.2, awards: { campusNomination: "", innovationNomination: "", presentationNomination: "Yes" } },
    { groupNo: "ECO-WARRIORS", totalAverage: 2.9, awards: { campusNomination: "Yes", innovationNomination: "Yes", presentationNomination: "" } }
  ],
  juryCount: 5,
  groupCount: 4
};

function App() {
  // Initialize from cache if possible
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('dashboard_data');
    return cached ? JSON.parse(cached) : { evaluations: [], juryCount: 0, groupCount: 0 };
  });

  const [loading, setLoading] = useState(!data.evaluations.length);
  const [error, setError] = useState(null);
  const [dateTime, setDateTime] = useState(() => {
    return localStorage.getItem('dashboard_last_updated') || new Date().toLocaleString();
  });
  const [usingCache, setUsingCache] = useState(!!data.evaluations.length);

  const loadData = async () => {
    try {
      setLoading(true);
      // Clear previous connection errors if we are retrying
      if (error?.includes("Live data")) setError(null);

      const result = await fetchAndParseData();

      // Accept result if we have a valid object (it will default to empty arrays/zeros on error)
      if (result) {
        setData(result);
        const now = new Date().toLocaleString();
        setDateTime(now);
        setError(null);
        setUsingCache(false);

        // Update Cache
        localStorage.setItem('dashboard_data', JSON.stringify(result));
        localStorage.setItem('dashboard_last_updated', now);

        // Warn only if everything is completely empty (might mean fetch failed for all)
        if (result.evaluations.length === 0 && result.juryCount === 0 && result.groupCount === 0) {
          console.warn("Fetched data is completely empty (all sources)");
        }
      } else {
        console.warn("Fetched data is null");
      }
    } catch (err) {
      console.error("Failed to load data", err);
      // If we have data (from cache or previous fetch), just warn
      if (data.evaluations.length > 0) {
        setError("Live sync failed, using cached data");
        setUsingCache(true);
      } else {
        setError("Live data disconnect - No cached data found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 60s
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDemoData = () => {
    setData(DEMO_DATA);
    localStorage.setItem('dashboard_data', JSON.stringify(DEMO_DATA));
    setDateTime("DEMO MODE");
    setError(null);
  };

  const stats = useMemo(() => getCompletionStats(data.evaluations, data.groupCount, data.juryCount), [data]);
  const rankings = useMemo(() => calculateGroupAverages(data.evaluations), [data]);
  const awardData = useMemo(() => getAwardFinalists(data.evaluations), [data]);

  return (
    <div className="container">
      {/* Pixel Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 py-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-0 right-0 w-8 h-8 bg-green-400 rounded-full border-2 border-black"></div>
              <div className="absolute bottom-1 left-1 w-6 h-6 bg-green-400 rounded-full border-2 border-black"></div>
            </div>
          </div>
          <div>
            <h1 className="pixel-title text-3xl md:text-4xl mb-2">
              PIXEL & PLANET
            </h1>
            <div className="flex items-center gap-3">
              <span className="pixel-title text-2xl" style={{ color: '#fff', textShadow: '2px 2px 0 #000' }}>2025</span>
              <span className="text-sm font-bold bg-black text-white px-2 py-1 uppercase tracking-widest">Multimedia Challenge</span>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col items-end gap-2">
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#1e293b' }}>Last Updated</div>
          <div className="bg-white border-2 border-black px-4 py-2 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-2">
            {usingCache && <Database size={14} className="text-orange-500" />}
            {dateTime}
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-600 px-3 py-1 text-xs font-bold uppercase flex items-center gap-2">
              <WifiOff size={12} />
              {error}
            </div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="pixel-card px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold uppercase flex items-center gap-2"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Force Sync"}
          </button>
        </div>
      </header>

      <main className="animate-entry space-y-12">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard
            title="Total Groups"
            value={stats.totalGroups}
            icon={Users}
            subtext="Participating"
          />
          <StatCard
            title="Total Juries"
            value={stats.totalJuries}
            icon={Gavel}
            subtext="Evaluators"
          />
          <StatCard
            title="Judging Progress"
            value={`${stats.progressPercentage}%`}
            icon={Activity}
            subtext={`${stats.completedEvaluations || 0} / ${stats.totalGroups * 2} Submitted`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[450px]">
          <div className="lg:col-span-2 h-full pixel-card p-8 bg-white/90">
            <GroupRankings data={rankings} />
          </div>
          <div className="lg:col-span-1 h-full pixel-card p-8 bg-white/90">
            <AwardStats data={awardData} />
          </div>
        </div>

        {/* Empty State / Demo Offer */}
        {data.evaluations.length === 0 && !loading && (
          <div className="text-center p-8 bg-white/50 border-2 border-black border-dashed flex flex-col items-center gap-4">
            <p className="font-bold text-slate-600">No competition data found yet.</p>
            <p className="text-sm text-slate-500">
              Unable to fetch live data. You can load demo data to view the layout.
            </p>
            <button
              onClick={loadDemoData}
              className="px-6 py-2 bg-yellow-400 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
            >
              Load Demo Data
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
