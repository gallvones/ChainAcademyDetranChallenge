"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks";

export function UserMenu() {
  const router = useRouter();
  const { isAuthenticated, userName, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
    window.location.reload();
  };

  const handleLogin = () => {
    router.push("/sign-in");
  };

  // Se não estiver autenticado, mostra botão de Login
  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFEB3B] transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-black cursor-pointer"
      >
        <LogIn className="w-5 h-5" />
        Entrar
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFEB3B] transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
      >
        <User className="w-6 h-6 text-black" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[200px] bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden z-50 animate-fade-in-down">
          {/* User Info */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FFC107]/10 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">Olá, {userName}!</p>
          </div>

          {/* Logout Option */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}
