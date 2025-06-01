const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  async generateWebsite(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate website');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating website:', error);
      throw error;
    }
  },

  async getWebsite(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/websites/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch website');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching website:', error);
      throw error;
    }
  }
};

export default api; 