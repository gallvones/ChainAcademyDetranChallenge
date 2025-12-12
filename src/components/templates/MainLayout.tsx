"use client";

import { Header } from "@/components/organisms/header";
import { Body } from "@/components/organisms/body";
import { Footer } from "@/components/organisms/footer";
import { UserMenu } from "@/components/molecules/userMenu";
import { useHeaderMenu, type IconType } from "@/hooks";
import logoFria from "@/../public/images/logoFria.png";
import Image from "next/image";
import Link from "next/link";
import { House, FileText, CheckCircle, Send } from "lucide-react";

// Função helper para mapear iconType para componente React
function getMenuIcon(iconType: IconType) {
  const iconMap: Record<IconType, React.ReactElement> = {
    house: <House className="w-5 h-5" />,
    fileText: <FileText className="w-5 h-5" />,
    checkCircle: <CheckCircle className="w-5 h-5" />,
    send: <Send className="w-5 h-5" />,
  };
  return iconMap[iconType];
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const menuData = useHeaderMenu();

  // Mapear dados para incluir ícones
  const menuItems = menuData.map((item) => ({
    href: item.href,
    label: item.label,
    icon: getMenuIcon(item.iconType),
  }));

  return (
    <>
      <Header
        logo={
          <Link href="/">
            <Image
              src={logoFria}
              alt="ChainAcademy Logo"
              width={80}
              height={20}
              className="rounded-lg object-cover cursor-pointer"
            />
          </Link>
        }
        menu={menuItems}
        variant="amber"
        textColor="black"
        iconColor="black"
        rightSlot={<UserMenu />}
      />

      <Body variant="light" padding="large">
        {children}
      </Body>

      <Footer
        logo={
          <Image
            src={logoFria}
            alt="ChainAcademy Logo"
            width={100}
            height={100}
            className="rounded-lg object-cover"
          />
        }
        variant="amber"
        textColor="black"
      />
    </>
  );
}
