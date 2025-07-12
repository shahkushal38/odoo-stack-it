import { apiClient, API_ENDPOINTS } from '../utils/api';

// Question-related API operations
export const questionService = {
  // Create a new question
  createQuestion: async (questionData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.QUESTIONS, questionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all questions
  getQuestions: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QUESTIONS, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific question by ID
  getQuestionById: async (questionId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.QUESTIONS}/${questionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (questionId, updateData) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.QUESTIONS}/${questionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.QUESTIONS}/${questionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 