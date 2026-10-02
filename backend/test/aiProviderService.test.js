const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const {
  normalizeExtraction,
  normalizeCvAnalysis,
  requestOpenAI,
  requestWithFallback,
  extractResumeProfile,
  getProviderStatus
} = require('../src/services/aiProviderService');

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

test('reports OpenAI missing-key configuration without exposing a secret', async () => {
  const previous = { enabled: process.env.OPENAI_ENABLED, key: process.env.OPENAI_API_KEY };
  process.env.OPENAI_ENABLED = 'true';
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(() => requestOpenAI('resume text'), /OpenAI API key is missing/);
  assert.deepEqual(getProviderStatus().openai, { configured: false, enabled: true, model: 'gpt-4.1-mini' });
  if (previous.enabled === undefined) delete process.env.OPENAI_ENABLED; else process.env.OPENAI_ENABLED = previous.enabled;
  if (previous.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.key;
});

test('sends extracted resume text to OpenAI and returns structured profile data', async () => {
  const previous = { enabled: process.env.OPENAI_ENABLED, key: process.env.OPENAI_API_KEY };
  const originalPost = axios.post;
  process.env.OPENAI_ENABLED = 'true';
  process.env.OPENAI_API_KEY = 'test-key';
  axios.post = async (url, body) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.match(body.input[1].content, /Ada Lovelace/);
    return { data: { output_text: JSON.stringify({ candidate: { name: 'Ada Lovelace', skills: [] } }) } };
  };
  const result = await extractResumeProfile('Ada Lovelace resume text');
  assert.equal(result.provider, 'openai');
  assert.equal(result.profile.name, 'Ada Lovelace');
  axios.post = originalPost;
  if (previous.enabled === undefined) delete process.env.OPENAI_ENABLED; else process.env.OPENAI_ENABLED = previous.enabled;
  if (previous.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.key;
});

test('rejects malformed structured OpenAI output', async () => {
  const previous = { enabled: process.env.OPENAI_ENABLED, key: process.env.OPENAI_API_KEY };
  const originalPost = axios.post;
  process.env.OPENAI_ENABLED = 'true';
  process.env.OPENAI_API_KEY = 'test-key';
  axios.post = async () => ({ data: { output_text: 'not-json' } });
  await assert.rejects(() => extractResumeProfile('Ada Lovelace resume text'), /Malformed structured AI response/);
  axios.post = originalPost;
  if (previous.enabled === undefined) delete process.env.OPENAI_ENABLED; else process.env.OPENAI_ENABLED = previous.enabled;
  if (previous.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.key;
});

test('falls back from OpenAI to Gemini when OpenAI fails', async () => {
  const previous = {
    enabled: process.env.OPENAI_ENABLED,
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY
  };
  const originalPost = axios.post;
  process.env.OPENAI_ENABLED = 'true';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  axios.post = async url => {
    if (url.includes('openai.com')) throw new Error('provider unavailable');
    return { data: { candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] } };
  };
  const result = await requestWithFallback('resume text');
  assert.equal(result.provider, 'gemini');
  axios.post = originalPost;
  if (previous.enabled === undefined) delete process.env.OPENAI_ENABLED; else process.env.OPENAI_ENABLED = previous.enabled;
  if (previous.openai === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.openai;
  if (previous.gemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous.gemini;
});

test('reports all providers unavailable without sensitive values', async () => {
  const previous = {
    enabled: process.env.OPENAI_ENABLED,
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    grok: process.env.GROK_API_KEY
  };
  process.env.OPENAI_ENABLED = 'true';
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROK_API_KEY;
  await assert.rejects(() => requestWithFallback('resume text'), error => {
    assert.match(error.message, /All AI providers failed/);
    assert.doesNotMatch(error.message, /test-|sk-/);
    return true;
  });
  if (previous.enabled === undefined) delete process.env.OPENAI_ENABLED; else process.env.OPENAI_ENABLED = previous.enabled;
  if (previous.openai === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.openai;
  if (previous.gemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous.gemini;
  if (previous.grok === undefined) delete process.env.GROK_API_KEY; else process.env.GROK_API_KEY = previous.grok;
});