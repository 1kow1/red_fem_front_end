/* eslint-disable react-refresh/only-export-components */
// src/contexts/auth/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { loginUser, pingProtected } from "../../services/authAPI";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      console.warn("Logout falhou", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // on mount: tenta pingar endpoint protegido (verifica se cookie existe/é válido)
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { status } = await pingProtected();
        if (status >= 200 && status < 300) {
          setIsAuthenticated(true);
          setUser({}); // não temos dados detalhados, apenas confirmação de sessão
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
