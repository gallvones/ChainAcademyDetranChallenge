"use client";

import { useState, useEffect } from "react";

interface UseAuthReturn {
  isAuthenticated: boolean;
  userName: string | null;
  showAuthModal: boolean;
  closeAuthModal: () => void;
  logout: () => void;
  requireAuth: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userDetranStr = localStorage.getItem("userDetran");

      if (userDetranStr) {
        try {
          const userDetran = JSON.parse(userDetranStr);
          setIsAuthenticated(true);
          setUserName(userDetran.name);
          return;
        } catch (error) {
          console.error("Erro ao parsear userDetran:", error);
        }
      }

      setIsAuthenticated(false);
      setUserName(null);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const closeAuthModal = () => setShowAuthModal(false);

  const logout = () => {
    localStorage.removeItem("userDetran");
    setIsAuthenticated(false);
    setUserName(null);
  };

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    userName,
    showAuthModal,
    closeAuthModal,
    logout,
    requireAuth,
  };
}
