const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    role: { type: String, enum: ['seeker', 'admin'], default: 'seeker' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    profile: {
      education: [
        {
          institution: { type: String, default: '' },
          degree: { type: String, default: '' },
          fieldOfStudy: { type: String, default: '' },
          graduationYear: { type: Number }
        }
      ],
      skills: [
        {
          name: { type: String, required: true },
          category: { type: String, default: 'General' },
          proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
          yearsOfExperience: { type: Number, default: 1 }
        }
      ],
      experience: [
        {
          jobTitle: { type: String, default: '' },
          company: { type: String, default: '' },
          description: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          isCurrent: { type: Boolean, default: false },
          skillsUsed: [{ type: String }],
          years: { type: Number, default: 1 }
        }
      ],
      certifications: [
        {
          name: { type: String, default: '' },
          issuingOrganization: { type: String, default: '' },
          date: { type: String, default: '' }
        }
      ],
      preferences: {
        desiredJobTitle: { type: String, default: '' },
        preferredIndustry: { type: String, default: '' },
        preferredLocation: { type: String, default: '' },
        employmentType: { type: String, default: 'Full-time' },
        careerInterests: [{ type: String }]
      }
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
