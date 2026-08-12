import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { Send, Building, MapPin, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/applications/${id}`, { status: newStatus });
      if (res.data.success) {
        setApplications(applications.map(a => a._id === id ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this application from tracking?')) return;
    try {
      const res = await API.delete(`/applications/${id}`);
      if (res.data.success) {
        setApplications(applications.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Job Applications Tracker</h1>
        <p className="text-xs text-slate-400">Track and update the status of your saved and submitted job applications.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading tracked applications...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No job applications tracked yet. Browse jobs or recommendations to save or submit applications!
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Position & Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-850 transition">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${app.job?._id}`} className="font-bold text-slate-100 hover:text-blue-400 block">
                        {app.job?.title || 'Job Listing'}
                      </Link>
                      <span className="text-slate-500 text-[11px]">{app.job?.company}</span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {app.job?.location}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Accepted">Accepted</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
