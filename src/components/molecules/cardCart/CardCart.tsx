"use client";

import { cva } from 'class-variance-authority';
import Image from 'next/image';
import type { CardCartProps } from './types';
import { Car, MapPin, Calendar, Palette, Hash, User, Shield } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { useAuth } from '@/hooks';

export const cardCartVariants = cva(
  'group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer border backdrop-blur-sm',
  {
    variants: {
      variant: {
        gold: 'bg-gradient-to-br from-white to-[#FFD700]/10 border-[#FFD700]/30 hover:border-[#FFD700]/60 shadow-[0_8px_32px_rgba(255,215,0,0.15)] hover:shadow-[0_16px_48px_rgba(255,215,0,0.3)]',
        yellow: 'bg-gradient-to-br from-white to-[#FFEB3B]/10 border-[#FFEB3B]/30 hover:border-[#FFEB3B]/60 shadow-[0_8px_32px_rgba(255,235,59,0.15)] hover:shadow-[0_16px_48px_rgba(255,235,59,0.3)]',
        amber: 'bg-gradient-to-br from-white to-[#FFC107]/10 border-[#FFC107]/30 hover:border-[#FFC107]/60 shadow-[0_8px_32px_rgba(255,193,7,0.15)] hover:shadow-[0_16px_48px_rgba(255,193,7,0.3)]',
        light: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
        dark: 'bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-[#FFD700]/20 hover:border-[#FFD700]/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(255,215,0,0.2)]',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        gold: 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 group-hover:bg-[#FFD700]/30 group-hover:shadow-[0_0_12px_rgba(255,215,0,0.4)]',
        yellow: 'bg-[#FFEB3B]/20 text-[#FFEB3B] border border-[#FFEB3B]/30 group-hover:bg-[#FFEB3B]/30 group-hover:shadow-[0_0_12px_rgba(255,235,59,0.4)]',
        amber: 'bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/30 group-hover:bg-[#FFC107]/30 group-hover:shadow-[0_0_12px_rgba(255,193,7,0.4)]',
        light: 'bg-gray-100 text-gray-700 border border-gray-200 group-hover:bg-gray-200',
        dark: 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 group-hover:bg-[#FFD700]/20',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

export function CardCart({
  id,
  name,
  chassi,
  year,
  color,
  model,
  plates,
  ownerName,
  managerName,
  img,
  uf,
  variant = 'light',
  className = '',
  onClick,
  onButtonClick,
}: CardCartProps) {
  const { isAuthenticated, userRole } = useAuth();

  // Usuários não autenticados veem o botão (abrirá modal de login)
  // Usuários autenticados com role 'customer' também podem fazer propostas
  const canMakeProposal = !isAuthenticated || userRole === 'customer';

  return (
    <div
      onClick={onClick}
      className={cardCartVariants({ variant, className })}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-500">
        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            className="object-contain transition-all duration-500 group-hover:scale-110 p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-20 h-20 text-gray-400" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* UF Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <div className={badgeVariants({ variant })}>
            <MapPin className="w-3 h-3" />
            {uf}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FFC107] transition-colors duration-300 flex items-center gap-2">
            <Car className="w-5 h-5" />
            {name}
          </h3>
          <p className="text-sm text-gray-500 font-mono">{model || 'Modelo não especificado'}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {year && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-[#FFC107]" />
              <span>{year}</span>
            </div>
          )}

          {color && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Palette className="w-4 h-4 text-[#FFC107]" />
              <span className="capitalize">{color}</span>
            </div>
          )}



          {plates && (
            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
              <Hash className="w-4 h-4 text-[#FFC107]" />
              <span className="font-mono font-semibold">{plates}</span>
            </div>
          )}
        </div>

        {/* Chassi */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="font-semibold">Chassi:</span>
            <span className="font-mono">{chassi}</span>
          </p>
        </div>

        {/* Owner & Manager */}
        {(ownerName || managerName) && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            {ownerName && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="w-3.5 h-3.5 text-[#FFC107]" />
                <span className="font-semibold">Proprietário:</span>
                <span>{ownerName}</span>
              </div>
            )}

            {canMakeProposal && (
              <Button
                variant='amber'
                onClick={onButtonClick}
                href={onButtonClick ? undefined : `/newproposal/${id}`}
              >
                Fazer proposta
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#FFEB3B] to-[#FFC107]" />
      </div>
    </div>
  );
}
