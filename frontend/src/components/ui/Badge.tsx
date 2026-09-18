import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'carbon' | 'biodiversity' | 'mixed' | 'active' | 'draft' | 'completed' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => {
  const styles = {
    carbon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    biodiversity: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    mixed: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    draft: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    completed: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const selectedVariant = variant === 'neutral'
    ? label.toLowerCase() as BadgeProps['variant']
    : variant;

  const key = (selectedVariant && selectedVariant in styles) ? selectedVariant : 'neutral';
  const className = styles[key];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
};
