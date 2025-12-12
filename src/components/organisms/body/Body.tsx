import { cva, type VariantProps } from 'class-variance-authority';
import type { BodyProps } from './types';

const bodyVariants = cva(
  'w-full min-h-screen transition-all duration-500 relative',
  {
    variants: {
      variant: {
        gold: 'bg-gradient-to-br from-[#FFD700] via-[#FFD700]/95 to-[#FFC107]/90 shadow-inner',
        yellow: 'bg-gradient-to-br from-[#FFEB3B] via-[#FFEB3B]/95 to-[#FFD700]/90 shadow-inner',
        amber: 'bg-gradient-to-br from-[#FFC107] via-[#FFC107]/95 to-[#FFD700]/90 shadow-inner',
        dark: 'bg-gradient-to-br from-[#1a1a1a] via-[#262626] to-[#333333] shadow-[inset_0_0_100px_rgba(255,193,7,0.05)]',
        darkGray: 'bg-gradient-to-br from-[#404040] via-[#4a4a4a] to-[#555555] shadow-[inset_0_0_100px_rgba(255,193,7,0.05)]',
        light: 'bg-gradient-to-br from-[#f5f5f5] via-[#e8e8e8] to-[#d4d4d4]',
        gradient: 'bg-[linear-gradient(135deg,#f5f5f5_0%,#e0e0e0_25%,#d4d4d4_50%,#c4c4c4_75%,#b0b0b0_100%)] bg-[length:400%_400%] animate-gradient-shift shadow-[inset_0_0_60px_rgba(0,0,0,0.05)]',
      },
      textColor: {
        gold: 'text-[#FFD700] drop-shadow-[0_2px_8px_rgba(255,215,0,0.3)]',
        yellow: 'text-[#FFEB3B] drop-shadow-[0_2px_8px_rgba(255,235,59,0.3)]',
        amber: 'text-[#FFC107] drop-shadow-[0_2px_8px_rgba(255,193,7,0.3)]',
        black: 'text-[#000000]',
        darkGray: 'text-[#333333]',
        white: 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
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
      <div className="container mx-auto relative">
        {logo && (
          <div className="flex justify-center mb-8 animate-fade-in-down">
            <div className="flex-shrink-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(255,193,7,0.25)] hover:shadow-[0_30px_80px_rgba(255,193,7,0.35)] transition-all duration-500 hover:scale-105 hover:-rotate-3 backdrop-blur-sm bg-white/10 p-2 border border-[#FFC107]/20">
              {logo}
            </div>
          </div>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </main>
  );
}
