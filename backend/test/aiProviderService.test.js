const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeExtraction, normalizeCvAnalysis } = require('../src/services/aiProviderService');

test('normalizes structured extraction and removes unsupported values', () => {
  const profile = normalizeExtraction({
    name: 'Ada Lovelace',
    skills: [{ name: 'JavaScript', proficiency: 'Expert', yearsOfExperience: 4 }],
    education: [{ degree: 'BSc', institution: 'University', graduationYear: 2024 }],
    unexpected: 'ignored'
  });
  assert.equal(profile.name, 'Ada Lovelace');
  assert.equal(profile.skills[0].name, 'JavaScript');
  assert.equal(profile.education[0].graduationYear, 2024);
  assert.equal(profile.experience.length, 0);
});

test('normalizes CV analysis without inventing missing sections', () => {
  const analysis = normalizeCvAnalysis({
    candidate: { name: 'Ada Lovelace' },
    cvQuality: { strengths: ['Clear project history'] },
    careerRoles: [{ title: 'Data Analyst', rationale: 'Uses supplied skills' }],
    skillGaps: { missingSkills: [{ skill: 'SQL', priority: 'high' }] },
    learningRecommendations: [{ skill: 'SQL', sequence: 1 }]
  });
  assert.equal(analysis.candidate.name, 'Ada Lovelace');
  assert.deepEqual(analysis.cvQuality.weaknesses, []);
  assert.equal(analysis.skillGaps.missingSkills[0].skill, 'SQL');
});