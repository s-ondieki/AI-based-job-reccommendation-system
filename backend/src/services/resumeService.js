const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractResumeProfile } = require('./aiProviderService');

const MIN_RESUME_TEXT_LENGTH = 40;

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

const normalizeResumeText = rawText => String(rawText || '').replace(/\s+/g, ' ').trim();

const validateResumeText = rawText => {
  const normalizedText = normalizeResumeText(rawText);
  const meaningfulCharacters = normalizedText.replace(/[^a-z0-9]/gi, '');
  if (normalizedText.length < MIN_RESUME_TEXT_LENGTH || meaningfulCharacters.length < 20) {
    throw new Error('No meaningful text could be extracted from the uploaded resume');
  }
  return normalizedText;
};

const extractStructuredProfile = async rawText => {
  const normalizedText = validateResumeText(rawText);
  const result = await extractResumeProfile(normalizedText);
  return {
    ...result.profile,
    extractionProvider: result.provider,
    source: 'ai',
    rawTextLength: normalizedText.length
  };
};

module.exports = {
  extractTextFromResume,
  normalizeResumeText,
  validateResumeText,
  extractStructuredProfile
};
