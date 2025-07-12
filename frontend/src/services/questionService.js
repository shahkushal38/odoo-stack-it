import { apiClient, API_ENDPOINTS } from '../utils/api';

// Question-related API operations
export const questionService = {
  // Create a new question
  createQuestion: async (questionData) => {
    const response = await apiClient.post(API_ENDPOINTS.QUESTIONS, questionData);
    return response.data;
  },

  // Get all questions
  getQuestions: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.QUESTIONS, { params });
    return response.data;
  },

  // Get a specific question by ID
  getQuestionById: async (questionId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.QUESTIONS}/${questionId}`);
    return response.data;
  },

  // Update a question
  updateQuestion: async (questionId, updateData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.QUESTIONS}/${questionId}`, updateData);
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.QUESTIONS}/${questionId}`);
    return response.data;
  },

  //AI Analysis related operations
  getAIAnalysisByQuestion: async (questionId) => {
    const response = await apiClient.get(`/admin/questions/${questionId}`);
    return response.data;
  }
}