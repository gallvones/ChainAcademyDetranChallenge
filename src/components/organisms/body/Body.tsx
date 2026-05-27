import { cva } from 'class-variance-authority';
import type { BodyProps } from './types';

const paddingVariants = cva('w-full min-h-screen relative isolate', {
  variants: {
    padding: {
      none: 'p-0',
      small: 'py-6 px-4',
      medium: 'py-10 px-4 md:px-6',
      large: 'py-14 px-4 md:px-8 lg:px-12',
    },
  },
  defaultVariants: {
    padding: 'large',
  },
});

export function Body({ children, padding = 'large', className = '' }: BodyProps) {
  return (
    <main className={paddingVariants({ padding, className })}>
      {/* Registry canvas: deep ink + blueprint grid + warm gold glows */}
      <div className="absolute inset-0 -z-10 bg-[#0a0a0b]" />
      <div className="absolute inset-0 -z-10 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_85%)]" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,193,7,0.12),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.06),transparent_70%)] blur-3xl" />

      <div className="container mx-auto relative">{children}</div>
    </main>
  );
}
