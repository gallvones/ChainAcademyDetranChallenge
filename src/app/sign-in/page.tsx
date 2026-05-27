"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import logoFria from "@/../public/images/logoFria.png";
import { Mail, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0b] p-4">
      {/* canvas */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      <div className="absolute left-1/2 top-1/3 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,193,7,0.14),transparent_70%)] blur-2xl" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-[#FFD700]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao catálogo
        </Link>

        <div className="overflow-hidden rounded-3xl border border-[#FFC107]/20 bg-[#0c0c0d] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-x-0 h-px hairline-gold" />

          {/* header */}
          <div className="relative border-b border-white/5 p-8 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,193,7,0.12),transparent_65%)]" />
            <div className="relative mb-5 flex justify-center">
              <div className="rounded-2xl border border-[#FFC107]/25 bg-white/5 p-3">
                <Image src={logoFria} alt="Chain Registry" width={84} height={84} className="object-cover" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Chain Registry</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FFC107]/80">
              <ShieldCheck className="h-3 w-3" />
              Acesso do comprador
            </p>
          </div>

          {/* form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400"
                >
                  <Mail className="h-3.5 w-3.5 text-[#FFC107]" />
                  Email cadastrado
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  placeholder="voce@email.com"
                  className="w-full rounded-xl border-2 border-white/10 bg-[#0a0a0b] px-4 py-3 text-white outline-none transition-all placeholder:text-neutral-700 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/15"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                variant="amber"
                hoverColor="yellow"
                size="lg"
                disabled={isLoading}
                className="w-full"
                icon={<LogIn className="h-5 w-5" />}
                type="submit"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-neutral-600">
              Sem senha — entre apenas com seu email cadastrado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
