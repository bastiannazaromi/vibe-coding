import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("POST /api/users validation and business logic", () => {
    const app = new Elysia().use(usersRoutes);

    beforeEach(async () => {
        // Hapus data agar konsisten
        await db.delete(sessions);
        await db.delete(users);
    });

    it("Skenario Sukses: should successfully register a new user", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password123",
                }),
            }),
        );

        const body: any = await response.json();
        expect(response.status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.message).toBe("User registered successfully");
        expect(body.data).toHaveProperty("id");
        expect(body.data.name).toBe("John Doe");
        expect(body.data.email).toBe("john@example.com");
    });

    it("Skenario Gagal - Duplikasi: should return error 400 if email already exists", async () => {
        // Register first user
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Alice",
                    email: "duplicate@example.com",
                    password: "password123",
                }),
            }),
        );

        // Register second user with same email
        const response2 = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Bob",
                    email: "duplicate@example.com",
                    password: "password123",
                }),
            }),
        );

        const body2: any = await response2.json();
        expect(response2.status).toBe(400);
        expect(body2.status).toBe(false);
        expect(body2.message).toBe("Email already exists");
    });

    it("Skenario Gagal - Validasi Input Kosong: should return error 422 if required fields are missing", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Test User" }),
            }),
        );

        expect(response.status).toBe(422);
    });

    it("Skenario Gagal - Format Invalid: should return error 422 if name exceeds 255 characters", async () => {
        const longName = "a".repeat(300);
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: longName,
                    email: "valid@example.com",
                    password: "password123",
                }),
            }),
        );

        expect(response.status).toBe(422);
    });

    it("Skenario Gagal - Format Invalid: should return error 422 if email format is invalid", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Valid Name",
                    email: "invalid-email-format",
                    password: "password123",
                }),
            }),
        );

        expect(response.status).toBe(422);
    });

    it("Skenario Gagal - Format Invalid: should return error 422 if password is less than 6 characters", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Valid Name",
                    email: "valid@example.com",
                    password: "123",
                }),
            }),
        );

        expect(response.status).toBe(422);
    });
});
