import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { User, Plus, Trash2, Save, GraduationCap, Briefcase, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfileState } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [preferences, setPreferences] = useState({
    desiredJobTitle: '',
    preferredIndustry: '',
    preferredLocation: '',
    employmentType: 'Full-time',
    careerInterests: []
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setEducation(user.profile?.education || []);
      setSkills(user.profile?.skills || []);
      setExperience(user.profile?.experience || []);
      setCertifications(user.profile?.certifications || []);
      setPreferences(user.profile?.preferences || {
        desiredJobTitle: 'Software Developer',
        preferredIndustry: 'Information Technology',
        preferredLocation: 'Nairobi, Kenya',
        employmentType: 'Full-time',
        careerInterests: ['Software Engineering']
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name,
        phone,
        location,
        profile: {
          education,
          skills,
          experience,
          certifications,
          preferences
        }
      };

      const res = await API.put('/users/profile', payload);
      if (res.data.success) {
        updateUserProfileState(res.data.user);
        setMessage('Profile updated successfully! AI recommendation scores will update.');
      }
    } catch (err) {
      setMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: 'BSc Information Technology', fieldOfStudy: '', graduationYear: 2026 }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };
  const updateEducation = (index, field, val) => {
    const updated = [...education];
    updated[index][field] = val;
    setEducation(updated);
  };

  // Skill Helpers
  const addSkill = () => {
    setSkills([...skills, { name: '', category: 'General', proficiency: 'Intermediate', yearsOfExperience: 1 }]);
  };
  const removeSkill = (index) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };
  const updateSkill = (index, field, val) => {
    const updated = [...skills];
    updated[index][field] = val;
    setSkills(updated);
  };

  // Experience Helpers
  const addExperience = () => {
    setExperience([...experience, { jobTitle: '', company: '', description: '', years: 1 }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };
  const updateExperience = (index, field, val) => {
    const updated = [...experience];
    updated[index][field] = val;
    setExperience(updated);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Manage Your Candidate Profile</h1>
          <p className="text-xs text-slate-400">Keep your qualifications and skills up to date to receive optimal AI recommendations.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Personal Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200"
              placeholder="+254 700 000 000"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Current Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-200"
              placeholder="Nairobi, Kenya"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Technical & Soft Skills ({skills.length})</span>
          </h2>
          <button
            type="button"
            onClick={addSkill}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {skills.map((skill, idx) => (
            <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                placeholder="e.g. JavaScript, Python, Docker"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
              <select
                value={skill.proficiency || 'Intermediate'}
                onChange={(e) => updateSkill(idx, 'proficiency', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={() => removeSkill(idx)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Educational Qualifications</span>
          </h2>
          <button
            type="button"
            onClick={addEducation}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>

        {education.map((edu, idx) => (
          <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs relative">
            <button
              type="button"
              onClick={() => removeEducation(idx)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                  placeholder="University of Nairobi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Degree Title</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  placeholder="BSc Information Technology"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={edu.graduationYear || 2026}
                  onChange={(e) => updateEducation(idx, 'graduationYear', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Work Experience</span>
          </h2>
          <button
            type="button"
            onClick={addExperience}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        {experience.map((exp, idx) => (
          <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs relative">
            <button
              type="button"
              onClick={() => removeExperience(idx)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Job Title</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => updateExperience(idx, 'jobTitle', e.target.value)}
                  placeholder="Junior Software Developer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  placeholder="Tech Solutions Ltd"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Years of Experience</label>
                <input
                  type="number"
                  step="0.5"
                  value={exp.years || 1}
                  onChange={(e) => updateExperience(idx, 'years', parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Career Preferences</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Desired Job Title</label>
            <input
              type="text"
              value={preferences.desiredJobTitle}
              onChange={(e) => setPreferences({ ...preferences, desiredJobTitle: e.target.value })}
              placeholder="Junior Full Stack Developer"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Preferred Industry</label>
            <input
              type="text"
              value={preferences.preferredIndustry}
              onChange={(e) => setPreferences({ ...preferences, preferredIndustry: e.target.value })}
              placeholder="Software Engineering"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Preferred Location</label>
            <input
              type="text"
              value={preferences.preferredLocation}
              onChange={(e) => setPreferences({ ...preferences, preferredLocation: e.target.value })}
              placeholder="Nairobi, Kenya"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
