import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, Award, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              JobMatch AI
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              BIT Final Year Project
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition">
            Sign In
          </Link>
          <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center relative flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Job Recommendation & Skill Gap System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Bridge Your <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Career Skill Gap</span> With Explainable AI
        </h1>

        <p className="text-lg text-slate-400 max-w-3xl mb-10 leading-relaxed">
          An intelligent academic final-year project designed to calculate candidate Readiness Scores, explain matching rationales, isolate skill deficiencies, and deliver personalized learning roadmaps.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 text-base">
            <span>Explore Demo System</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-2xl transition text-base">
            <span>Sign In to Demo Accounts</span>
          </Link>
        </div>

        {/* Demo Credentials Pill */}
        <div className="mt-12 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4">
          <span className="font-semibold text-slate-300">Quick Demo Accounts:</span>
          <span>Job Seeker: <strong className="text-blue-400">student@jobai.edu</strong> / <strong className="text-slate-300">student123</strong></span>
          <span>Admin: <strong className="text-emerald-400">admin@jobai.edu</strong> / <strong className="text-slate-300">admin123</strong></span>
        </div>
      </section>

      {/* Core Objectives Section */}
      <section className="py-16 px-6 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-12">Academic Objectives & System Innovations</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Explainable AI Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates clear, natural language explanations outlining why each job was recommended based on skill overlap, experience fit, and educational degree match.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Skill Gap Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Classifies skills into Matched vs Missing categories and calculates precise coverage percentages to highlight areas for career improvement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Career Readiness Score</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates a holistic 0–100 preparedness index categorized into Highly Ready, Ready, Developing, and Needs Improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-slate-800 text-center text-xs text-slate-500">
        Bachelor of Information Technology Final Year Project &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
