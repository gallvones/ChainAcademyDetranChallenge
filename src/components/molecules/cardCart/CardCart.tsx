"use client";

import Image from 'next/image';
import type { CardCartProps } from './types';
import { Car, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export function CardCart({
  name,
  chassi,
  img,
  uf,
  index,
  className = '',
  onClick,
  onButtonClick,
}: CardCartProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0c0c0d] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#FFC107]/45 hover:shadow-[0_24px_60px_rgba(255,193,7,0.14)] ${className}`}
    >
      {/* gold top hairline on hover */}
      <div className="absolute top-0 inset-x-0 h-px hairline-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,193,7,0.16),transparent_60%)]" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#FFC107]/25 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
          <ShieldCheck className="h-3 w-3 text-[#FFD700]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#FFD700]">
            Certificado
          </span>
        </div>

        {uf && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FFC107] px-2.5 py-1 text-black">
            <MapPin className="h-3 w-3" />
            <span className="text-[10px] font-bold">{uf}</span>
          </div>
        )}

        {typeof index === 'number' && (
          <span className="absolute bottom-2 right-3 font-mono text-3xl font-bold text-white/5">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-16 w-16 text-neutral-700" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-[#FFD700]">
          {name}
        </h3>

        <div className="border-t border-white/8 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Chassi</p>
          <p className="mt-0.5 break-all font-mono text-xs tracking-wider text-neutral-300">{chassi}</p>
        </div>

        <button
          onClick={onButtonClick}
          className="mt-auto flex items-center justify-between rounded-xl border border-[#FFC107]/25 bg-[#FFC107]/8 px-4 py-2.5 font-display text-sm font-medium text-[#FFD700] transition-all duration-300 hover:bg-[#FFC107] hover:text-black"
        >
          Fazer proposta
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
