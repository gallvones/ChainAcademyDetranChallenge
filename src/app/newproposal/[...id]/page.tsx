"use client";

import { MainLayout } from "@/components/templates";
import { Button } from "@/components/atoms/button";
import Image from "next/image";
import {
  Send,
  Car,
  Palette,
  Hash,
  MapPin,
  Tag,
  Factory,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CarDetail } from "@/types/car";

const display = { fontFamily: "var(--font-display)" } as const;

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function parseOffer(raw: string): number {
  const n = parseFloat(raw.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export default function NewProposal({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = use(params);
  const carId = resolvedParams.id[0];
  const router = useRouter();

  const [car, setCar] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOffer, setPurchaseOffer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successNumber, setSuccessNumber] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`);
        const data = await response.json();
        if (response.ok) setCar(data);
      } catch (err) {
        console.error("Erro ao buscar carro:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  const offerValue = parseOffer(purchaseOffer);
  const hasOffer = Number.isFinite(offerValue) && offerValue > 0;
  const fipePct =
    car?.fipeValue && hasOffer ? (offerValue / car.fipeValue) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNumber("");

    if (!localStorage.getItem("userDetran")) {
      setError("Você precisa estar autenticado para enviar uma proposta.");
      return;
    }
    if (!car) {
      setError("Dados do veículo indisponíveis.");
      return;
    }
    if (!hasOffer) {
      setError("Informe um valor de proposta válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_name: car.name,
          car_chassi: car.chassi,
          purchase_offer: offerValue,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar proposta");
      setSuccessNumber(data.number || data.sys_id || "");
      setPurchaseOffer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar proposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const specs = car
    ? [
        { icon: Tag, label: "Marca", value: car.brand },
        { icon: Car, label: "Modelo", value: car.model },
        { icon: Palette, label: "Cor", value: car.color },
        { icon: Factory, label: "Ano fabricação", value: car.yearManufacture },
        { icon: CalendarClock, label: "Ano modelo", value: car.yearModel },
        { icon: CreditCard, label: "Placa", value: car.plate },
      ].filter((s) => s.value)
    : [];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-in-down">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#FFC107]/40" />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FFC107]" style={display}>
            Proposta de compra
          </p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#FFC107]/40" />
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-[#FFC107]/20 bg-[#0c0c0d] p-16">
            <p className="text-center text-neutral-400 animate-pulse">Carregando dossiê do veículo...</p>
          </div>
        ) : !car ? (
          <div className="rounded-3xl border border-red-500/30 bg-[#0c0c0d] p-16">
            <p className="text-center text-red-400">Veículo não encontrado.</p>
          </div>
        ) : (
          <div
            className="relative overflow-hidden rounded-3xl border border-[#FFC107]/20 bg-gradient-to-br from-[#0b0b0c] via-[#15130c] to-[#0b0b0c] shadow-[0_24px_80px_rgba(0,0,0,0.45)] animate-fade-in-up"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,193,7,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,193,7,0.04) 1px, transparent 1px), linear-gradient(135deg, #0b0b0c, #15130c, #0b0b0c)",
              backgroundSize: "44px 44px, 44px 44px, 100% 100%",
            }}
          >
            {/* gold top hairline */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />

            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              {/* Image side */}
              <div className="relative min-h-[300px] p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#FFC107]/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,193,7,0.18),transparent_62%)]" />
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-[#FFC107]/30 bg-black/40 px-3 py-1 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFD700]">
                    Certificado
                  </span>
                </div>
                {car.uf && (
                  <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-[#FFC107] px-3 py-1 text-black">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{car.uf}</span>
                  </div>
                )}
                <div className="relative h-56 w-full">
                  {car.img ? (
                    <Image src={car.img} alt={car.name} fill className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Car className="w-24 h-24 text-neutral-700" />
                    </div>
                  )}
                </div>
              </div>

              {/* Data side */}
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  {car.brand && (
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFC107]" style={display}>
                      {car.brand}
                    </p>
                  )}
                  <h1 className="text-4xl font-bold leading-none text-white" style={display}>
                    {car.name}
                  </h1>
                </div>

                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/5 bg-white/5">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-[#0c0c0d] p-3.5">
                      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                        <Icon className="w-3 h-3 text-[#FFC107]/70" />
                        {label}
                      </dt>
                      <dd className="mt-1 font-mono text-sm text-neutral-100 capitalize">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="rounded-xl border border-white/5 bg-[#0c0c0d] p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    <Hash className="w-3 h-3 text-[#FFC107]/70" />
                    Chassi
                  </p>
                  <p className="mt-1 font-mono text-sm tracking-wider text-neutral-100 break-all">{car.chassi}</p>
                </div>

                {car.fipeValue && (
                  <div className="flex items-end justify-between rounded-xl border border-[#FFC107]/25 bg-gradient-to-r from-[#FFC107]/10 to-transparent p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC107]">
                        Valor de referência · FIPE
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white" style={display}>
                        {brl.format(car.fipeValue)}
                      </p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-[#FFC107]/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Offer section */}
            <div className="border-t border-[#FFC107]/15 bg-black/30 p-8">
              {successNumber ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  <p className="text-xl font-bold text-white" style={display}>
                    Proposta enviada!
                  </p>
                  <p className="text-sm text-neutral-400">
                    Protocolo <span className="font-mono font-bold text-[#FFD700]">{successNumber}</span>.
                    O proprietário receberá um email para aprovar, rejeitar ou contrapropor.
                  </p>
                  <Button variant="amber" size="md" onClick={() => router.push("/")}>
                    Voltar ao catálogo
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <label htmlFor="purchaseOffer" className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#FFC107]" style={display}>
                    Sua proposta de compra
                  </label>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-neutral-500">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="purchaseOffer"
                        value={purchaseOffer}
                        onChange={(e) => {
                          setPurchaseOffer(e.target.value);
                          setError("");
                        }}
                        required
                        placeholder="0,00"
                        className="w-full rounded-xl border-2 border-white/10 bg-[#0c0c0d] py-3.5 pl-12 pr-4 text-2xl font-bold text-white outline-none transition-all placeholder:text-neutral-700 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/15"
                        style={display}
                      />
                    </div>

                    {fipePct !== null && (
                      <div
                        className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-5 py-2.5 ${
                          fipePct >= 100
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : fipePct >= 80
                            ? "border-[#FFC107]/30 bg-[#FFC107]/10 text-[#FFD700]"
                            : "border-red-500/30 bg-red-500/10 text-red-300"
                        }`}
                      >
                        <span className="text-2xl font-bold leading-none" style={display}>
                          {fipePct.toFixed(0)}%
                        </span>
                        <span className="mt-1 text-[10px] uppercase tracking-wider opacity-80">da FIPE</span>
                      </div>
                    )}
                  </div>

                  {fipePct !== null && (
                    <p className="text-xs text-neutral-500">
                      {fipePct >= 100
                        ? `Sua oferta está ${brl.format(offerValue - (car.fipeValue ?? 0))} acima da tabela FIPE.`
                        : `Sua oferta está ${brl.format((car.fipeValue ?? 0) - offerValue)} abaixo da tabela FIPE.`}
                    </p>
                  )}

                  {error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="submit"
                      variant="amber"
                      hoverColor="yellow"
                      size="md"
                      disabled={isSubmitting}
                      className="flex-1"
                      icon={<Send className="w-4 h-4" />}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar proposta"}
                    </Button>
                    <Button variant="outline" hoverColor="glow" size="md" href="/" className="flex-1">
                      Cancelar
                    </Button>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]/60" />
                    A proposta vai direto ao proprietário, que decide por email. Você é notificado da resposta.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
