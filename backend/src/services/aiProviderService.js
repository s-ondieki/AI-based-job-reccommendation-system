const axios = require('axios');

const DEFAULT_TIMEOUT_MS = 12000;
const extractionSchema = {
  candidate: {
    name: null,
    email: null,
    phone: null,
    location: null,
    professionalSummary: null,
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: []
  }
};

const asString = value => typeof value === 'string' ? value.trim() : '';
const asNullableString = value => {
  const normalized = asString(value);
  return normalized || null;
};
const asArray = value => Array.isArray(value) ? value : [];

const parseJsonResponse = content => {
  const text = asString(content).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error('Malformed structured AI response');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI provider returned a non-object JSON response');
  }
  return parsed;
};

const normalizeExtraction = data => {
  const candidate = data?.candidate && typeof data.candidate === 'object' ? data.candidate : data || {};
  const normalized = {
  name: asNullableString(candidate.name),
  email: asNullableString(candidate.email),
  phone: asNullableString(candidate.phone),
  location: asNullableString(candidate.location),
  professionalSummary: asNullableString(candidate.professionalSummary),
  education: asArray(candidate.education).map(item => ({
    institution: asString(item?.institution),
    degree: asString(item?.degree),
    fieldOfStudy: asString(item?.fieldOfStudy),
    graduationYear: Number.isInteger(item?.graduationYear) ? item.graduationYear : undefined
  })).filter(item => item.institution || item.degree || item.fieldOfStudy),
  skills: asArray(candidate.skills).map(item => ({
    name: asString(typeof item === 'string' ? item : item?.name),
    category: asString(item?.category) || 'General',
    proficiency: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(item?.proficiency) ? item.proficiency : null,
    yearsOfExperience: Number.isFinite(item?.yearsOfExperience) ? Math.max(0, item.yearsOfExperience) : null
  })).filter(item => item.name),
  experience: asArray(candidate.experience).map(item => ({
    jobTitle: asString(item?.jobTitle),
    company: asString(item?.company),
    description: asString(item?.description),
    startDate: asString(item?.startDate),
    endDate: asString(item?.endDate),
    isCurrent: item?.isCurrent === true,
    skillsUsed: asArray(item?.skillsUsed).map(asString).filter(Boolean),
    years: Number.isFinite(item?.years) ? Math.max(0, item.years) : null
  })).filter(item => item.jobTitle || item.company || item.description),
  projects: asArray(candidate.projects).map(item => ({
    name: asNullableString(typeof item === 'string' ? item : item?.name),
    description: asNullableString(item?.description),
    technologies: asArray(item?.technologies).map(asString).filter(Boolean),
    url: asNullableString(item?.url)
  })).filter(item => item.name || item.description),
  certifications: asArray(candidate.certifications).map(item => ({
    name: asString(typeof item === 'string' ? item : item?.name),
    issuingOrganization: asString(item?.issuingOrganization),
    date: asString(item?.date)
  })).filter(item => item.name),
  interests: asArray(candidate.interests).map(asString).filter(Boolean),
  languages: asArray(candidate.languages).map(asString).filter(Boolean)
  };
  return normalized;
};

const getProviderStatus = () => ({
  openai: {
    configured: Boolean(process.env.OPENAI_API_KEY),
    enabled: process.env.OPENAI_ENABLED === 'true',
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  },
  gemini: {
    configured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  },
  grok: {
    configured: Boolean(process.env.GROK_API_KEY),
    model: process.env.GROK_MODEL || 'grok-3-mini'
  }
});

const logProviderStatus = () => {
  const status = getProviderStatus();
  console.log('[AI Providers]');
  console.log(`- OpenAI: ${status.openai.configured && status.openai.enabled ? 'configured' : status.openai.enabled ? 'enabled but API key missing' : 'not configured'}`);
  console.log(`- Gemini: ${status.gemini.configured ? 'configured' : 'not configured'}`);
  console.log(`- Grok: ${status.grok.configured ? 'configured' : 'not configured'}`);
};

const requestGemini = async prompt => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await axios.post(url, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' }
  }, { params: { key }, timeout: Number(process.env.AI_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS });
  return response.data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
};

