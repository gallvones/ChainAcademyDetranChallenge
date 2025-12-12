
import { MainLayout } from "@/components/templates";
import { CardsGrid } from "@/components/organisms/cardsGrid";
import { getAllCars } from "./api/cars";

export default async function Home() {
  const cars = await getAllCars();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in-down">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] bg-clip-text text-transparent drop-shadow-lg">
            Bem-vindo ao Detran-SP
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore nossa coleção de veículos certificados em blockchain
          </p>
        </div>

        {/* Cars Grid */}
        <CardsGrid cars={cars} />
      </div>
    </MainLayout>
  );
}
