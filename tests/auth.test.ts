import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { authRoutes } from "../src/routes/authRoutes";
import { db } from "../src/db";
import { sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("POST /api/auth/login integration test", () => {
    const app = new Elysia().use(usersRoutes).use(authRoutes);
    const testEmail = `auth_test_${Date.now()}@example.com`;
    const testPassword = "rahasia_password";

    it("should setup test user", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Auth Test User",
                    email: testEmail,
                    password: testPassword,
                }),
            }),
        );
        expect(response.status).toBe(200);
    });

    it("should fail login with wrong password", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testEmail,
                    password: "wrong_password",
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(400);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Email atau password salah");
    });

    it("should fail login with non-existent email", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "nonexistent@example.com",
                    password: testPassword,
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(400);
        expect(body.status).toBe(false);
        expect(body.message).toBe("Email atau password salah");
    });

    it("should successfully login with valid credentials and return token", async () => {
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
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();

        // Verify session record in database
        const dbSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, body.data.token))
            .limit(1);

        expect(dbSessions.length).toBe(1);
        expect(dbSessions[0]?.token).toBe(body.data.token);
    });
});
