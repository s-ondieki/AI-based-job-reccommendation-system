import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { BookOpen, ExternalLink, Filter, Sparkles } from 'lucide-react';

export default function LearningPage() {
  const [resources, setResources] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        setLoading(true);
        const [recRes, allRes] = await Promise.all([
          API.get('/learning/recommendations'),
          API.get('/learning')
        ]);

        if (recRes.data.success) {
          setMissingSkills(recRes.data.missingSkills || []);
        }

        if (allRes.data.success) {
          setResources(allRes.data.resources);
        }
      } catch (err) {
        console.error('Error fetching learning resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearning();
  }, []);

  const filteredResources = selectedSkillFilter
    ? resources.filter(r => r.skill.toLowerCase().includes(selectedSkillFilter.toLowerCase()))
    : resources;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Personalized Learning Hub</h1>
        <p className="text-xs text-slate-400">Curated courses, certifications, and documentation linked directly to your identified skill gaps.</p>
      </div>

      {/* Highlighted Missing Skills Banner */}
      {missingSkills.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Top Missing Market Skills Identified For You</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSkillFilter('')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                selectedSkillFilter === '' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              All Resources ({resources.length})
            </button>
            {missingSkills.map((sk, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSkillFilter(sk)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                  selectedSkillFilter === sk ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                ! Learn {sk}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Learning Resource Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading learning resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <div key={item._id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge text={item.skill} color="amber" />
                  <Badge text={item.level} color="blue" />
                </div>
                <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                <span className="text-xs text-slate-500 block mb-2 font-medium">Provided by {item.provider}</span>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">{item.duration} • {item.type}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <span>Access</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
