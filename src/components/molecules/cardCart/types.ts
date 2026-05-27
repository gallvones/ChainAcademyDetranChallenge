export interface CardCartProps {
  id: string;
  name: string;
  chassi: string;
  img?: string;
  uf?: string;
  index?: number;
  className?: string;
  onClick?: () => void;
  onButtonClick?: (e: React.MouseEvent) => void;
}
