const { analyzeCvProfile } = require('./aiProviderService');
const { getSkillGapFromAI } = require('./aiClientService');

const getProfileSkillNames = profile => (profile?.skills || [])
  .map(skill => typeof skill === 'string' ? skill : skill?.name)
  .filter(Boolean);

const analyzeConfirmedCv = async ({ profile, jobs = [] }) => {
  const userSkills = getProfileSkillNames(profile);
  const requiredSkills = [...new Set(jobs.flatMap(job => job.requiredSkills || []))];
  const preferredSkills = [...new Set(jobs.flatMap(job => job.preferredSkills || []))];
  const deterministicSkillGap = await getSkillGapFromAI(userSkills, requiredSkills, preferredSkills);
  const result = await analyzeCvProfile({ profile, deterministicSkillGap });

  return {
    provider: result.provider,
    analysis: {
      ...result.analysis,
      skillGaps: {
        ...result.analysis.skillGaps,
        matchedSkills: deterministicSkillGap.matchingSkills,
        partiallyMatchedSkills: deterministicSkillGap.partiallyMatchingSkills,
        missingSkills: deterministicSkillGap.missingSkills.map(skill => ({
          skill,
          priority: 'unprioritized',
          explanation: result.analysis.skillGaps.missingSkills.find(item => item.skill.toLowerCase() === skill.toLowerCase())?.explanation || ''
        }))
      },
      deterministicSkillGap
    }
  };
};

module.exports = { analyzeConfirmedCv };
