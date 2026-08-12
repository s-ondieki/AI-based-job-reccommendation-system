import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { Building, MapPin, DollarSign, Calendar, Sparkles, CheckCircle2, AlertTriangle, BookOpen, Send, Bookmark, ArrowLeft } from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [learningResources, setLearningResources] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [jobRes, gapRes, learnRes, appRes] = await Promise.allSettled([
          API.get(`/jobs/${id}`),
          API.get(`/recommendations/skill-gap/${id}`),
          API.get('/learning'),
          API.get('/applications')
        ]);

        if (jobRes.status === 'fulfilled' && jobRes.value.data.success) {
          setJob(jobRes.value.data.job);
        }

        if (gapRes.status === 'fulfilled' && gapRes.value.data.success) {
          setSkillGap(gapRes.value.data.skillGap);
        }

        if (learnRes.status === 'fulfilled' && learnRes.value.data.success) {
          setLearningResources(learnRes.value.data.resources);
        }

        if (appRes.status === 'fulfilled' && appRes.value.data.success) {
          const existing = appRes.value.data.applications.find(a => a.job?._id === id);
          if (existing) {
            setApplicationStatus(existing.status);
          }
        }
      } catch (err) {
        console.error('Error loading job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleApply = async (statusToSet = 'Applied') => {
    try {
      const res = await API.post('/applications', { jobId: id, status: statusToSet });
      if (res.data.success) {
        setApplicationStatus(statusToSet);
        setMsg(`Job application status updated to: ${statusToSet}`);
      }
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-xs">Loading job details & AI skill gap...</div>;
  }

  if (!job) {
    return <div className="p-12 text-center text-slate-400 text-xs">Job not found.</div>;
  }

  const matchingSkills = skillGap?.matchingSkills || [];
  const missingSkills = skillGap?.missingSkills || [];
  const coveragePct = skillGap?.skillCoveragePercentage || 0;

  // Filter learning resources for missing skills
  const missingLower = missingSkills.map(s => s.toLowerCase());
  const suggestedCourses = learningResources.filter(r => missingLower.includes(r.skill.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <Link to="/jobs" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Search</span>
      </Link>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge text={job.employmentType} color="blue" />
            <Badge text={job.industry} color="slate" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Building className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-300">{job.company}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{job.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>{job.salaryRange}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => handleApply('Saved')}
            className={`px-5 py-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
              applicationStatus === 'Saved'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{applicationStatus === 'Saved' ? 'Saved' : 'Save Job'}</span>
          </button>

          <button
            onClick={() => handleApply('Applied')}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-2 ${
              ['Applied', 'Interview', 'Offered', 'Accepted'].includes(applicationStatus)
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{applicationStatus ? `Status: ${applicationStatus}` : 'Apply Now'}</span>
          </button>
        </div>
      </div>

      {/* AI Recommendation & Skill Gap Analysis Box */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/20 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">AI Recommendation & Skill Gap Analysis</h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {coveragePct}% Skill Coverage
          </span>
        </div>

        {/* Matched vs Missing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matching Skills ({matchingSkills.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {matchingSkills.length > 0 ? (
                matchingSkills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No matching skills detected in your profile.</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-amber-400 font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing Required Skills ({missingSkills.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.length > 0 ? (
                missingSkills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    ! {s}
                  </span>
                ))
              ) : (
                <span className="text-emerald-400">Great job! You possess all required skills for this job.</span>
              )}
            </div>
          </div>
        </div>

        {/* Explainable AI Rationale */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-2">
          <h3 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Why We Recommend This Job</h3>
          <p className="leading-relaxed">
            Our recommendation algorithm weighted your technical skills ({matchingSkills.length} matches), work experience fit, and educational qualification against {job.company}'s requirements.
          </p>
        </div>
      </div>

      {/* Suggested Learning Resources for Missing Skills */}
      {suggestedCourses.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Recommended Learning Resources for Missing Skills</span>
          </h2>
          <p className="text-xs text-slate-400">Complete these targeted courses to close your skill gap for this position.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {suggestedCourses.map((course, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Badge text={course.skill} color="amber" />
                    <span className="text-[11px] text-slate-500">{course.provider}</span>
                  </div>
                  <h4 className="font-bold text-slate-200">{course.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                </div>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-center font-semibold rounded-xl border border-slate-700 transition block"
                >
                  Start Course ({course.duration}) ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Description & Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-sm text-slate-300 leading-relaxed">
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-3">Job Description</h3>
          <p>{job.description}</p>
        </div>

        {job.responsibilities?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-3">Key Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              {job.responsibilities.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {job.qualifications?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-3">Qualifications & Requirements</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              {job.qualifications.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
