import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { Target, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SkillGapPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/jobs').then((res) => {
      if (res.data.success && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
        setSelectedJobId(res.data.jobs[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    const fetchGap = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/recommendations/skill-gap/${selectedJobId}`);
        if (res.data.success) {
          setSkillGap(res.data.skillGap);
        }
      } catch (err) {
        console.error('Error fetching skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGap();
  }, [selectedJobId]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Interactive Skill Gap Analysis</h1>
        <p className="text-xs text-slate-400">Select any target position in the database to isolate matching skills versus missing competencies.</p>
      </div>

      {/* Target Job Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <label className="block text-xs font-bold text-slate-300">Select Target Position for Analysis</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
        >
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title} — {j.company} ({j.industry})
            </option>
          ))}
        </select>
      </div>

      {/* Skill Gap Results Display */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Analyzing skill gap...</div>
      ) : skillGap ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Skill Coverage Summary</h3>
                <p className="text-xs text-slate-400">
                  {skillGap.totalMatched} out of {skillGap.totalRequired} required skills satisfied
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-400">{skillGap.skillCoveragePercentage}%</span>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Coverage</span>
            </div>
          </div>

          {/* Matched vs Missing Skill Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-emerald-400 flex items-center space-x-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matching Verified Skills ({skillGap.matchingSkills.length})</span>
              </h3>
              <div className="space-y-2">
                {skillGap.matchingSkills.length > 0 ? (
                  skillGap.matchingSkills.map((s, idx) => (
                    <div key={idx} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between text-emerald-300 font-semibold">
                      <span>✓ {s}</span>
                      <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">Verified</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No matching skills detected in your candidate profile.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-amber-400 flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Skill Deficiencies / Gaps ({skillGap.missingSkills.length})</span>
              </h3>
              <div className="space-y-2">
                {skillGap.missingSkills.length > 0 ? (
                  skillGap.missingSkills.map((s, idx) => (
                    <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between text-amber-300 font-semibold">
                      <span>! {s}</span>
                      <Link to="/learning" className="text-[10px] text-amber-400 underline hover:text-amber-300">
                        Find Resource ↗
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-emerald-400 font-semibold">No skill gaps! You fully satisfy all required skills for this job.</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Ready to close identified skill gaps?</span>
            <Link to="/learning" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md">
              <BookOpen className="w-4 h-4" />
              <span>Explore Learning Resources</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
