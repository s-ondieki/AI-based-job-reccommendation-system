import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, Filter, MapPin, Building, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (industry) params.industry = industry;
      if (employmentType) params.employmentType = employmentType;

      const res = await API.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [industry, employmentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Browse Job Database</h1>
        <p className="text-xs text-slate-400">Search and filter active tech listings across IT software, cybersecurity, data science, and cloud operations.</p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, skills, or companies (e.g. React, Python, Cyber)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Industries</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Data Science & Analytics">Data Science & Analytics</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="IT Infrastructure & Networking">Networking & Systems</option>
        </select>

        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Employment Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>

        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Search
        </button>
      </form>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing {jobs.length} job position{jobs.length !== 1 && 's'}</span>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading job listings...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No jobs found matching your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge text={job.employmentType} color="blue" />
                  <span className="text-[11px] text-slate-500">{job.salaryRange}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 hover:text-blue-400 transition mb-1">
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>

                <div className="flex items-center space-x-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.company}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                      {s}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="text-[11px] text-slate-500 font-semibold self-center">
                      +{job.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Link
                  to={`/jobs/${job._id}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold text-center block transition border border-slate-700"
                >
                  View Details & Skill Match
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
