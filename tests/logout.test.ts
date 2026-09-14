import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { authRoutes } from "../src/routes/authRoutes";
import { db } from "../src/db";
import { sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("GET /api/users/logout integration test", () => {
    const app = new Elysia().use(usersRoutes).use(authRoutes);
    const testEmail = `logout_user_${Date.now()}@example.com`;
    const testPassword = "rahasia_password";
    let token = "";

    it("should setup user and login to obtain token", async () => {
        // Register
        const regRes = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Logout User Test",
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );
        expect(regRes.status).toBe(200);

        // Login
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
        expect(loginRes.status).toBe(200);
        expect(loginBody.status).toBe(true);
        expect(loginBody.data.token).toBeDefined();
        token = loginBody.data.token;
    });

    it("should fail when no authorization header is provided", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
            }),
        );

        const body: any = await res.json();
        expect(res.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });

    it("should fail when invalid token is provided", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: "Bearer invalid_token_12345",
                },
            }),
        );

        const body: any = await res.json();
        expect(res.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });

    it("should successfully logout when valid token is provided and delete session record", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        const body: any = await res.json();
        expect(res.status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.message).toBe("Berhasil logout");

        // Verify session is deleted from database
        const dbSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token));

        expect(dbSessions.length).toBe(0);
    });

    it("should fail on second logout attempt with the same token", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        );

        const body: any = await res.json();
        expect(res.status).toBe(401);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Unauthorized");
    });
});
