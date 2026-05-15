import axios from 'axios';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request failed:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response successful:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API] Response error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response from server:', error.request);
    } else {
      // Error in request setup
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Methods

/**
 * Upload images and get predictions
 * @param {File[]} files - Array of image files
 * @returns {Promise} - Prediction results
 */
export const predictImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await apiClient.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Prediction failed: ${error.message}`);
  }
};

/**
 * Send chat message to AI assistant
 * @param {string} message - User message
 * @param {string} apiKey - Optional Gemini API key
 * @returns {Promise} - AI response
 */
export const sendChatMessage = async (message, apiKey = null) => {
  try {
    const response = await apiClient.post('/chat', {
      message,
      api_key: apiKey,
    });
    return response.data.response;
  } catch (error) {
    throw new Error(`Chat failed: ${error.message}`);
  }
};

/**
 * Health check - verify backend is running
 * @returns {Promise} - Backend status
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    throw new Error(`Backend health check failed: ${error.message}`);
  }
};

export default apiClient;
