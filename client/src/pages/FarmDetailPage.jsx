import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFarmById } from '../lib/api';
import { 
  ArrowLeft, 
  Sprout, 
  Sparkles, 
  Calendar, 
  Layers, 
  MapPin, 
  Compass, 
  TrendingUp,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export default function FarmDetailPage() {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFarm() {
      try {
        setLoading(true);
        const data = await getFarmById(id);
        setFarm(data);
      } catch (err) {
        console.error('Failed to load farm details:', err);
        setError(err.message || 'Farm not found');
      } finally {
        setLoading(false);
      }
    }
    loadFarm();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading farm plot details...</div>;
  }

  if (error || !farm) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20">
        {error || 'Farm plot not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Farm Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>Plot Telemetry Profile</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{farm.plot_name}</h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
              <span>{farm.acreage} Cultivated Acres</span>
              <span>• Climate: {farm.climate_zone}</span>
              <span>• Added: {new Date(farm.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <Link
            to={`/advisory/generate?farmId=${farm.id}`}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Advisory for this Plot</span>
          </Link>
        </div>

        {/* Soil & Chemistry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Soil Type</span>
            <span className="text-lg font-bold text-white">{farm.soil_type}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Soil pH</span>
            <span className="text-lg font-bold text-emerald-400">{farm.soil_ph}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Climate Zone</span>
            <span className="text-lg font-bold text-white">{farm.climate_zone}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">NPK Nutrients</span>
            <span className="text-base font-bold text-amber-400">
              N:{farm.nitrogen_level} | P:{farm.phosphorus_level} | K:{farm.potassium_level}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory History for this Farm */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Advisories Generated for {farm.plot_name}</span>
        </h2>

        {!farm.advisories || farm.advisories.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
            No advisory reports recorded yet for this plot.
          </div>
        ) : (
          <div className="space-y-3">
            {farm.advisories.map((adv) => (
              <div
                key={adv.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {adv.advisory_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(adv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    {adv.ai_response?.summary}
                  </p>
                </div>

                <Link
                  to={`/advisory/${adv.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold shrink-0 flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
