// Dynamic API configuration for different environments
export const getApiConfig = () => {
  // Check if we're running on ngrok
  const isNgrok = window.location.hostname.includes('ngrok');
  
  if (isNgrok) {
    // Get backend URL from localStorage or prompt user
    const backendUrl = localStorage.getItem('backend_ngrok_url');
    if (backendUrl) {
      // Remove trailing slash if exists
      const cleanUrl = backendUrl.replace(/\/$/, '');
      return `${cleanUrl}/api`;
    }
    
    // Prompt user to enter backend URL
    const userBackendUrl = prompt(
      'Please enter your backend ngrok URL (e.g., https://xxxx-xx-xx-xxx-xx.ngrok.io):'
    );
    if (userBackendUrl) {
      // Remove trailing slash if exists
      const cleanUrl = userBackendUrl.replace(/\/$/, '');
      localStorage.setItem('backend_ngrok_url', cleanUrl);
      return `${cleanUrl}/api`;
    }
  }
  
  // Default local development
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiConfig();
