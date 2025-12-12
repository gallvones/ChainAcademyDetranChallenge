import { Header } from '@/components/organisms/header';
import { Body } from '@/components/organisms/body';
import { Footer } from '@/components/organisms/footer';
import { CardsGrid } from '@/components/organisms/cardsGrid';
import logoFria from '@/../public/images/logoFria.png';
import Image from 'next/image';
import { Compass, FileText } from 'lucide-react';
import Link from 'next/link';
import { getAllCars } from './api/cars';

export default async function Home() {
  const cars = await getAllCars();

  return (
    <>
      <Header
        logo={
          <Link href="/">
            <Image src={logoFria} alt="ChainAcademy Logo" width={80} height={20} className="rounded-lg object-cover cursor-pointer" />
          </Link>
        }
        menu={[
          { href: '/', label: 'Explorar', icon: <Compass className="w-5 h-5" /> },
          { href: '/myrequests', label: 'Minhas propostas', icon: <FileText className="w-5 h-5" /> },
          {href: '/proposalsreceives', label: 'Propostas recebidas', icon: <FileText className="w-5 h-5" />},

        ]}
        variant="amber"
        textColor="black"
        iconColor="black"
      />

      <Body variant="light" padding="large">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-fade-in-down">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] bg-clip-text text-transparent drop-shadow-lg">
              Bem-vindo à ChainAcademy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore nossa coleção de veículos certificados em blockchain
            </p>
          </div>

          {/* Cars Grid */}
          <CardsGrid cars={cars} />
        </div>
      </Body>

      <Footer
        logo={<Image src={logoFria} alt="ChainAcademy Logo" width={100} height={100} className="rounded-lg object-cover" />}
        variant="amber"
        textColor="black"
      />
    </>
  );
}
