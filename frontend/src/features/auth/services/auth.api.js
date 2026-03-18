import apiClient from "../../../services/apiClient";

const authApi = {
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },
  register: async (userData) => {
    return apiClient.post("/auth/register", userData);
  },
  logout: async () => {
    return apiClient.post("/auth/logout");
  },
  verifyOtp: async (data) => {
    return apiClient.post("/auth/verify-otp", data);
  },
};

export default authApi;
