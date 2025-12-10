import { cva, type VariantProps } from 'class-variance-authority';
import type { FooterProps } from './types';

const footerVariants = cva(
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

const copyrightVariants = cva(
  'text-sm opacity-80',
  {
    variants: {
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
          <div className="flex-shrink-0 overflow-hidden rounded-lg">
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
