import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function SkillGapChart({ topSkills }) {
  if (!topSkills || topSkills.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-bold text-slate-100 mb-1">Most Demanded Job Market Skills</h3>
      <p className="text-xs text-slate-400 mb-4">Required skill frequency across all active job postings in the database.</p>
      
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topSkills} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" stroke="#64748b" tickLine={false} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" tickLine={false} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Job Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
