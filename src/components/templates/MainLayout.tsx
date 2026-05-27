"use client";

import { Header } from "@/components/organisms/header";
import { Body } from "@/components/organisms/body";
import { Footer } from "@/components/organisms/footer";
import { UserMenu } from "@/components/molecules/userMenu";
import logoFria from "@/../public/images/logoFria.png";
import Image from "next/image";
import Link from "next/link";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
        logo={
          <Link href="/" aria-label="Início">
            <Image
              src={logoFria}
              alt="Detran SP"
              width={100}
              height={100}
              className="rounded-xl object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </Link>
        }
        rightSlot={<UserMenu />}
      />

      <Body padding="large">{children}</Body>

      <Footer
        logo={
          <Image
            src={logoFria}
            alt="Detran SP"
            width={100}
            height={100}
            className="object-cover"
          />
        }
      />
    </>
  );
}
