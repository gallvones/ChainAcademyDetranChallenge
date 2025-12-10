import { Header } from '@/components/organisms/header';
import { Body } from '@/components/organisms/body';
import { Footer } from '@/components/organisms/footer';
import logoFria from '@/../public/images/logoFria.png';
import Image from 'next/image';
import { Compass, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
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
          <h1 className="text-4xl font-bold">Bem-vindo à ChainAcademy</h1>
          <p className="text-lg text-gray-600">
            Sua plataforma de aprendizado em blockchain e tecnologias descentralizadas.
          </p>
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
