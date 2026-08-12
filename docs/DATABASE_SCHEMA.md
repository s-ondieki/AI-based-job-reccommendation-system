# MongoDB Database Schema Specification

Database Name: `job_recommendation_db`

---

## 1. Collections Overview

- `users`: User credentials, role (`seeker` / `admin`), and detailed career profile.
- `jobs`: Job listings created by admin or seed scripts.
- `skills`: Dictionary of standardized skills, categories, and alias synonyms.
- `learningresources`: Curated learning courses linked to specific skills.
- `applications`: Application status tracking (Saved, Applied, Interview, Offer, Rejected, Accepted).
- `roadmapitems`: User milestone progress tracking for skill gap acquisition.
- `recommendations`: Historical recommendation logs and AI score snapshots.

---

## 2. Model Schemas

### A. User Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'admin'], default: 'seeker' },
  phone: String,
  location: String,
  resumeUrl: String,
  profile: {
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      graduationYear: Number
    }],
    skills: [{
      name: String,
      category: String,
      proficiency: String, // Beginner, Intermediate, Advanced, Expert
      yearsOfExperience: Number
    }],
    experience: [{
      jobTitle: String,
      company: String,
      description: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean,
      skillsUsed: [String]
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date
    }],
    preferences: {
      desiredJobTitle: String,
      preferredIndustry: String,
      preferredLocation: String,
      employmentType: String,
      careerInterests: [String]
    }
  },
  createdAt: { type: Date, default: Date.now }
}
```

### B. Job Schema
```javascript
{
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'] },
  industry: { type: String, required: true },
  salaryRange: String,
  description: { type: String, required: true },
  responsibilities: [String],
  qualifications: [String],
  requiredSkills: [String],
  preferredSkills: [String],
  educationRequirements: String,
  experienceRequired: Number, // Years
  status: { type: String, enum: ['Active', 'Closed', 'Draft'], default: 'Active' },
  datePosted: { type: Date, default: Date.now },
  applicationDeadline: Date
}
```

### C. Skill Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'General' },
  aliases: [String], // Synonyms e.g., ["JS", "NodeJS"] -> "JavaScript"
  description: String
}
```

### D. LearningResource Schema
```javascript
{
  title: { type: String, required: true },
  provider: { type: String, required: true }, // Coursera, Udemy, edX, YouTube, Documentation
  skill: { type: String, required: true }, // Mapped skill
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  description: String,
  duration: String, // e.g. "6 hours"
  url: String,
  type: { type: String, enum: ['Course', 'Tutorial', 'Certification', 'Book'] },
  category: String
}
```

### E. Application Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  job: { type: ObjectId, ref: 'Job', required: true },
  status: { 
    type: String, 
    enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offered', 'Accepted'], 
    default: 'Saved' 
  },
  notes: String,
  appliedDate: Date,
  updatedAt: { type: Date, default: Date.now }
}
```
