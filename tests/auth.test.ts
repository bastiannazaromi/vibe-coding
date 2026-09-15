import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { authRoutes } from "../src/routes/authRoutes";
import { usersRoutes } from "../src/routes/usersRoutes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("POST /api/auth/login", () => {
    const app = new Elysia().use(usersRoutes).use(authRoutes);
    const testEmail = "test_login@example.com";
    const testPassword = "password123";

    beforeEach(async () => {
        // Hapus data agar konsisten
        await db.delete(sessions);
        await db.delete(users);

        // Setup: Buat user untuk ditest
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Login User",
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );
    });

    it("Skenario Sukses: should successfully login with valid credentials and return token", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.message).toBe("Login successfully");
        expect(body.data).toHaveProperty("token");

        // Verify session is created in DB
        const sessionRecord = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, body.data.token));
        expect(sessionRecord.length).toBe(1);
    });

    it("Skenario Gagal - Password Salah: should fail login with wrong password", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testEmail,
                    password: "wrongpassword",
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(400);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Email atau password salah");
    });

    it("Skenario Gagal - Email Tidak Terdaftar: should fail login with non-existent email", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "notfound@example.com",
                    password: "password123",
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(400);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Email atau password salah");
    });

    it("Skenario Gagal - Input Kosong: should return validation error 422 if fields are missing", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testEmail,
                }),
            }),
        );

        expect(response.status).toBe(422);
    });
});
