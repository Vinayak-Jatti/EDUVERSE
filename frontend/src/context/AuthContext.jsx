import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../services/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data.data.user);
    } catch (err) {
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check for token in URL (OAuth Callback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("accessToken", tokenFromUrl);
      // Clean up the URL to remove the token immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchMe();
      return;
    }

    // 2. Fallback to normal local storage check
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);
    await fetchMe();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    apiClient.post("/auth/logout").catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshMe: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
