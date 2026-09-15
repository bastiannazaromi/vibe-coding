import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { authRoutes } from "../src/routes/authRoutes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("GET /api/users/logout", () => {
    const app = new Elysia().use(usersRoutes).use(authRoutes);
    const testEmail = "logout_test@example.com";
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
                    name: "Logout User",
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

    it("Skenario Sukses: should successfully logout when valid token is provided and delete session record", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.message).toBe("Berhasil logout");

        // Verify session is deleted from database
        const dbSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token));
        expect(dbSessions.length).toBe(0);
    });

    it("Skenario Gagal - Logout Berulang: should fail on second logout attempt with the same token", async () => {
        // First logout
        await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        // Second logout
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });

    it("Skenario Gagal - Tanpa Token / Token Invalid: should fail when no authorization header is provided", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });

    it("Skenario Gagal - Tanpa Token / Token Invalid: should fail when invalid token is provided", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: "Bearer invalid_token_12345",
                },
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });
});
