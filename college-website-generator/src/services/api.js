import axios from 'axios';

const API_BASE_URL = 'https://websitecreator-3.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const generateWebsite = async (data) => {
  try {
    const response = await api.post('/colleges/generate', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWebsite = async (id) => {
  try {
    const response = await api.get(`/colleges/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api; 