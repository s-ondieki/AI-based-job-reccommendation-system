import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { BookmarkCheck, Building, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';

export default function SavedJobsPage() {
  const [savedApps, setSavedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await API.get('/applications');
      if (res.data.success) {
        setSavedApps(res.data.applications.filter(a => a.status === 'Saved'));
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id) => {
    try {
      const res = await API.delete(`/applications/${id}`);
      if (res.data.success) {
        setSavedApps(savedApps.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Bookmarked & Saved Jobs</h1>
        <p className="text-xs text-slate-400">Review positions you have saved for future application submissions.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading saved jobs...</div>
      ) : savedApps.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No saved jobs bookmarked yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedApps.map((app) => (
            <div key={app._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge text={app.job?.employmentType || 'Full-time'} color="blue" />
                  <button
                    onClick={() => handleRemove(app._id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{app.job?.title}</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 mb-2">
                  <span>{app.job?.company}</span>
                  <span>•</span>
                  <span>{app.job?.location}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{app.job?.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Saved: {new Date(app.createdAt).toLocaleDateString()}</span>
                <Link
                  to={`/jobs/${app.job?._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
