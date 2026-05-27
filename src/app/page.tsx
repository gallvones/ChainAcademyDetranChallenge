import { MainLayout } from "@/components/templates";
import { CardsGrid } from "@/components/organisms/cardsGrid";
import { getAllCars } from "./api/cars";
import { ShieldCheck, Zap, FileSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cars = await getAllCars();

  return (
    <MainLayout>
      <div className="space-y-14">
        {/* Hero */}
        <section className="relative flex flex-col items-center text-center animate-fade-in-down">
          <p className="mb-4 flex items-center justify-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.35em] text-[#FFC107]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107] animate-pulse-glow" />
            Marketplace de veículos · Detran SP
          </p>

          <h1 className="font-display text-5xl font-bold leading-[0.95] text-white md:text-7xl">
            Registro de veículos
            <br />
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] bg-clip-text text-transparent">
              certificados
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            Escolha um veículo do catálogo, envie sua proposta em um clique e
            acompanhe a aprovação do proprietário direto no seu email.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              { icon: FileSearch, label: `${cars.length} veículos no catálogo` },
              { icon: Zap, label: "Proposta em 1 clique" },
              { icon: ShieldCheck, label: "Origem certificada" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-neutral-300">
                <Icon className="h-4 w-4 text-[#FFC107]" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Catalog */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Catálogo
            </h2>
            <span className="font-mono text-xs text-[#FFC107]/70">
              [{String(cars.length).padStart(2, "0")}]
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-[#FFC107]/30 to-transparent" />
          </div>

          <CardsGrid cars={cars} />
        </section>
      </div>
    </MainLayout>
  );
}
