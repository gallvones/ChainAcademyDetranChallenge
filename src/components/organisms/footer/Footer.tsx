import type { FooterProps } from './types';

export function Footer({
  logo,
  copyrightText = `© ${new Date().getFullYear()} Chain Registry · Detran SP. Todos os direitos reservados.`,
  className = '',
}: FooterProps) {
  return (
    <footer className={`relative w-full border-t border-[#FFC107]/15 bg-[#0a0a0b] ${className}`}>
      <div className="absolute top-0 inset-x-0 h-px hairline-gold opacity-60" />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="overflow-hidden rounded-xl border border-[#FFC107]/20 bg-white/5 p-2">
            {logo}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#FFC107]/70">
            <span className="h-1 w-1 rounded-full bg-[#FFC107]" />
            Registro certificado em blockchain
            <span className="h-1 w-1 rounded-full bg-[#FFC107]" />
          </div>
          <p className="text-sm text-neutral-500">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
