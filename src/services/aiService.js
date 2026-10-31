import api from './api';

// AI calls can take a while on the provider side; the backend has its own timeout (504)
const AI_TIMEOUT = 60000;

export const aiService = {
  generatePost: ({ topic, tone }) =>
    api.post('/ai/generate-post', { topic, ...(tone && { tone }) }, { timeout: AI_TIMEOUT }).then((res) => res.data),
  improvePost: (content) => api.post('/ai/improve-post', { content }, { timeout: AI_TIMEOUT }).then((res) => res.data),

  // POST /ai/summarize: { postId } summarizes a post's discussion; { content, length } summarizes text
  summarize: (postId) => api.post('/ai/summarize', { postId }, { timeout: AI_TIMEOUT }).then((res) => res.data),
  summarizeText: ({ content, length }) =>
    api.post('/ai/summarize', { content, length }, { timeout: AI_TIMEOUT }).then((res) => res.data),

  // Content check on the server's LOCAL moderation model (the same check runs when posts/comments are saved)
  moderateContent: (content) => api.post('/ai/moderate-content', { content }).then((res) => res.data),
};
