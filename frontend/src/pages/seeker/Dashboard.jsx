import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import ReadinessWidget from '../../components/dashboard/ReadinessWidget';
import JobCard from '../../components/jobs/JobCard';
import SkillGapChart from '../../components/dashboard/SkillGapChart';
import { Sparkles, Briefcase, Send, Target, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [readiness, setReadiness] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [readinessRes, recsRes, appsRes, statsRes] = await Promise.allSettled([
          API.get('/recommendations/career-readiness'),
          API.post('/recommendations/generate', {}),
          API.get('/applications'),
          API.get('/admin/statistics')
        ]);

        if (readinessRes.status === 'fulfilled' && readinessRes.value.data.success) {
          setReadiness(readinessRes.value.data.readiness);
        }

        if (recsRes.status === 'fulfilled' && recsRes.value.data.success) {
          setRecommendations(recsRes.value.data.recommendations.slice(0, 3));
        }

        if (appsRes.status === 'fulfilled' && appsRes.value.data.success) {
          const apps = appsRes.value.data.applications;
          setApplications(apps);
          setSavedJobIds(apps.map(a => a.job?._id).filter(Boolean));
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setTopSkills(statsRes.value.data.stats.topRequestedSkills || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSaveJob = async (jobId) => {
    try {
      const res = await API.post('/applications', { jobId, status: 'Saved' });
      if (res.data.success) {
        if (!savedJobIds.includes(jobId)) {
          setSavedJobIds([...savedJobIds, jobId]);
        }
      }
    } catch (err) {
      console.error('Save job error:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Intelligence Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Welcome back, {user?.name?.split(' ')[0] || 'Seeker'}!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Your profile has been analyzed against active tech listings to match top job opportunities and generate skill gap insights.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/recommendations"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
          >
            <span>View All AI Matches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/resume"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition"
          >
            Upload Resume
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{recommendations.length}</span>
            <span className="text-xs text-slate-400 block font-medium">Top Match Jobs</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{applications.length}</span>
            <span className="text-xs text-slate-400 block font-medium">Applications Tracked</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{user?.profile?.skills?.length || 0}</span>
            <span className="text-xs text-slate-400 block font-medium">Verified Profile Skills</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">Roadmap</span>
            <span className="text-xs text-slate-400 block font-medium">Learning Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Readiness Widget + Top Skill Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReadinessWidget readiness={readiness} />
        <SkillGapChart topSkills={topSkills} />
      </div>

      {/* Top AI Job Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Top Recommended Jobs For You</h2>
            <p className="text-xs text-slate-400">Ranked by weighted similarity over skills, experience, and degree match.</p>
          </div>
          <Link to="/recommendations" className="text-xs font-semibold text-blue-400 hover:underline">
            View All ({recommendations.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Generating recommendations from Python AI service...</div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No recommendations generated yet. Try updating your profile skills or uploading a resume!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <JobCard
                key={rec.jobId}
                recommendation={rec}
                onSave={handleSaveJob}
                isSaved={savedJobIds.includes(rec.jobId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
