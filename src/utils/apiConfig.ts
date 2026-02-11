import { apiService } from '@/services/api';

// Initialize API service with correct backend URL
export const initializeApiService = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const backendParam = urlParams.get('backend');
    
    if (backendParam) {
      const backendURL = decodeURIComponent(backendParam);
      console.log('🔗 Initializing API service with backend URL:', backendURL);
      apiService.updateBaseURL(backendURL);
      return backendURL;
    }
  }
  
  // Fallback to environment variable
  const envBackendURL = import.meta.env.VITE_BACKEND_URL;
  if (envBackendURL) {
    console.log('🔗 Using environment backend URL:', envBackendURL);
    apiService.updateBaseURL(envBackendURL);
    return envBackendURL;
  }
  
  console.log('🔗 Using default backend URL: https://pralay-backend-1.onrender.com');
  return 'https://pralay-backend-1.onrender.com';
};

// Get current backend URL
export const getCurrentBackendURL = () => {
  return apiService.getBaseURL();
};

// Check if backend is accessible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${apiService.getBaseURL()}/api/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};
