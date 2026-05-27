"use client";

import { useMemo } from 'react';
import { useAuth } from './useAuth';

export type IconType = 'house' | 'fileText' | 'checkCircle' | 'send';

export interface MenuItemData {
  href: string;
  label: string;
  iconType: IconType;
}

export function useHeaderMenu() {
  const { isAuthenticated } = useAuth();

  return useMemo<MenuItemData[]>(() => {
    if (!isAuthenticated) {
      return [
        { href: "/", label: "Home", iconType: "house" }
      ];
    }

    return [{ href: "/", label: "Home", iconType: "house" }];
  }, [isAuthenticated]);
}
