export interface MenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface HeaderProps {
  logo: React.ReactNode;
  menu?: MenuItem[];
  className?: string;
  rightSlot?: React.ReactNode;
}
