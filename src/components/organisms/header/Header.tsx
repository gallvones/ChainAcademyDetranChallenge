import { cva } from 'class-variance-authority';
import Link from 'next/link';
import type { HeaderProps } from './types';

const headerVariants = cva(
  'w-full transition-all duration-500 backdrop-blur-md sticky top-0 z-50 border-b',
  {
    variants: {
      variant: {
        gold: 'bg-[#FFD700]/90 shadow-[0_8px_32px_rgba(255,215,0,0.15)] border-[#FFD700]/20 hover:shadow-[0_8px_48px_rgba(255,215,0,0.25)]',
        yellow: 'bg-[#FFEB3B]/90 shadow-[0_8px_32px_rgba(255,235,59,0.15)] border-[#FFEB3B]/20 hover:shadow-[0_8px_48px_rgba(255,235,59,0.25)]',
        amber: 'bg-[#FFC107]/90 shadow-[0_8px_32px_rgba(255,193,7,0.15)] border-[#FFC107]/20 hover:shadow-[0_8px_48px_rgba(255,193,7,0.25)]',
        dark: 'bg-[#000000]/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/10 hover:shadow-[0_8px_48px_rgba(0,0,0,0.6)]',
        darkGray: 'bg-[#333333]/90 shadow-[0_8px_32px_rgba(51,51,51,0.3)] border-white/10 hover:shadow-[0_8px_48px_rgba(51,51,51,0.5)]',
      },
      textColor: {
        gold: 'text-[#FFD700]',
        yellow: 'text-[#FFEB3B]',
        amber: 'text-[#FFC107]',
        black: 'text-[#000000]',
        darkGray: 'text-[#333333]',
        white: 'text-white',
      },
    },
    defaultVariants: {
      variant: 'gold',
      textColor: 'black',
    },
  }
);

const navLinkVariants = cva(
  'px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden group',
  {
    variants: {
      variant: {
        gold: 'hover:bg-[#FFC107]/30 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105 hover:-translate-y-0.5',
        yellow: 'hover:bg-[#FFD700]/30 hover:shadow-[0_0_20px_rgba(255,235,59,0.3)] hover:scale-105 hover:-translate-y-0.5',
        amber: 'hover:bg-[#FFEB3B]/30 hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:scale-105 hover:-translate-y-0.5',
        dark: 'hover:bg-[#333333]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 hover:-translate-y-0.5',
        darkGray: 'hover:bg-[#000000]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 hover:-translate-y-0.5',
      },
      iconColor: {
        gold: '[&>svg]:stroke-[#FFD700] [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]',
        yellow: '[&>svg]:stroke-[#FFEB3B] [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_8px_rgba(255,235,59,0.6)]',
        amber: '[&>svg]:stroke-[#FFC107] [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_8px_rgba(255,193,7,0.6)]',
        black: '[&>svg]:stroke-[#000000] [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]',
        darkGray: '[&>svg]:stroke-[#333333] [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_4px_rgba(51,51,51,0.4)]',
        white: '[&>svg]:stroke-white [&>svg]:transition-all [&>svg]:duration-300 hover:[&>svg]:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]',
      },
    },
    defaultVariants: {
      variant: 'gold',
      iconColor: 'black',
    },
  }
);

export function Header({ logo, menu, variant = 'gold', textColor = 'black', iconColor = 'black', className = '' }: HeaderProps) {
  return (
    <header className={headerVariants({ variant, textColor, className })}>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-2 hover:drop-shadow-[0_0_16px_rgba(255,193,7,0.5)]">
            {logo}
          </div>

          <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkVariants({ variant, iconColor })}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-[0_0_16px_rgba(255,193,7,0.4)] active:scale-95"
            aria-label="Abrir menu"
          >
            <svg
              className="w-6 h-6 transition-transform duration-300 hover:rotate-90"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
