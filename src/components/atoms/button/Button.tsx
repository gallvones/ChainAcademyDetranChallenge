import { cva } from "class-variance-authority";
import Link from "next/link";
import type { ButtonProps } from "./types";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer border-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  {
    variants: {
      variant: {
        gold: "bg-[#FFD700] border-[#FFD700] text-black shadow-[0_3px_15px_rgba(255,215,0,0.3)]",
        yellow:
          "bg-[#FFEB3B] border-[#FFEB3B] text-black shadow-[0_3px_15px_rgba(255,235,59,0.3)]",
        amber:
          "bg-[#FFC107] border-[#FFC107] text-black shadow-[0_3px_15px_rgba(255,193,7,0.3)]",
        dark: "bg-[#000000] border-[#000000] text-white shadow-[0_3px_15px_rgba(0,0,0,0.4)]",
        darkGray:
          "bg-[#333333] border-[#333333] text-white shadow-[0_3px_15px_rgba(51,51,51,0.3)]",
        light:
          "bg-white border-gray-300 text-gray-800 shadow-[0_3px_15px_rgba(0,0,0,0.1)]",
        outline:
          "bg-transparent border-gray-300 text-gray-800 hover:bg-gray-50",
        gradient:
          "bg-gradient-to-r from-[#FFD700] via-[#FFEB3B] to-[#FFC107] border-transparent text-black shadow-[0_3px_15px_rgba(255,193,7,0.4)]",
      },
      hoverColor: {
        gold: "hover:bg-[#FFC107] hover:border-[#FFC107] hover:shadow-[0_6px_24px_rgba(255,193,7,0.5)]",
        yellow:
          "hover:bg-[#FFD700] hover:border-[#FFD700] hover:shadow-[0_6px_24px_rgba(255,215,0,0.5)]",
        amber:
          "hover:bg-[#FFEB3B] hover:border-[#FFEB3B] hover:shadow-[0_6px_24px_rgba(255,235,59,0.5)]",
        dark: "hover:bg-[#333333] hover:border-[#333333] hover:shadow-[0_6px_24px_rgba(51,51,51,0.5)]",
        darkGray:
          "hover:bg-[#000000] hover:border-[#000000] hover:shadow-[0_6px_24px_rgba(0,0,0,0.6)]",
        light:
          "hover:bg-gray-100 hover:border-gray-400 hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)]",
        glow: "hover:shadow-[0_0_24px_rgba(255,193,7,0.6)] hover:scale-105",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "amber",
      hoverColor: "yellow",
      size: "md",
    },
  }
);

export function Button({
  title,
  variant = "amber",
  hoverColor = "yellow",
  size = "md",
  href,
  className = "",
  children,
  icon,
  ...rest
}: ButtonProps) {
  const buttonClasses = buttonVariants({
    variant,
    hoverColor,
    size,
    className,
  });

  const content = (
    <>
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-lg transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && (
          <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            {icon}
          </span>
        )}
        {title || children}
      </span>

      {/* Shine effect */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </span>
    </>
  );

  // Se tiver href, renderiza como Link
  if (href && !rest.disabled) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  // Caso contrário, renderiza como button
  return (
    <button
      {...rest}
      className={buttonClasses}
      type={rest.type || "button"}
    >
      {content}
    </button>
  );
}
