// src/api/apiService.js
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 


const API_BASE_URL = 'https://running-app-mhyu.onrender.com/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const nowUtcSeconds = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < nowUtcSeconds;

      console.log('[Token Check]');
      console.log('Decoded exp (UTC):', new Date(decoded.exp * 1000).toISOString());
      console.log('Now (UTC):         ', new Date(nowUtcSeconds * 1000).toISOString());
      console.log('=> Token expired?', isExpired);

      if (isExpired) {
        console.warn('⚠️ Token has expired. Removing it from headers.');
        delete api.defaults.headers.common['Authorization'];
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      delete api.defaults.headers.common['Authorization'];
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- API Auth (User.Service qua Gateway) ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// --- API Runs (Run.Service qua Gateway) ---
export const getMyRuns = (userId) =>   api.get(`/runs/${userId}`);
export const addRun = (runData) => api.post('/runs', runData);
export const updateRun = (runId, runData) => api.put(`/runs/${runId}`, runData);
export const deleteRun = (runId) => api.delete(`/runs/${runId}`);

// --- API Images (Image.Service qua Gateway) ---
export const uploadRunImage = (runId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/images/upload/${runId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Quan trọng cho upload file
    },
  });
};
export const getImagesForRun = (runId) => api.get(`/images/run/${runId}`);
export const deleteImage = (imageId) => api.delete(`/images/${imageId}`);

// --- API Map (Map.Service qua Gateway) ---
// Đây là endpoint để gửi tọa độ (giả định)
export const trackRunPath = (runId, coordinates) => api.post(`/maps/track/${runId}`, {
  runActivityId: runId, // Ensure the backend expects runActivityId
  coordinates: coordinates
});
// Endpoint để lấy URL bản đồ tĩnh
export const getStaticMapUrl = (runId) => api.get(`/maps/static-map/${runId}`);

// --- API Analyze (Analyze.Service qua Gateway) ---
export const getRunAnalysis = (runsData) => api.post('/analyze/suggest', { runs: runsData });

export default api; // Export instance axios đã cấu hình để dùng trực tiếp nếu cần