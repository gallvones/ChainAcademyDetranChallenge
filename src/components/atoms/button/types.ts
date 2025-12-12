import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./Button";
import { ReactNode, ButtonHTMLAttributes } from "react";

export interface ButtonProps
  extends VariantProps<typeof buttonVariants>,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  title?: string;
  href?: string;
  className?: string;
  icon?: ReactNode;
}
