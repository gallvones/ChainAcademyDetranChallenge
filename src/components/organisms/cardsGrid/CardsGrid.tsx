"use client";

import { useRouter } from "next/navigation";
import { CardCart } from "@/components/molecules/cardCart";
import { AuthModal } from "@/components/molecules/authModal";
import { useAuth } from "@/hooks";
import type { CatalogCar } from "@/types/car";

interface CardsGridProps {
  cars: CatalogCar[];
}

export function CardsGrid({ cars }: CardsGridProps) {
  const router = useRouter();
  const { requireAuth, showAuthModal, closeAuthModal } = useAuth();

  const handleCardClick = (carId: string) => {
    if (!requireAuth()) {
      return;
    }

    router.push(`/newproposal/${carId}`);
  };

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cars.map((car, i) => (
          <div
            key={car.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <CardCart
              id={car.id}
              name={car.name}
              chassi={car.chassi}
              img={car.img}
              index={i}
              onClick={() => handleCardClick(car.id)}
              onButtonClick={() => handleCardClick(car.id)}
            />
          </div>
        ))}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
