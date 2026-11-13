import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  Leaf, 
  Sprout, 
  Calendar,
  Share2,
  Printer,
  Compass
} from 'lucide-react';

export default function AdvisoryReportDisplay({ advisory, farm = null }) {
  if (!advisory || !advisory.ai_response) {
    return (
      <div className="p-8 text-center text-slate-400">
        No advisory report data available.
      </div>
    );
  }

  const { ai_response, advisory_type, user_observations, created_at } = advisory;
  const { summary, risk_level, recommended_actions, preventative_measures } = ai_response;

  // Color schemes for Risk Levels
  const riskBadges = {
    Low: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle,
      label: 'Low Risk — Optimal Growth Conditions'
    },
    Medium: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'Medium Risk — Active Monitoring Required'
    },
    High: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: ShieldAlert,
      label: 'High Risk — Urgent Remediation Required'
    },
    Critical: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: ShieldAlert,
      label: 'Critical Risk — Severe Threat to Crop Yield'
    }
  };

  const currentRisk = riskBadges[risk_level] || riskBadges.Low;
  const RiskIcon = currentRisk.icon;

  const farmDetails = farm || advisory.farms;

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>{advisory_type} Advisory Report</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {farmDetails?.plot_name || 'Farm Plot'}
            </h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Generated: {new Date(created_at).toLocaleDateString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
              </span>
              {farmDetails?.acreage && (
                <span>• {farmDetails.acreage} Acres</span>
              )}
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center">
            <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 text-xs font-bold ${currentRisk.bg}`}>
              <RiskIcon className="w-4 h-4 shrink-0" />
              <span>{currentRisk.label}</span>
            </div>
          </div>
        </div>

        {/* Farm Metadata Badges */}
        {farmDetails && (
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Soil Type & pH</span>
              <span className="font-bold text-slate-200">{farmDetails.soil_type} • pH {farmDetails.soil_ph}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Climate Zone</span>
              <span className="font-bold text-slate-200">{farmDetails.climate_zone}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">NPK Balance</span>
              <span className="font-bold text-slate-200">
                N:{farmDetails.nitrogen_level || 'Med'} • P:{farmDetails.phosphorus_level || 'Med'} • K:{farmDetails.potassium_level || 'Med'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block mb-0.5">Acreage</span>
              <span className="font-bold text-slate-200">{farmDetails.acreage} Acres</span>
            </div>
          </div>
        )}

        {/* Farmer Observations Callout */}
        {user_observations && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">Provided Field Observations:</span>
            <p className="text-slate-300 italic">"{user_observations}"</p>
          </div>
        )}
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-2">
          <Leaf className="w-4 h-4" />
          <span>Scientific Assessment & Diagnosis</span>
        </h2>
        <p className="text-base text-slate-200 leading-relaxed font-medium">
          {summary}
        </p>
      </div>

      {/* Action Plan Timeline & Recommended Interventions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-5 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Recommended Action Plan & Treatment Protocol</span>
        </h2>

        <div className="space-y-4">
          {recommended_actions && recommended_actions.map((action, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-sm text-white">{action.action_title}</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-[11px] font-semibold tracking-wide w-fit flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{action.timeline}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-9">
                {action.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preventative Measures & Long-Term Stewardship */}
      {preventative_measures && preventative_measures.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Preventative Measures & Long-Term Soil Stewardship</span>
          </h2>
          <ul className="space-y-2.5">
            {preventative_measures.map((measure, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300 leading-relaxed">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions (Print / Save) */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-700"
        >
          <Printer className="w-4 h-4" />
          <span>Print Advisory Report</span>
        </button>
      </div>
    </div>
  );
}
