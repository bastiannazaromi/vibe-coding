import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export interface RegisterUserInput {
    name?: string;
    email?: string;
    password?: string;
}

/**
 * Mendaftarkan akun pengguna baru ke dalam sistem.
 *
 * Fungsi ini akan:
 * 1. Memvalidasi ketersediaan input.
 * 2. Mengecek apakah email sudah terdaftar sebelumnya.
 * 3. Melakukan hashing pada password menggunakan bcrypt.
 * 4. Menyimpan data pengguna baru ke database.
 *
 * @param input Data registrasi (nama, email, password)
 * @returns Objek berisi id, nama, dan email pengguna yang baru dibuat
 * @throws Error apabila input tidak lengkap atau email sudah digunakan
 */
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

/**
 * Mengambil data profil pengguna yang sedang login berdasarkan token.
 *
 * Fungsi ini akan:
 * 1. Mengecek ketersediaan token.
 * 2. Mencari data sesi di tabel sessions berdasarkan token tersebut.
 * 3. Mencari data pengguna terkait di tabel users berdasarkan userId dari sesi.
 *
 * @param token Token otentikasi Bearer (biasanya dari header HTTP)
 * @returns Data profil pengguna saat ini (id, nama, email, created_at)
 * @throws Error "Unauthorized" jika token tidak valid, kosong, atau sesi tidak ditemukan
 */
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

/**
 * Menghapus sesi pengguna untuk proses logout.
 *
 * Fungsi ini akan:
 * 1. Memastikan token tersedia.
 * 2. Mengecek apakah token tersebut valid dan ada di tabel sessions.
 * 3. Menghapus record sesi tersebut dari database, sehingga token tidak lagi berlaku.
 *
 * @param token Token otentikasi Bearer yang akan di-logout
 * @returns Boolean true jika proses penghapusan sesi berhasil
 * @throws Error "Unauthorized" jika token kosong atau sesi tidak ditemukan
 */
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
