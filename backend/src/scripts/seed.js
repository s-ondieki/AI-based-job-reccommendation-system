const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const LearningResource = require('../models/LearningResource');

const jobsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/jobs.json'), 'utf-8'));
const skillsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/skills.json'), 'utf-8'));
const learningData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/learning_resources.json'), 'utf-8'));

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_recommendation_db';
    console.log(`[Seed Script] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script] Clearing existing collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Skill.deleteMany({});
    await LearningResource.deleteMany({});

    console.log('[Seed Script] Creating Admin and Demo Seeker User Accounts...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@jobai.edu',
      password: 'admin123',
      role: 'admin',
      phone: '+254 700 000 000',
      location: 'Nairobi, Kenya'
    });

    const demoStudent = await User.create({
      name: 'Alex Kibet (Student Demo)',
      email: 'student@jobai.edu',
      password: 'student123',
      role: 'seeker',
      phone: '+254 712 345 678',
      location: 'Nairobi, Kenya',
      profile: {
        education: [
          {
            institution: 'University of Nairobi',
            degree: 'BSc Information Technology',
            fieldOfStudy: 'Software Engineering & AI',
            graduationYear: 2026
          }
        ],
        skills: [
          { name: 'JavaScript', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'React', category: 'Frontend Frameworks', proficiency: 'Advanced', yearsOfExperience: 2 },
          { name: 'Python', category: 'Programming Languages', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'HTML', category: 'Web Development', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'CSS', category: 'Web Development', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'Git', category: 'Tools & Version Control', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'SQL', category: 'Databases', proficiency: 'Intermediate', yearsOfExperience: 2 }
        ],
        experience: [
          {
            jobTitle: 'Junior Web Developer Intern',
            company: 'Tech Solutions Ltd',
            description: 'Assisted in building responsive user interface components using React and REST APIs.',
            startDate: '2025-01-01',
            endDate: '2025-06-30',
            isCurrent: false,
            skillsUsed: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
            years: 1.0
          }
        ],
        certifications: [
          {
            name: 'Meta Front-End Developer Certificate',
            issuingOrganization: 'Coursera / Meta',
            date: '2025-03-15'
          }
        ],
        preferences: {
          desiredJobTitle: 'Junior Full Stack Developer',
          preferredIndustry: 'Software Engineering',
          preferredLocation: 'Nairobi, Kenya',
          employmentType: 'Full-time',
          careerInterests: ['Full Stack Development', 'Software Engineering', 'AI Applications']
        }
      }
    });

    console.log(`[Seed Script] Seeding ${skillsData.length} skills into dictionary...`);
    await Skill.insertMany(skillsData);

    console.log(`[Seed Script] Seeding ${jobsData.length} realistic jobs into listings...`);
    await Job.insertMany(jobsData);

    console.log(`[Seed Script] Seeding ${learningData.length} learning resources...`);
    await LearningResource.insertMany(learningData);

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Administrator: admin@jobai.edu | Password: admin123');
    console.log('Demo Job Seeker: student@jobai.edu  | Password: student123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
