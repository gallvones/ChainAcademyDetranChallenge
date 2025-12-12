"use client";

import { useState, useEffect } from "react";

interface UseAuthReturn {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
  requireAuth: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Verifica autenticação no mount e quando localStorage muda
  useEffect(() => {
    const checkAuth = () => {
      const storedUserId = localStorage.getItem("userId");
      const storedUserEmail = localStorage.getItem("userEmail");
      const storedUserName = localStorage.getItem("userName");
      const storedUserRole = localStorage.getItem("userRole");

      if (storedUserId) {
        setIsAuthenticated(true);
        setUserId(storedUserId);
        setUserEmail(storedUserEmail);
        setUserName(storedUserName);
        setUserRole(storedUserRole);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
        setUserName(null);
        setUserRole(null);
      }
    };

    checkAuth();

    // Listener para mudanças no localStorage
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    setUserName(null);
    setUserRole(null);
  };

  // Função de interceptação: retorna true se autenticado, false e abre modal se não
  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      openAuthModal();
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    userId,
    userEmail,
    userName,
    userRole,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    logout,
    requireAuth,
  };
}
