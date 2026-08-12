import React from 'react';
import { Award, AlertTriangle, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import Badge from '../common/Badge';

export default function ReadinessWidget({ readiness }) {
  if (!readiness) return null;

  const { readinessScore, readinessLevel, color, disclaimer } = readiness;

  const getColorClass = (c) => {
    switch (c) {
      case 'green': return 'from-emerald-500 to-teal-600 text-emerald-400 border-emerald-500/30';
      case 'blue': return 'from-blue-500 to-indigo-600 text-blue-400 border-blue-500/30';
      case 'yellow': return 'from-amber-500 to-orange-600 text-amber-400 border-amber-500/30';
      case 'red': return 'from-rose-500 to-red-600 text-rose-400 border-rose-500/30';
      default: return 'from-blue-500 to-indigo-600 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Career Readiness Score</h3>
        </div>
        <Badge text={readinessLevel} color={color === 'green' ? 'green' : color === 'yellow' ? 'yellow' : 'blue'} />
      </div>

      <div className="flex items-center space-x-6 my-2">
        <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
          {/* Radial gauge display */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * readinessScore) / 100}
              strokeLinecap="round"
              className={color === 'green' ? 'text-emerald-400' : color === 'yellow' ? 'text-amber-400' : 'text-blue-400'}
              fill="transparent"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-slate-100">{readinessScore}</span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 text-xs">
          <p className="text-slate-300 font-medium leading-relaxed">
            {readinessScore >= 85
              ? 'Your profile demonstrates exceptional preparedness for job applications.'
              : readinessScore >= 70
              ? 'Strong readiness! Closing 1 or 2 skill gaps will maximize your match rates.'
              : 'Developing readiness. Focus on completing suggested learning roadmaps.'}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>{disclaimer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
