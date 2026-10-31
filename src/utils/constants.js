export const APP_NAME = 'Circlo';

// Backend URLs (LOCAL / LIVE) are defined only in config/apiConfig.js

// Limits mirrored from the backend validators (the backend still enforces them)
export const LIMITS = {
  username: { min: 3, max: 50 },
  password: { min: 8, max: 72 },
  post: 5000,
  comment: 1000,
  url: 500,
  fullName: 100,
  bio: 500,
  location: 100,
  aiTopic: 200,
  aiImprove: 2000,
  announcement: 500,
};

export const PAGE_SIZE = 10;

// Values accepted by POST /api/ai/generate-post
export const AI_TONES = ['professional', 'casual', 'friendly', 'humorous', 'inspirational', 'informative'];
