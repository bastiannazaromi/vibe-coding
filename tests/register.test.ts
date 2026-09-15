import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";

describe("POST /api/users validation", () => {
    const app = new Elysia().use(usersRoutes);

    it("should return validation error 422 if required fields are missing", async () => {
        const response = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Test User" }),
            }),
        );

        expect(response.status).toBe(422);
    });

    it("should return validation error 422 if name exceeds 255 characters", async () => {
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

    it("should return validation error 422 if email format is invalid", async () => {
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

    it("should return validation error 422 if password is less than 6 characters", async () => {
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
