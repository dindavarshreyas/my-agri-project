import React from 'react';

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/40'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'group-hover:border-amber-500/40'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'group-hover:border-blue-500/40'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'group-hover:border-purple-500/40'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`group p-5 rounded-2xl bg-slate-900/60 border ${scheme.border} ${scheme.glow} backdrop-blur transition-all duration-300 hover:shadow-lg hover:shadow-black/40`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-white mb-1">{value}</div>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
