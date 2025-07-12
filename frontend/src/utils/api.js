import axios from 'axios';

// API Configuration and utility functions

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get JWT token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('jwt');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Common API request function
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await apiClient({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

// API endpoints
export const API_ENDPOINTS = {
  QUESTIONS: '/questions',
  // Add more endpoints as needed
};

// Export the axios instance for direct use if needed
export { apiClient }; 