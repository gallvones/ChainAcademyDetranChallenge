export interface MenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface HeaderProps {
  logo: React.ReactNode;
  menu: MenuItem[];
  variant?: 'gold' | 'yellow' | 'amber' | 'dark' | 'darkGray';
  textColor?: 'gold' | 'yellow' | 'amber' | 'black' | 'darkGray' | 'white';
  iconColor?: 'gold' | 'yellow' | 'amber' | 'black' | 'darkGray' | 'white';
  className?: string;
  rightSlot?: React.ReactNode;
}
