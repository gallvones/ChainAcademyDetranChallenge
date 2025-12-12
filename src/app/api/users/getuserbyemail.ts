import { connectToDatabase } from "@/lib";
import User from "@/models/User";

export async function getUserByEmail(email: string) {
  await connectToDatabase();

  const user = await User.findOne({ email: email.toLowerCase() }).lean();

  return user;
}
