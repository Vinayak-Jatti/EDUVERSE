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
    const initializeAuth = async () => {
      console.log("[Auth] Initializing session...");
      
      // 1. Check for token in URL (OAuth Callback)
      // We look at both search and hash as some proxy/routing setups might mangle it
      const urlParams = new URLSearchParams(window.location.search || window.location.hash.split("?")[1]);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        console.log("[Auth] Token discovered in URL. Provisioning local storage.");
        localStorage.setItem("accessToken", tokenFromUrl);
        
        // Clean up the URL to remove the token immediately for security
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        await fetchMe();
        return;
      }

      // 2. Fallback to normal local storage check
      const savedToken = localStorage.getItem("accessToken");
      if (savedToken) {
        console.log("[Auth] Existing session found. Validating...");
        await fetchMe();
      } else {
        console.log("[Auth] No active session. Transitioning to Guest.");
        setLoading(false);
      }
    };

    initializeAuth();
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
