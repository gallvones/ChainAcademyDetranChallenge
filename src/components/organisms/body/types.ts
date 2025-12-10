export interface BodyProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
  variant?: 'gold' | 'yellow' | 'amber' | 'dark' | 'darkGray' | 'light' | 'gradient';
  textColor?: 'gold' | 'yellow' | 'amber' | 'black' | 'darkGray' | 'white';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
}
