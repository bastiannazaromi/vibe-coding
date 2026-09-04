import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";

export interface RegisterUserInput {
  name?: string;
  email?: string;
  password?: string;
}

export async function registerUser(input: RegisterUserInput) {
  const { name, email, password } = input;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Check if email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const [result] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: result.insertId,
    name,
    email,
  };
}
