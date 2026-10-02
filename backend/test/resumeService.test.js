const test = require('node:test');
const assert = require('node:assert/strict');
const { validateResumeText } = require('../src/services/resumeService');

test('rejects resumes without meaningful extracted text', () => {
  assert.throws(() => validateResumeText('   ---   '), /meaningful text/);
});

test('normalizes meaningful extracted text without adding profile facts', () => {
  assert.equal(validateResumeText('Ada Lovelace\nPython and numerical analysis'), 'Ada Lovelace Python and numerical analysis');
});
