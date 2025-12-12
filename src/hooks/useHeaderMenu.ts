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
  const { userRole, isAuthenticated, userId } = useAuth();


  return useMemo(() => {
    // Menu para usuários não autenticados
    if (!isAuthenticated) {
      return [
        {
          href: "/",
          label: "Home",
          iconType: "house" as IconType
        },
        {
          href: "/sign-in",
          label: "Fazer proposta",
          iconType: "send" as IconType
        }
      ];
    }

    // Menu base para usuários autenticados
    const menu: MenuItemData[] = [
      {
        href: "/",
        label: "Home",
        iconType: "house" as IconType
      }
    ];

    // Menu específico por role
    switch (userRole) {
      case 'owner':
        menu.push({
          href: `/proposalsreceives/${userId}`,
          label: "Propostas Recebidas",
          iconType: "fileText" as IconType
        });
        break;

      case 'manager':
        menu.push({
          href: "/aprovals",
          label: "Aprovações",
          iconType: "checkCircle" as IconType
        });
        break;

      case 'customer':
        menu.push({
          href: `/customerproposals/${userId}`,
          label: "Propostas",
          iconType: "fileText" as IconType
        });
        break;
    }

    return menu;
  }, [userRole, isAuthenticated, userId]);
}
