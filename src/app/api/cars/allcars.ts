import { connectToDatabase } from '@/lib';
import Car from '@/models/Car';

export async function getAllCars() {
  await connectToDatabase();

  const cars = await Car.find({})
    .populate('owner', 'name email role')
    .populate('manager', 'name email role region')
    .lean();

  return cars;
}
