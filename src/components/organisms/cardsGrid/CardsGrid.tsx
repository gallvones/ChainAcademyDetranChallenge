"use client";

import { useRouter } from "next/navigation";
import { CardCart } from "@/components/molecules/cardCart";
import { AuthModal } from "@/components/molecules/authModal";
import { useAuth } from "@/hooks";
import { useState, useEffect } from "react";

interface CardsGridProps {
  cars: any[];
}

export function CardsGrid({ cars }: CardsGridProps) {
  const router = useRouter();
  const { requireAuth, isAuthenticated, showAuthModal, closeAuthModal } = useAuth();
  const [pendingCarId, setPendingCarId] = useState<string | null>(null);

  const handleCardClick = (carId: string) => {
    // Verifica autenticação antes de navegar
    if (!requireAuth()) {
      // Salva o ID do carro para navegar após login
      setPendingCarId(carId);
      return;
    }

    // Se autenticado, navega direto
    router.push(`/newproposal/${carId}`);
  };

  // Navega para o carro pendente quando o usuário se autentica
  useEffect(() => {
    if (isAuthenticated && pendingCarId) {
      router.push(`/newproposal/${pendingCarId}`);
      setPendingCarId(null);
    }
  }, [isAuthenticated, pendingCarId, router]);

  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Nenhum veículo encontrado no momento.
        </p>
      </div>
    );
  }

  const handleAuthSuccess = () => {
    closeAuthModal();
    window.location.reload();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 animate-fade-in-up">
        {cars.map((car: any) => (
          <CardCart
            key={car._id.toString()}
            id={car._id.toString()}
            name={car.name}
            chassi={car.chassi}
            year={car.info?.year}
            color={car.info?.color}
            img={car.img}
            model={car.info?.model}
            plates={car.info?.plates}
            ownerName={car.owner?.name}
            managerName={car.manager?.name}
            uf={car.uf}
            variant="light"
            onButtonClick={() => handleCardClick(car._id.toString())}
          />
        ))}
      </div>

      {/* AuthModal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
