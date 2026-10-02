import React, { useState, useContext } from 'react';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';

export default function ResumeUploadPage() {
  const { user, updateUserProfileState } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingExtracted, setSavingExtracted] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [editableProfile, setEditableProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['.pdf', '.docx', '.doc'];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(ext)) {
        setError('Invalid file format. Please upload a PDF or DOCX file.');
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('The resume must be 10 MB or smaller.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await API.post('/users/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        if (res.data.parsedData) {
          setParsedResult(res.data.parsedData);
          setEditableProfile(res.data.parsedData);
          setIsModalOpen(true);
        } else {
          setError('Resume text was extracted, but no structured profile was returned.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing resume file.');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyExtractedToProfile = async () => {
    if (!parsedResult) return;
    setSavingExtracted(true);
    try {
      const currentSkills = user?.profile?.skills || [];
      const newSkills = editableProfile?.skills || [];

      const existingSkillNames = new Set(currentSkills.map(s => s.name.toLowerCase()));
      const combinedSkills = [...currentSkills];

      newSkills.forEach(s => {
        if (!existingSkillNames.has(s.name.toLowerCase())) {
          combinedSkills.push(s);
        }
      });

      const updatedProfile = {
        ...user.profile,
        skills: combinedSkills,
        education: user?.profile?.education?.length ? user.profile.education : editableProfile?.education,
        experience: editableProfile?.experience || user?.profile?.experience || [],
        certifications: editableProfile?.certifications || user?.profile?.certifications || [],
        preferences: {
          ...user?.profile?.preferences,
          careerInterests: editableProfile?.interests || user?.profile?.preferences?.careerInterests || []
        }
      };

      const res = await API.put('/users/profile', {
        name: editableProfile?.name || undefined,
        profile: updatedProfile
      });
      if (res.data.success) {
        updateUserProfileState(res.data.user);
        setIsModalOpen(false);
        setSavedSuccessMsg('Profile confirmed. Starting comprehensive CV analysis...');
        setAnalyzing(true);
        try {
          const analysisResponse = await API.post('/users/cv-analysis');
          if (analysisResponse.data.success) {
            setAnalysis(analysisResponse.data.analysis);
            setSavedSuccessMsg('Profile confirmed and CV analysis completed.');
          }
        } catch (analysisError) {
          setError(analysisError.response?.data?.message || 'Profile saved, but CV analysis could not be completed.');
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (err) {
      setError('Failed to apply extracted skills to profile.');
    } finally {
      setSavingExtracted(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Upload & Parse CV / Resume</h1>
        <p className="text-xs text-slate-400">Our text parsing engine extracts education, skills, and experience for AI job matching verification.</p>
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div className="bg-slate-900 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-3xl p-10 text-center transition">
        <form onSubmit={handleUpload} className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-200">Select PDF or DOCX Resume File</h3>
            <p className="text-xs text-slate-500 mt-1">Maximum file size: 10MB</p>
          </div>

          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file-input"
          />

          <label
            htmlFor="resume-file-input"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition"
          >
            Choose File
          </label>

          {file && (
            <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 mt-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{file.name}</span>
              <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-40 flex items-center space-x-2 mt-4"
          >
            <span>{uploading ? 'Extracting resume text...' : 'Upload & Extract'}</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review & Confirm Extracted Resume Entities"
      >
        <div className="space-y-6 text-xs">
          <p className="text-slate-300">
            These details were extracted and structured from your resume. Review and correct them before confirming; comprehensive CV analysis has not run yet.
          </p>

          <div>
            <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Detected Technical & Soft Skills ({editableProfile?.skills?.length || 0})</span>
            </h4>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
              {editableProfile?.skills?.map((s, idx) => (
                <input
                  key={idx}
                  value={s.name}
                  onChange={(e) => setEditableProfile({ ...editableProfile, skills: editableProfile.skills.map((skill, skillIndex) => skillIndex === idx ? { ...skill, name: e.target.value } : skill) })}
                  className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-2">Detected Education</h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-1">
              {editableProfile?.education?.map((edu, idx) => (
                <div key={idx}>
                  <input
                    value={edu.degree}
                    onChange={(e) => setEditableProfile({ ...editableProfile, education: editableProfile.education.map((item, itemIndex) => itemIndex === idx ? { ...item, degree: e.target.value } : item) })}
                    className="w-48 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                  />
                  <span> - {edu.institution} ({edu.graduationYear || 'year not provided'})</span>
                </div>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="font-bold text-slate-200">Name</span>
            <input
              value={editableProfile?.name || ''}
              onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
              className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
            />
          </label>

          <div>
            <h4 className="font-bold text-slate-200 mb-2">Experience</h4>
            <div className="space-y-2">
              {editableProfile?.experience?.map((item, idx) => (
                <input
                  key={idx}
                  value={`${item.jobTitle}${item.company ? ` - ${item.company}` : ''}`}
                  onChange={(e) => setEditableProfile({ ...editableProfile, experience: editableProfile.experience.map((experience, experienceIndex) => experienceIndex === idx ? { ...experience, jobTitle: e.target.value } : experience) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="font-bold text-slate-200">Certifications</span>
            <input
              value={(editableProfile?.certifications || []).map(certification => certification.name).join(', ')}
              onChange={(e) => setEditableProfile({ ...editableProfile, certifications: e.target.value.split(',').map(name => ({ name: name.trim() })).filter(certification => certification.name) })}
              className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
            />
          </label>

          <label className="block">
            <span className="font-bold text-slate-200">Interests</span>
            <input
              value={(editableProfile?.interests || []).join(', ')}
              onChange={(e) => setEditableProfile({ ...editableProfile, interests: e.target.value.split(',').map(interest => interest.trim()).filter(Boolean) })}
              className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
            />
          </label>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyExtractedToProfile}
              disabled={savingExtracted}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-600/30 flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingExtracted ? 'Applying...' : 'Approve & Save to Profile'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {analyzing && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
          The confirmed profile is being analyzed for CV quality, career roles, skill gaps, and learning recommendations.
        </div>
      )}

      {analysis && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100">CV Analysis Results</h2>
            <p className="text-xs text-slate-400 mt-1">These findings are based on your confirmed profile and existing job requirements.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 text-xs">
            <div>
              <h3 className="font-bold text-slate-200 mb-2">Strengths</h3>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                {analysis.cvQuality?.strengths?.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-200 mb-2">Priority Skill Gaps</h3>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                {analysis.skillGaps?.missingSkills?.map(item => <li key={item.skill}>{item.skill}</li>)}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 mb-2">Suggested Career Roles</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.careerRoles?.map(role => <span key={role.title} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">{role.title}</span>)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
