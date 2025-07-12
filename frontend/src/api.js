import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const getAllQuestions = async (page, limit) => {
  const res = await axios.get(`${API_BASE}/questions?page=${page}&limit=${limit}`);
  return res.data;
};
