
import axios from 'axios';
import { toast } from 'sonner';

// Determine API URL based on environment - use relative path for production
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('Using API URL:', API_URL); // Debug log

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long waiting when server is down
  timeout: 15000, // Increased timeout for slower connections
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    // Log request body for debugging if it exists
    if (config.data) {
      console.log('Request payload:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Received response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
      
      // Show user-friendly toast based on status code
      if (error.response.status === 404) {
        toast.error(`API endpoint não encontrado: ${error.config.url}`);
      } else if (error.response.status >= 500) {
        toast.error(`Erro no servidor: ${error.response.data.message || 'Erro interno'}`);
      } else {
        toast.error(`Erro: ${error.response.data.message || 'Erro na comunicação com API'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      // Show a user-friendly message when server is down
      if (error.code === 'ECONNABORTED' || !error.response) {
        toast.error(`Servidor API não está respondendo. Verifique se o servidor está rodando em ${API_URL}`, {
          duration: 6000, // Show longer
          position: 'top-center',
        });
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      toast.error(`Erro de configuração da requisição: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;
