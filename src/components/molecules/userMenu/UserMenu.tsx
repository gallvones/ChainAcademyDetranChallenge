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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => router.push("/sign-in")}
        className="flex items-center gap-2 rounded-lg border border-[#FFC107]/30 bg-[#FFC107]/10 px-4 py-2 font-display text-sm font-medium text-[#FFD700] transition-all duration-300 hover:bg-[#FFC107]/20 hover:shadow-[0_0_20px_rgba(255,193,7,0.25)]"
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FFC107]/30 bg-gradient-to-br from-[#FFD700] to-[#FFC107] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,193,7,0.4)]"
      >
        <User className="h-5 w-5 text-black" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[210px] overflow-hidden rounded-xl border border-[#FFC107]/20 bg-[#0c0c0d] shadow-[0_16px_48px_rgba(0,0,0,0.6)] animate-fade-in-down">
          <div className="border-b border-white/5 bg-gradient-to-r from-[#FFC107]/10 to-transparent px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FFC107]/70">Buyer</p>
            <p className="font-display text-sm font-semibold text-white">{userName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-[#FFC107]" />
            <span className="text-sm font-medium text-neutral-300">Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}
