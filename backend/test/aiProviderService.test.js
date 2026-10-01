const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeExtraction } = require('../src/services/aiProviderService');

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