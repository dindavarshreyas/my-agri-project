import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarms, getAdvisories } from '../lib/api';
import DashboardCard from '../components/DashboardCard';
import { 
  Sprout, 
  Sparkles, 
  PlusCircle, 
  Layers, 
  FileText, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const [farms, setFarms] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [farmsData, advisoriesData] = await Promise.all([
          getFarms(),
          getAdvisories()
        ]);
        setFarms(farmsData);
        setAdvisories(advisoriesData);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute analytics
  const totalAcreage = farms.reduce((acc, f) => acc + Number(f.acreage || 0), 0).toFixed(1);
  const avgPh = farms.length > 0 
    ? (farms.reduce((acc, f) => acc + Number(f.soil_ph || 0), 0) / farms.length).toFixed(1)
    : 'N/A';

  const riskBadgeStyles = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agricultural Operations Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, soil chemistry diagnostics, and Gemini-powered advisories.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/farms/new"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Farm Plot</span>
          </Link>
          <Link
            to="/advisory/generate"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Advisory</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Registered Farm Plots"
          value={loading ? '...' : farms.length}
          subtitle="Monitored agricultural plots"
          icon={Layers}
          color="emerald"
        />
        <DashboardCard
          title="Total Cultivated Area"
          value={loading ? '...' : `${totalAcreage} ac`}
          subtitle="Active acreage under profile"
          icon={MapPin}
          color="blue"
        />
        <DashboardCard
          title="Advisories Generated"
          value={loading ? '...' : advisories.length}
          subtitle="Crop & pest diagnostic reports"
          icon={Sparkles}
          color="purple"
        />
        <DashboardCard
          title="Average Soil pH"
          value={loading ? '...' : avgPh}
          subtitle="Across all registered plots"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Registered Farm Plots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span>Your Farm Plots</span>
          </h2>
          <Link to="/farms/new" className="text-xs font-semibold text-emerald-400 hover:underline">
            + New Plot
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading farm plots...</div>
        ) : farms.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Farm Plots Registered Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Register your first plot to record soil type, pH, and NPK metrics for customized advisories.
            </p>
            <Link
              to="/farms/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register First Plot</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-semibold text-slate-300">
                      {farm.climate_zone}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {farm.acreage} Acres
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-2">{farm.plot_name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                    <div className="bg-slate-950/50 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-500 uppercase">Soil Type</span>
                      <span className="font-semibold text-slate-200">{farm.soil_type}</span>
                    </div>
                    <div className="bg-slate-950/50 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-500 uppercase">Soil pH</span>
                      <span className="font-semibold text-slate-200">{farm.soil_ph}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                    <span>NPK Levels:</span>
                    <span className="font-medium text-slate-300">
                      N:{farm.nitrogen_level[0]} | P:{farm.phosphorus_level[0]} | K:{farm.potassium_level[0]}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/farms/${farm.id}`}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/advisory/generate?farmId=${farm.id}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold"
                  >
                    Get Advice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Advisory Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Recent AI Advisories</span>
          </h2>
          <Link to="/advisory/generate" className="text-xs font-semibold text-emerald-400 hover:underline">
            + New Advisory
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading advisories...</div>
        ) : advisories.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
            No advisories generated yet. Click "Generate Advisory" to request AI recommendations.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Farm Plot</th>
                  <th className="p-4">Advisory Domain</th>
                  <th className="p-4">Risk Rating</th>
                  <th className="p-4">Summary</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {advisories.map((adv) => {
                  const risk = adv.ai_response?.risk_level || 'Low';
                  const badgeClass = riskBadgeStyles[risk] || riskBadgeStyles.Low;
                  return (
                    <tr key={adv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white whitespace-nowrap">
                        {adv.farms?.plot_name || 'Plot'}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                          {adv.advisory_type}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badgeClass}`}>
                          {risk}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-400">
                        {adv.ai_response?.summary}
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-500">
                        {new Date(adv.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          to={`/advisory/${adv.id}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
