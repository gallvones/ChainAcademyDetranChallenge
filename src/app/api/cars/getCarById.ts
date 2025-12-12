import { connectToDatabase } from "@/lib";
import Car from "@/models/Car";

export async function getCarById(id: string) {
  await connectToDatabase();

  const car = await Car.findById(id)
    .populate("owner", "name email role")
    .populate("manager", "name email role region")
    .lean();

  return car;
}
