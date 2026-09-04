import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/usersRoutes";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("POST /api/users integration test", () => {
  const app = new Elysia().use(usersRoutes);
  const testEmail = `test_${Date.now()}@example.com`;

  it("should successfully register a new user in database", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Bastian Nazaromi",
          email: testEmail,
          password: "rahasia",
        }),
      })
    );

    const body: any = await response.json();
    console.log("Register response:", JSON.stringify(body));

    expect(response.status).toBe(200);
    expect(body.status).toBe(true);
    expect(body.message).toBe("User registered successfully");
    expect(body.data.email).toBe(testEmail);
    expect(body.data.id).toBeDefined();

    // Verify record in database
    const dbUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    expect(dbUsers.length).toBe(1);
    expect(dbUsers[0].name).toBe("Bastian Nazaromi");
  });

  it("should fail when registering duplicate email", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Bastian Nazaromi",
          email: testEmail,
          password: "rahasia",
        }),
      })
    );

    const body: any = await response.json();
    expect(response.status).toBe(400);
    expect(body.status).toBe(false);
    expect(body.message).toBe("Email already exists");
  });
});
