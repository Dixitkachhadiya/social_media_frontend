import api from './api';
import { AI_TIMEOUT } from '../utils/constants';

// Every AI request runs on the backend's Ollama model; the frontend never sees the model URL or any key
export const aiService = {
  status: () => api.get('/ai/status').then((res) => res.data),

  generatePost: ({ topic, tone, description, keywords }) =>
    api
      .post(
        '/ai/generate-post',
        { topic, ...(tone && { tone }), ...(description && { description }), ...(keywords?.length && { keywords }) },
        { timeout: AI_TIMEOUT },
      )
      .then((res) => res.data),
  // Without a tone the author's own tone is kept
  improvePost: (content, tone) =>
    api.post('/ai/improve-post', { content, ...(tone && { tone }) }, { timeout: AI_TIMEOUT }).then((res) => res.data),

  // POST /ai/summarize: { postId } summarizes a post's discussion; { content, length } summarizes text
  summarize: (postId) => api.post('/ai/summarize', { postId }, { timeout: AI_TIMEOUT }).then((res) => res.data),
  summarizeText: ({ content, length }) =>
    api.post('/ai/summarize', { content, length }, { timeout: AI_TIMEOUT }).then((res) => res.data),

  // The same check that runs when a post/comment is saved, with a suggested respectful version
  moderateContent: (content) => api.post('/ai/moderate-content', { content }, { timeout: AI_TIMEOUT }).then((res) => res.data),
};
