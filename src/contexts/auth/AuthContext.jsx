// src/contexts/auth/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { loginUser, pingProtected } from "../../services/authAPI";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // null = not checked yet, false = not authenticated, true = authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (email, senha) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, status } = await loginUser(email, senha);
      if (status >= 200 && status < 300) {
        const userData = data && (data.user || data.usuario || data) ? (data.user || data.usuario || data) : { email };
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      } else {
        setIsAuthenticated(false);
        const errMsg = (data && (data.message || data.error)) ? (data.message || data.error) : String(data);
        setError(errMsg);
        return { success: false, error: { message: errMsg } };
      }
    } catch (err) {
      const normalized = err?.response?.data?.message
        || err?.response?.data
        || err?.message
        || String(err);
      const normalizedString = typeof normalized === 'string' ? normalized : JSON.stringify(normalized);
      setError(normalizedString);
      setIsAuthenticated(false);
      return { success: false, error: { message: normalizedString } };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8003/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // on mount: ping protected endpoint to check session cookie
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setIsAuthenticated(null); // unknown at start
      try {
        const res = await pingProtected(); // must include credentials in implementation
        // res can be { status, data }
        if (!mounted) return;
        if (res?.status >= 200 && res?.status < 300) {
          // if server sends back user info use it, otherwise keep user null
          const serverUser = res.data && (res.data.user || res.data.usuario || res.data) ? (res.data.user || res.data.usuario || res.data) : null;
          setUser(serverUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.warn("pingProtected error:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
