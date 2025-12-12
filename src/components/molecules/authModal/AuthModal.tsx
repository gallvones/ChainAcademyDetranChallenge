"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import logoFria from "@/../public/images/logoFria.png";
import { Mail, Lock, LogIn, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      // Salvar no localStorage
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userRole", data.role);

      // Callback de sucesso
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,193,7,0.25)] border border-[#FFC107]/30 overflow-hidden animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo Section */}
        <div className="bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] p-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src={logoFria}
              alt="ChainAcademy Logo"
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-black">Login Necessário</h2>
          <p className="text-sm text-black/80 mt-2">
            Faça login para continuar
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="modal-email"
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                <Mail className="w-3.5 h-3.5 text-[#FFC107]" />
                Email
              </label>
              <input
                type="email"
                id="modal-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 text-sm"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="modal-password"
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                <Lock className="w-3.5 h-3.5 text-[#FFC107]" />
                Senha
              </label>
              <input
                type="password"
                id="modal-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="amber"
              hoverColor="yellow"
              size="md"
              disabled={isLoading}
              className="w-full"
              icon={<LogIn className="w-4 h-4" />}
              type="submit"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Não possui senha? Entre apenas com seu email cadastrado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
