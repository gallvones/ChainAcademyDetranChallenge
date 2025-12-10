import { cva, type VariantProps } from 'class-variance-authority';
import type { BodyProps } from './types';

const bodyVariants = cva(
  'w-full min-h-screen transition-colors duration-300',
  {
    variants: {
      variant: {
        gold: 'bg-[#FFD700]',
        yellow: 'bg-[#FFEB3B]',
        amber: 'bg-[#FFC107]',
        dark: 'bg-[#000000]',
        darkGray: 'bg-[#333333]',
        light: 'bg-white',
        gradient: 'bg-gradient-to-br from-[#FFD700] via-[#FFEB3B] to-[#FFC107]',
      },
      textColor: {
        gold: 'text-[#FFD700]',
        yellow: 'text-[#FFEB3B]',
        amber: 'text-[#FFC107]',
        black: 'text-[#000000]',
        darkGray: 'text-[#333333]',
        white: 'text-white',
      },
      padding: {
        none: 'p-0',
        small: 'py-4 px-4',
        medium: 'py-8 px-4 md:px-6',
        large: 'py-12 px-4 md:px-8 lg:px-12',
      },
    },
    defaultVariants: {
      variant: 'light',
      textColor: 'black',
      padding: 'medium',
    },
  }
);

export function Body({
  children,
  logo,
  variant = 'light',
  textColor = 'black',
  padding = 'medium',
  className = ''
}: BodyProps) {
  return (
    <main className={bodyVariants({ variant, textColor, padding, className })}>
      <div className="container mx-auto">
        {logo && (
          <div className="flex justify-center mb-8">
            <div className="flex-shrink-0 overflow-hidden rounded-lg">
              {logo}
            </div>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
