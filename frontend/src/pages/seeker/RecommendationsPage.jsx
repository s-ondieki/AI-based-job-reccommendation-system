import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { Sparkles, Sliders, RefreshCw } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const [weights, setWeights] = useState({
    skillWeight: 0.40,
    experienceWeight: 0.20,
    educationWeight: 0.15,
    interestWeight: 0.10,
    locationWeight: 0.10,
    certWeight: 0.05
  });

  const fetchRecommendations = async (customWeights = weights) => {
    try {
      setLoading(true);
      const res = await API.post('/recommendations/generate', { weights: customWeights });
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    API.get('/applications').then(res => {
      if (res.data.success) {
        setSavedJobIds(res.data.applications.map(a => a.job?._id).filter(Boolean));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleWeightChange = (key, value) => {
    const val = parseFloat(value);
    const newWeights = { ...weights, [key]: val };
    setWeights(newWeights);
  };

  const handleApplyWeights = (e) => {
    e.preventDefault();
    fetchRecommendations(weights);
  };

  const handleSaveJob = async (jobId) => {
    try {
      const res = await API.post('/applications', { jobId, status: 'Saved' });
      if (res.data.success && !savedJobIds.includes(jobId)) {
        setSavedJobIds([...savedJobIds, jobId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">AI Job Recommendation Hub</h1>
          <p className="text-xs text-slate-400">Rankings calculated dynamically using Python FastAPI TF-IDF & weighted similarity matching.</p>
        </div>

        <button
          onClick={() => fetchRecommendations(weights)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Matches</span>
        </button>
      </div>

      {/* Weight Controls for Experimentation */}
      <form onSubmit={handleApplyWeights} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Academic Experimentation: Adjust Weight Parameters</span>
          </h3>
          <span className="text-[11px] text-slate-400">Default Total = 1.0 (100%)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Skills ({Math.round(weights.skillWeight * 100)}%)</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={weights.skillWeight}
              onChange={(e) => handleWeightChange('skillWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Experience ({Math.round(weights.experienceWeight * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={weights.experienceWeight}
              onChange={(e) => handleWeightChange('experienceWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Education ({Math.round(weights.educationWeight * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.educationWeight}
              onChange={(e) => handleWeightChange('educationWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Interests ({Math.round(weights.interestWeight * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.3"
              step="0.05"
              value={weights.interestWeight}
              onChange={(e) => handleWeightChange('interestWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Location ({Math.round(weights.locationWeight * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.3"
              step="0.05"
              value={weights.locationWeight}
              onChange={(e) => handleWeightChange('locationWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Certs ({Math.round(weights.certWeight * 100)}%)</label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={weights.certWeight}
              onChange={(e) => handleWeightChange('certWeight', e.target.value)}
              className="w-full text-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            Apply Configured Weights
          </button>
        </div>
      </form>

      {/* Recommendations List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Computing weighted recommendations...</div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No job recommendations generated. Add skills or education to your candidate profile!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
