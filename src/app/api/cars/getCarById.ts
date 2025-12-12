import { connectToDatabase } from "@/lib";
import Car from "@/models/Car";

export async function getCarById(id: string) {
  await connectToDatabase();

  const car = await Car.findById(id)
    .populate("owner", "name email role")
    .populate("manager", "name email role region")
    .lean();

  if (!car) {
    return null;
  }

  // Serializar dados para Client Components (converter ObjectIds em strings)
  const serializedCar = {
    ...car,
    _id: car._id.toString(),
    owner: car.owner ? {
      ...car.owner,
      _id: car.owner._id.toString(),
    } : null,
    manager: car.manager ? {
      ...car.manager,
      _id: car.manager._id.toString(),
    } : null,
  };

  return serializedCar;
}
