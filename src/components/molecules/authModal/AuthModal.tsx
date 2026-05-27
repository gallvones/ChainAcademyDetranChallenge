"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import logoFria from "@/../public/images/logoFria.png";
import { Mail, LogIn, X, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao fazer login");

      localStorage.setItem(
        "userDetran",
        JSON.stringify({ id: data.id, email: data.email, name: data.name, role: data.role })
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#FFC107]/20 bg-[#0c0c0d] shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-fade-in-up">
        <div className="absolute inset-x-0 top-0 h-px hairline-gold" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative border-b border-white/5 p-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,193,7,0.12),transparent_65%)]" />
          <div className="relative mb-4 flex justify-center">
            <div className="rounded-2xl border border-[#FFC107]/25 bg-white/5 p-2.5">
              <Image src={logoFria} alt="Chain Registry" width={120} height={120} className="object-cover" />
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-white">Acesso necessário</h2>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FFC107]/80">
            <ShieldCheck className="h-3 w-3" />
            Entre para enviar a proposta
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="modal-email"
                className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400"
              >
                <Mail className="h-3.5 w-3.5 text-[#FFC107]" />
                Email
              </label>
              <input
                type="email"
                id="modal-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                placeholder="voce@email.com"
                className="w-full rounded-xl border-2 border-white/10 bg-[#0a0a0b] px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-neutral-700 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/15"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <Button
              variant="amber"
              hoverColor="yellow"
              size="md"
              disabled={isLoading}
              className="w-full"
              icon={<LogIn className="h-4 w-4" />}
              type="submit"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-600">
            Sem senha — entre apenas com seu email cadastrado.
          </p>
        </div>
      </div>
    </div>
  );
}
