import { connectToDatabase } from "@/lib";
import Car from "@/models/Car";

export async function getAllCars() {
  await connectToDatabase();

  const cars = await Car.find({})
    .populate("owner", "name email role")
    .populate("manager", "name email role region")
    .lean();

  // Função de priorização de cores
  const getColorPriority = (color: string | undefined): number => {
    if (!color) return 999; // Sem cor vai pro final

    const normalizedColor = color.toLowerCase().trim();

    // Prioridade: preto = 1, amarelo = 2, azul = 3, outros = 999
    if (normalizedColor.includes('pret') || normalizedColor === 'black') return 1;
    if (normalizedColor.includes('amar') || normalizedColor === 'yellow') return 2;
    if (normalizedColor.includes('azul') || normalizedColor === 'blue') return 3;

    return 999; // Outras cores
  };

  // Ordenar carros por prioridade de cor
  const sortedCars = cars.sort((a: any, b: any) => {
    const priorityA = getColorPriority(a.info?.color);
    const priorityB = getColorPriority(b.info?.color);
    return priorityA - priorityB;
  });

  return sortedCars;
}
