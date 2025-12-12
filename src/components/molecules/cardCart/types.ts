import { VariantProps } from 'class-variance-authority';
import { cardCartVariants } from './CardCart';

export interface CardCartProps extends VariantProps<typeof cardCartVariants> {
  id: string;
  name: string;
  chassi: string;
  year?: number;
  color?: string;
  model?: string;
  plates?: string;
  ownerName?: string;
  managerName?: string;
  img?: string;
  uf: string;
  className?: string;
  onClick?: () => void;
  onButtonClick?: () => void;
}
