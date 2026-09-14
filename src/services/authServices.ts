import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export interface LoginUserInput {
    email?: string;
    password?: string;
}

export async function loginUser(input: LoginUserInput) {
    const { email, password } = input;

    if (!email || !password) {
        throw new Error("Email atau password salah");
    }

    // Find user by email
    const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUsers.length === 0) {
        throw new Error("Email atau password salah");
    }

    const user = existingUsers[0];
    if (!user) {
        throw new Error("Email atau password salah");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Email atau password salah");
    }

    // Generate UUID token
    const token = crypto.randomUUID();

    // Insert session
    await db.insert(sessions).values({
        token,
        userId: user.id,
    });

    return {
        token,
    };
}
