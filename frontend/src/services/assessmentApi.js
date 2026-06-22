// services/assessmentApi.js
import { apiRequest } from '../api.js';

export const assessmentAPI = {
  // ─── Public / User ───────────────────────────────────────────────

  /** Get all published assessments */
  getAll: () => apiRequest('/assessments', { method: 'GET' }),

  /** Get a single assessment by id */
  getOne: (id) => apiRequest(`/assessments/${id}`, { method: 'GET' }),

  /** Submit answers for an assessment */
  submit: (dto) =>
    apiRequest('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  /** Get the current user's attempt history */
  getMyAttempts: () => apiRequest('/assessments/attempts', { method: 'GET' }),

  // ─── Admin ───────────────────────────────────────────────────────

  /** Create a new assessment */
  create: (data) =>
    apiRequest('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Update an assessment */
  update: (id, data) =>
    apiRequest(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** Toggle published state */
  togglePublish: (id, isPublished) =>
    apiRequest(`/assessments/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),

  /** Delete an assessment */
  delete: (id) => apiRequest(`/assessments/${id}`, { method: 'DELETE' }),

  /** Add a question to an assessment */
  addQuestion: (id, dto) =>
    apiRequest(`/assessments/${id}/questions`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  /** Delete a question */
  deleteQuestion: (questionId) =>
    apiRequest(`/assessments/questions/${questionId}`, { method: 'DELETE' }),

  /** Get all attempts for a specific assessment (admin) */
  getAssessmentAttempts: (id) =>
    apiRequest(`/assessments/${id}/attempts`, { method: 'GET' }),
};
