import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, Sparkles, CheckCircle2, AlertCircle, Bookmark, ArrowRight, Info, HelpCircle } from 'lucide-react';
import Badge from '../common/Badge';

export default function JobCard({ recommendation, onSave, isSaved }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const { job, matchPercentage, scores, matchingSkills, missingSkills, explanation } = recommendation;

  const getMatchColor = (pct) => {
    if (pct >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (pct >= 70) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (pct >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-slate-400 border-slate-700 bg-slate-800';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition duration-200 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Badge text={job.employmentType || 'Full-time'} color="blue" />
              <Badge text={job.industry} color="slate" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 hover:text-blue-400 transition">
              <Link to={`/jobs/${job._id}`}>{job.title}</Link>
            </h3>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.company}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.location}</span>
              </span>
            </div>
          </div>

          <div className={`flex flex-col items-end px-3.5 py-2 rounded-xl border ${getMatchColor(matchPercentage)}`}>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xl font-extrabold">{matchPercentage}%</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">AI Match</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Skill Coverage</span>
            <span className="font-semibold text-slate-200">
              {matchingSkills?.length || 0} / {(job.requiredSkills?.length || 0)} Matched
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Experience Match</span>
            <span className="font-semibold text-slate-200">
              {scores?.experienceScore || 100}%
            </span>
          </div>
        </div>

        {/* Explainability Toggle Button */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full text-left flex items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300 py-2 border-t border-slate-800 transition"
        >
          <span className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span>Why this job was recommended?</span>
          </span>
          <span>{showExplanation ? '▲ Hide Rationale' : '▼ View AI Rationale'}</span>
        </button>

        {/* Explanation Drawer */}
        {showExplanation && (
          <div className="mt-3 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs space-y-3 animate-fadeIn">
            <p className="text-slate-300 leading-relaxed font-medium">
              {explanation?.summary || 'Calculated using weighted skill overlap, experience fit, and career preference vector alignment.'}
            </p>

            {matchingSkills?.length > 0 && (
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Matched Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingSkills?.length > 0 && (
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Skill Gaps to Close:</span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                      ! {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
              {explanation?.learningResources?.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Recommended Learning:</span>
                  <div className="space-y-1">
                    {explanation.learningResources.map((resource, idx) => (
                      <a key={idx} href={resource.url || '#'} target="_blank" rel="noreferrer" className="block text-blue-400 hover:text-blue-300">
                        {resource.title} {resource.provider ? `- ${resource.provider}` : ''}
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t border-slate-800 mt-4">
        <Link
          to={`/jobs/${job._id}`}
          className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          View Details
        </Link>

        {onSave && (
          <button
            onClick={() => onSave(job._id)}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              isSaved
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isSaved ? 'Job Bookmarked' : 'Save Job'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
