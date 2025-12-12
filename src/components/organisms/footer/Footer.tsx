import { cva, type VariantProps } from 'class-variance-authority';
import type { FooterProps } from './types';

const footerVariants = cva(
  'w-full transition-all duration-500 border-t relative backdrop-blur-md',
  {
    variants: {
      variant: {
        gold: 'bg-gradient-to-t from-[#FFD700] to-[#FFD700]/90 shadow-[0_-8px_32px_rgba(255,215,0,0.15)] border-[#FFD700]/30 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#FFD700] before:via-[#FFEB3B] before:to-[#FFC107]',
        yellow: 'bg-gradient-to-t from-[#FFEB3B] to-[#FFEB3B]/90 shadow-[0_-8px_32px_rgba(255,235,59,0.15)] border-[#FFEB3B]/30 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#FFEB3B] before:via-[#FFD700] before:to-[#FFC107]',
        amber: 'bg-gradient-to-t from-[#FFC107] to-[#FFC107]/90 shadow-[0_-8px_32px_rgba(255,193,7,0.15)] border-[#FFC107]/30 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#FFC107] before:via-[#FFEB3B] before:to-[#FFD700]',
        dark: 'bg-gradient-to-t from-[#000000] to-[#000000]/90 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-white/10 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#FFD700] before:via-[#FFEB3B] before:to-[#FFC107]',
        darkGray: 'bg-gradient-to-t from-[#333333] to-[#333333]/90 shadow-[0_-8px_32px_rgba(51,51,51,0.3)] border-white/10 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#FFD700] before:via-[#FFEB3B] before:to-[#FFC107]',
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

const copyrightVariants = cva(
  'text-sm opacity-80 transition-all duration-300 hover:opacity-100',
  {
    variants: {
      textColor: {
        gold: 'text-[#FFD700] hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]',
        yellow: 'text-[#FFEB3B] hover:drop-shadow-[0_0_8px_rgba(255,235,59,0.5)]',
        amber: 'text-[#FFC107] hover:drop-shadow-[0_0_8px_rgba(255,193,7,0.5)]',
        black: 'text-[#000000] hover:scale-105',
        darkGray: 'text-[#333333] hover:scale-105',
        white: 'text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]',
      },
    },
    defaultVariants: {
      textColor: 'black',
    },
  }
);

export function Footer({
  logo,
  variant = 'gold',
  textColor = 'black',
  copyrightText = `© ${new Date().getFullYear()} Todos os direitos reservados.`,
  className = ''
}: FooterProps) {
  return (
    <footer className={footerVariants({ variant, textColor, className })}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-6 shadow-[0_10px_40px_rgba(255,193,7,0.2)] hover:shadow-[0_20px_60px_rgba(255,193,7,0.4)] backdrop-blur-sm bg-white/10 p-2 border border-[#FFC107]/20">
            {logo}
          </div>

          <p className={copyrightVariants({ textColor })}>
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
