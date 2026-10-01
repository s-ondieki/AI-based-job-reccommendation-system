const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Skill = require('../models/Skill');
const { extractResumeProfile } = require('./aiProviderService');

const extractTextFromResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text || '';
  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }
  
  throw new Error('Unsupported file extension for text extraction');
};

const parseSkillsAndProfileFromText = async (rawText) => {
  const lowerText = rawText.toLowerCase();
  
  const allSkills = await Skill.find({});
  const detectedSkills = [];

  for (const skillDoc of allSkills) {
    const skillName = skillDoc.name;
    const aliases = [skillDoc.name, ...(skillDoc.aliases || [])];
    
    let matched = false;
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(rawText)) {
        matched = true;
        break;
      }
    }
    
    if (matched) {
      detectedSkills.push({
        name: skillName,
        category: skillDoc.category || 'General',
        proficiency: 'Intermediate',
        yearsOfExperience: 1
      });
    }
  }

  const detectedEducation = [];
  if (/bachelor|bsc|b\.s\.|b\.tech/i.test(lowerText)) {
    detectedEducation.push({
      institution: 'University',
      degree: 'BSc Information Technology',
      fieldOfStudy: 'Information Technology',
      graduationYear: 2024
    });
  } else if (/diploma/i.test(lowerText)) {
    detectedEducation.push({
      institution: 'Polytechnic Institute',
      degree: 'Diploma in IT',
      fieldOfStudy: 'Computer Studies',
      graduationYear: 2023
    });
  }

  let estimatedExpYears = 1;
  const expMatch = lowerText.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/i);
  if (expMatch && expMatch[1]) {
    estimatedExpYears = parseInt(expMatch[1], 10) || 1;
  }

  const detectedExperience = [
    {
      jobTitle: 'IT Associate',
      company: 'Extracted Experience',
      description: 'Extracted automatically from uploaded resume.',
      years: estimatedExpYears
    }
  ];

  return {
    rawTextLength: rawText.length,
    extractedSkills: detectedSkills,
    extractedEducation: detectedEducation,
    extractedExperience: detectedExperience,
    estimatedYearsOfExperience: estimatedExpYears
  };
};

const extractStructuredProfile = async rawText => {
  try {
    const result = await extractResumeProfile(rawText);
    return { ...result.profile, extractionProvider: result.provider, source: 'ai' };
  } catch (error) {
    console.warn(`[Resume Extraction Warning] ${error.message}. Using local parser.`);
    const fallback = await parseSkillsAndProfileFromText(rawText);
    return {
      name: '',
      education: fallback.extractedEducation || [],
      skills: fallback.extractedSkills || [],
      experience: fallback.extractedExperience || [],
      certifications: [],
      interests: [],
      extractionProvider: 'local-fallback',
      source: 'local'
    };
  }
};

module.exports = {
  extractTextFromResume,
  parseSkillsAndProfileFromText,
  extractStructuredProfile
};
