import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const getAllQuestions = async () => {
  const res = await axios.get(`${API_BASE}/questions`);
  return res.data;
};
