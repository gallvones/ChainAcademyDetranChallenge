"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import logoFria from "@/../public/images/logoFria.png";
import { Mail, Lock, LogIn } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Redirecionar para a home
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD700]/20 via-[#FFC107]/10 to-[#FFEB3B]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Container */}
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,193,7,0.25)] border border-[#FFC107]/30 overflow-hidden">
          {/* Logo Section */}
          <div className="bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] p-8 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src={logoFria}
                alt="ChainAcademy Logo"
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-black">ChainAcademy</h1>
            <p className="text-sm text-black/80 mt-2">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide"
                >
                  <Mail className="w-4 h-4 text-[#FFC107]" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide"
                >
                  <Lock className="w-4 h-4 text-[#FFC107]" />
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="amber"
                hoverColor="yellow"
                size="lg"
                disabled={isLoading}
                className="w-full"
                icon={<LogIn className="w-5 h-5" />}
                type="submit"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Não possui senha? Entre apenas com seu email cadastrado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
