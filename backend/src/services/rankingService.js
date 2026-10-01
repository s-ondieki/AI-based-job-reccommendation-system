const normalize = value => String(value || '').trim().toLowerCase();

const calculateRankings = (user, jobs, weights = {}) => {
  const profile = user.profile || {};
  const actualWeights = {
    skillWeight: 0.40, experienceWeight: 0.20, educationWeight: 0.15,
    interestWeight: 0.10, locationWeight: 0.10, certWeight: 0.05, ...weights
  };
  const userSkills = (profile.skills || []).map(skill => normalize(skill.name));
  const userExperience = (profile.experience || []).reduce((total, item) => total + (Number(item.years) || 0), 0);
  const educationText = (profile.education || []).map(item => `${item.degree} ${item.fieldOfStudy}`).join(' ').toLowerCase();
  const interests = (profile.preferences?.careerInterests || []).map(normalize);
  const certifications = (profile.certifications || []).map(item => normalize(item.name));
  const preferredLocation = normalize(profile.preferences?.preferredLocation || user.location);

  return jobs.map(job => {
    const required = job.requiredSkills || [];
    const matchingSkills = required.filter(skill => userSkills.includes(normalize(skill)));
    const missingSkills = required.filter(skill => !userSkills.includes(normalize(skill)));
    const skillScore = required.length ? matchingSkills.length / required.length * 100 : 100;
    const experienceScore = userExperience >= (job.experienceRequired || 0) ? 100 : Math.max(0, 100 - ((job.experienceRequired || 0) - userExperience) * 25);
    const educationScore = !job.educationRequirements || educationText.includes(normalize(job.educationRequirements)) ? 100 : (profile.education?.length ? 60 : 25);
    const interestScore = interests.some(interest => normalize(job.industry).includes(interest) || normalize(job.title).includes(interest)) ? 100 : 60;
    const locationScore = !preferredLocation || normalize(job.location).includes(preferredLocation) || normalize(job.employmentType) === 'remote' ? 100 : 50;
    const certScore = !certifications.length ? 50 : Math.min(100, certifications.length * 50);
    const matchPercentage = Math.round((actualWeights.skillWeight * skillScore) + (actualWeights.experienceWeight * experienceScore) + (actualWeights.educationWeight * educationScore) + (actualWeights.interestWeight * interestScore) + (actualWeights.locationWeight * locationScore) + (actualWeights.certWeight * certScore));
    return {
      jobId: job._id.toString(), matchPercentage, overallScore: matchPercentage / 100,
      scores: { skillScore: Math.round(skillScore), experienceScore: Math.round(experienceScore), educationScore: Math.round(educationScore), interestScore: Math.round(interestScore), locationScore: Math.round(locationScore), certScore: Math.round(certScore) },
      matchingSkills, missingSkills
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
};

const fallbackExplanation = (job, ranking, resources = []) => ({
  summary: `${job.title} at ${job.company} scored ${ranking.matchPercentage}% using the system's weighted profile-to-job ranking.`,
  keyReasons: [`${ranking.matchingSkills.length} of ${job.requiredSkills.length} required skills match your profile.`, `The system scored experience, education, interests, location, and certifications using the configured weights.`],
  matchingSkills: ranking.matchingSkills,
  missingSkills: ranking.missingSkills,
  learningResources: resources
});

module.exports = { calculateRankings, fallbackExplanation };