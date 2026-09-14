import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, sessions } from "../db/schema";

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

export async function getCurrentUser(token: string) {
    if (!token) {
        throw new Error("Unauthorized");
    }

    // Find session by token
    const sessionList = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

    const session = sessionList[0];
    if (!session || !session.userId) {
        throw new Error("Unauthorized");
    }

    // Find user by userId
    const userList = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    const user = userList[0];
    if (!user) {
        throw new Error("Unauthorized");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
    };
}

export async function logoutUser(token: string) {
    if (!token) {
        throw new Error("Unauthorized");
    }

    // Find session by token
    const sessionList = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

    const session = sessionList[0];
    if (!session) {
        throw new Error("Unauthorized");
    }

    // Delete session from database
    await db.delete(sessions).where(eq(sessions.token, token));

    return true;
}
