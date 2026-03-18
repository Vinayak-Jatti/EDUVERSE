import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth tokens if any
apiClient.interceptors.request.use(
  (config) => {
    // Add logic here if you need to manually attach tokens
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh or errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle global errors here (e.g., 401 logout)
    return Promise.reject(error);
  }
);

export default apiClient;
