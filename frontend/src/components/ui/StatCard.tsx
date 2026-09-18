import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  change,
  trend,
  subtitle,
  color = 'emerald',
}) => {
  const colorStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  return (
    <div className="bg-[#121f17] border border-[#1d3326] rounded-xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-[#2e523b]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {change !== undefined && trend && (
          <div
            className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
              trend === 'up'
                ? 'bg-emerald-500/15 text-emerald-400'
                : trend === 'down'
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-slate-500/15 text-slate-400'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
            <span>{change > 0 ? `+${change}%` : `${change}%`}</span>
          </div>
        )}
        {subtitle && <span className="text-slate-500 font-normal">{subtitle}</span>}
      </div>
    </div>
  );
};
