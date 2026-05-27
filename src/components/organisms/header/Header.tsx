import Link from 'next/link';
import type { HeaderProps } from './types';

export function Header({ logo, className = '', rightSlot }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#FFC107]/15 bg-[#0a0a0b]/80 backdrop-blur-xl ${className}`}
    >
      {/* gold hairline */}
      <div className="absolute bottom-0 inset-x-0 h-px hairline-gold opacity-60" />

      <div className="container mx-auto px-5">
        <div className="relative flex h-28 items-center justify-between">
          {/* left: brand wordmark */}
          <Link href="/" className="leading-tight">
            <p className="font-display text-lg font-semibold text-white">Chain Registry</p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#FFC107]/70">Detran · SP</p>
          </Link>

          {/* center: Detran crest */}
          <div className="absolute left-1/2 -translate-x-1/2">{logo}</div>

          {/* right: account */}
          <div className="flex items-center gap-4">{rightSlot}</div>
        </div>
      </div>
    </header>
  );
}
