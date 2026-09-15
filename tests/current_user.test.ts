import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { authRoutes } from "../src/routes/authRoutes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("GET /api/users/current", () => {
    const app = new Elysia().use(usersRoutes).use(authRoutes);
    const testEmail = "current_user_test@example.com";
    const testPassword = "password123";
    let token = "";

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
                    name: "Current User",
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );

        // Login untuk mendapatkan token
        const loginRes = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );
        const loginBody: any = await loginRes.json();
        token = loginBody.data.token;
    });

    it("Skenario Sukses: should successfully return current user data when valid token is provided", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.message).toBe("User ditemukan");
        expect(body.data.name).toBe("Current User");
        expect(body.data.email).toBe(testEmail);
    });

    it("Skenario Gagal - Tanpa Token: should fail when no authorization header is provided", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });

    it("Skenario Gagal - Token Invalid/Kadaluarsa: should fail when invalid token is provided", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
                headers: {
                    Authorization: "Bearer token_invalid_123",
                },
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });
});