const requestGrok = async prompt => {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error('GROK_API_KEY is not configured');
  const response = await axios.post(process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions', {
    model: process.env.GROK_MODEL || 'grok-3-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return only valid JSON. Do not invent facts.' },
      { role: 'user', content: prompt }
    ]
  }, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    timeout: Number(process.env.AI_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
  });
  return response.data?.choices?.[0]?.message?.content || '';
};

const requestOpenAI = async prompt => {
  const key = process.env.OPENAI_API_KEY;
  if (process.env.OPENAI_ENABLED !== 'true') throw new Error('OpenAI provider is disabled (set OPENAI_ENABLED=true)');
  if (!key) throw new Error('OpenAI API key is missing (set OPENAI_API_KEY)');

  let response;
  try {
    response = await axios.post('https://api.openai.com/v1/responses', {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
      { role: 'system', content: 'Return only valid JSON. Use only facts present in the supplied data. Never invent missing candidate information.' },
      { role: 'user', content: prompt }
    ],
    text: { format: { type: 'json_object' } }
    }, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: Number(process.env.AI_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
    });
  } catch (error) {
    const status = error.response?.status;
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') throw new Error('OpenAI request timed out');
    if (status === 401) throw new Error('OpenAI API key was rejected');
    if (status === 429) throw new Error('OpenAI rate limit reached');
    throw new Error(`OpenAI API request failed${status ? ` with status ${status}` : ''}`);
  }

  const outputText = response.data?.output_text;
  if (outputText) return outputText;

  return response.data?.output
    ?.flatMap(item => item.content || [])
    ?.map(item => item.text || '')
    ?.join('') || '';
};

const requestWithFallback = async prompt => {
  const providers = [
    ['openai', requestOpenAI],
    ['gemini', requestGemini],
    ['grok', requestGrok]
  ];
  const errors = [];
  for (const [name, request] of providers) {
    try {
      const content = await request(prompt);
      return { provider: name, content };
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
      console.warn(`[AI Provider Warning] ${errors.at(-1)}`);
    }
  }
  throw new Error(`All AI providers failed (${errors.join('; ')})`);
};

const extractResumeProfile = async rawText => {
  const prompt = `Extract only facts explicitly present in the resume text below. Never infer, guess, or add placeholders. Return exactly one JSON object matching this shape: ${JSON.stringify(extractionSchema)}. Use null for missing scalar values and empty arrays for missing collections. Do not include markdown or extra keys.\n\nRESUME TEXT:\n${rawText}`;
  const result = await requestWithFallback(prompt);
  const profile = normalizeExtraction(parseJsonResponse(result.content));
  return { provider: result.provider, profile: { ...profile, candidate: profile } };
};

const explainRecommendation = async ({ profile, job, ranking }) => {
  const prompt = `Explain this recommendation using only the supplied profile, job, and computed ranking. Do not change the ranking, invent qualifications, or mention facts absent from the inputs. Return exactly JSON with keys summary (string), keyReasons (array of strings), matchingSkills (array of strings), missingSkills (array of strings), learningResources (array of objects with title, provider, skill, url).\n\nPROFILE:\n${JSON.stringify(profile)}\n\nJOB:\n${JSON.stringify(job)}\n\nCOMPUTED RANKING:\n${JSON.stringify(ranking)}`;
  const result = await requestWithFallback(prompt);
  const parsed = parseJsonResponse(result.content);
    return { 
      provider: result.provider, 
      explanation: { 
        summary: asString(parsed.summary), 
        keyReasons: asArray(parsed.keyReasons).map(asString).filter(Boolean), 
        matchingSkills: asArray(parsed.matchingSkills).map(asString).filter(Boolean), 
        missingSkills: asArray(parsed.missingSkills).map(asString).filter(Boolean), 
        learningResources: asArray(parsed.learningResources).map(item => ({ 
          title: asString(item?.title), provider: asString(item?.provider), skill: asString(item?.skill), url: asString(item?.url) 
        })).filter(item => item.title && item.skill) 
      } 
    }; 
  }; 

