const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRankings, fallbackExplanation } = require('../src/services/rankingService');

test('ranks jobs internally and explains from computed facts', () => {
  const user = { location: 'Remote', profile: { skills: [{ name: 'Node.js' }], experience: [{ years: 2 }] } };
  const jobs = [
    { _id: 'job-1', title: 'Backend Engineer', company: 'Acme', location: 'Remote', requiredSkills: ['Node.js', 'MongoDB'], experienceRequired: 1 },
    { _id: 'job-2', title: 'Data Analyst', company: 'Beta', location: 'On-site', requiredSkills: ['Python'], experienceRequired: 4 }
  ];
  const rankings = calculateRankings(user, jobs);
  assert.equal(rankings[0].jobId, 'job-1');
  assert.deepEqual(rankings[0].matchingSkills, ['Node.js']);
  assert.match(fallbackExplanation(jobs[0], rankings[0]).summary, /Backend Engineer/);
});