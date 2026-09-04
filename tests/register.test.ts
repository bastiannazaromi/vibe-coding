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
      })
    );

    expect(response.status).toBe(422);
  });
});