const normalizeCvAnalysis = data => ({ 
  candidate: normalizeExtraction(data.candidate || data.profile || {}), 
  cvQuality: { 
    strengths: asArray(data.cvQuality?.strengths).map(asString).filter(Boolean), 
    weaknesses: asArray(data.cvQuality?.weaknesses).map(asString).filter(Boolean), 
    missingSections: asArray(data.cvQuality?.missingSections).map(asString).filter(Boolean), 
    grammarAndContentIssues: asArray(data.cvQuality?.grammarAndContentIssues).map(asString).filter(Boolean), 
    formattingAndAtsIssues: asArray(data.cvQuality?.formattingAndAtsIssues).map(asString).filter(Boolean), 
    keywordIssues: asArray(data.cvQuality?.keywordIssues).map(asString).filter(Boolean), 
    vagueDescriptions: asArray(data.cvQuality?.vagueDescriptions).map(asString).filter(Boolean), 
    measurableAchievementGaps: asArray(data.cvQuality?.measurableAchievementGaps).map(asString).filter(Boolean), 
    inconsistencies: asArray(data.cvQuality?.inconsistencies).map(asString).filter(Boolean) 
  }, 
  careerRoles: asArray(data.careerRoles).map(role => ({ 
    title: asString(role?.title), 
    rationale: asString(role?.rationale), 
    evidence: asArray(role?.evidence).map(asString).filter(Boolean) 
  })).filter(role => role.title), 
  skillGaps: { 
    matchedSkills: asArray(data.skillGaps?.matchedSkills).map(asString).filter(Boolean), 
    partiallyMatchedSkills: asArray(data.skillGaps?.partiallyMatchedSkills).map(asString).filter(Boolean), 
    missingSkills: asArray(data.skillGaps?.missingSkills).map(item => ({ 
      skill: asString(typeof item === 'string' ? item : item?.skill), 
      priority: asString(item?.priority), 
      explanation: asString(item?.explanation) 
    })).filter(item => item.skill) 
  }, 
  learningRecommendations: asArray(data.learningRecommendations).map(item => ({ 
    skill: asString(item?.skill), 
    topics: asArray(item?.topics).map(asString).filter(Boolean), 
    tools: asArray(item?.tools).map(asString).filter(Boolean), 
    technologies: asArray(item?.technologies).map(asString).filter(Boolean), 
    certifications: asArray(item?.certifications).map(asString).filter(Boolean), 
    sequence: Number.isInteger(item?.sequence) ? item.sequence : null, 
    rationale: asString(item?.rationale) 
  })).filter(item => item.skill) 
}); 

const analyzeCvProfile = async ({ profile, deterministicSkillGap = null }) => { 
  const prompt = `Analyze the confirmed candidate profile below. Use only facts present in the profile. Do not infer a degree, employer, title, skill, experience, interest, or certification. Return exactly one JSON object with keys candidate, cvQuality, careerRoles, skillGaps, learningRecommendations. candidate must preserve the supplied structured profile. cvQuality must contain arrays named strengths, weaknesses, missingSections, grammarAndContentIssues, formattingAndAtsIssues, keywordIssues, vagueDescriptions, measurableAchievementGaps, inconsistencies. careerRoles must be an array of {title, rationale, evidence}. skillGaps must contain matchedSkills, partiallyMatchedSkills, and missingSkills, where missingSkills contains {skill, priority, explanation}. learningRecommendations must contain {skill, topics, tools, technologies, certifications, sequence, rationale}. Do not claim that a job or certification is mandatory. The deterministic skill gap, when supplied, is authoritative for mathematical coverage and its skill lists.`; 
  const result = await requestWithFallback(prompt); 
  return { provider: result.provider, analysis: normalizeCvAnalysis(parseJsonResponse(result.content)) }; 
}; 

module.exports = {
  extractionSchema,
  normalizeExtraction,
  normalizeCvAnalysis,
  getProviderStatus,
  logProviderStatus,
  extractResumeProfile,
  analyzeCvProfile,
  explainRecommendation,
  requestWithFallback,
  requestOpenAI
};