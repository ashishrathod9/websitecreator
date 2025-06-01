import axios from 'axios';

const API_URL = 'https://websitecreator-4.onrender.com/api';

const ApiService = {
  async getWebsiteData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/colleges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching website data:', error);
      throw error;
    }
  }
};

export default ApiService; 