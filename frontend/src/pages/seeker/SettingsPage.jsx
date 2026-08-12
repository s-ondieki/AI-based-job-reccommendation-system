import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Settings, Shield, User, Database, Cpu } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function SettingsPage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System & Account Settings</h1>
        <p className="text-xs text-slate-400">Environment configurations and account metadata for the AI Job Recommendation System.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Account Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">User Name</span>
            <span className="font-bold text-slate-200">{user?.name}</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Email Address</span>
            <span className="font-bold text-slate-200">{user?.email}</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Assigned Role</span>
            <Badge text={user?.role?.toUpperCase()} color={user?.role === 'admin' ? 'emerald' : 'blue'} />
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Registered On</span>
            <span className="font-bold text-slate-200">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs text-slate-300">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Academic System Architecture Parameters</span>
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span>Node.js Backend Port</span>
            <code className="text-blue-400 font-bold">5000</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span>Python FastAPI AI Engine Port</span>
            <code className="text-blue-400 font-bold">8000</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span>MongoDB Database URI</span>
            <code className="text-emerald-400 font-bold">mongodb://127.0.0.1:27017/job_recommendation_db</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span>TF-IDF Vectorizer & Weighted Matching</span>
            <Badge text="Active" color="green" />
          </div>
        </div>
      </div>
    </div>
  );
}
