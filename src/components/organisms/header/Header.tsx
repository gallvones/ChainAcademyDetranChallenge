import { cva } from 'class-variance-authority';
import Link from 'next/link';
import type { HeaderProps } from './types';

const headerVariants = cva(
  'w-full transition-colors duration-300',
  {
    variants: {
      variant: {
        gold: 'bg-[#FFD700]',
        yellow: 'bg-[#FFEB3B]',
        amber: 'bg-[#FFC107]',
        dark: 'bg-[#000000]',
        darkGray: 'bg-[#333333]',
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
  'px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2',
  {
    variants: {
      variant: {
        gold: 'hover:bg-[#FFC107]',
        yellow: 'hover:bg-[#FFD700]',
        amber: 'hover:bg-[#FFEB3B]',
        dark: 'hover:bg-[#333333]',
        darkGray: 'hover:bg-[#000000]',
      },
      iconColor: {
        gold: '[&>svg]:stroke-[#FFD700]',
        yellow: '[&>svg]:stroke-[#FFEB3B]',
        amber: '[&>svg]:stroke-[#FFC107]',
        black: '[&>svg]:stroke-[#000000]',
        darkGray: '[&>svg]:stroke-[#333333]',
        white: '[&>svg]:stroke-white',
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
          <div className="flex-shrink-0 overflow-hidden rounded-lg">
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
            className="md:hidden p-2 rounded-md"
            aria-label="Abrir menu"
          >
            <svg
              className="w-6 h-6"
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
