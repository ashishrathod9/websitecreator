export const config = {
  // API URL for production
  API_URL: 'https://websitecreator-12.onrender.com/api',
  // Development API URL
  DEV_API_URL: 'http://localhost:5000/api',
  // Use production URL by default
  get API_BASE_URL() {
    return process.env.NODE_ENV === 'production' ? this.API_URL : this.DEV_API_URL;
  }
}; 