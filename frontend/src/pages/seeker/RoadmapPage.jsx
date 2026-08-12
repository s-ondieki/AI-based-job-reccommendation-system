import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { Map, CheckCircle2, Clock, Circle, ArrowRight, ExternalLink } from 'lucide-react';

export default function RoadmapPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await API.get('/learning/roadmap');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/learning/roadmap/${id}`, { status: newStatus });
      if (res.data.success) {
        setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      console.error('Error updating roadmap status:', err);
    }
  };

  const getStatusIcon = (st) => {
    if (st === 'Completed') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (st === 'In Progress') return <Clock className="w-5 h-5 text-amber-400" />;
    return <Circle className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Personalized Career Learning Roadmap</h1>
        <p className="text-xs text-slate-400">Step-by-step milestone progression to close skill deficiencies and achieve your target career goal.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Generating custom career roadmap...</div>
      ) : (
        <div className="space-y-4">
          {items.map((step) => (
            <div key={step._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-start space-x-4">
              <div className="mt-1 shrink-0">{getStatusIcon(step.status)}</div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Step {step.stepOrder} • {step.skill}</span>
                  <select
                    value={step.status}
                    onChange={(e) => handleStatusChange(step._id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <h3 className="text-base font-bold text-slate-100">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>

                {step.resourceTitle && (
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Resource: <strong className="text-slate-200">{step.resourceTitle}</strong></span>
                    {step.resourceUrl && (
                      <a href={step.resourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1 font-semibold">
                        <span>Open Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
