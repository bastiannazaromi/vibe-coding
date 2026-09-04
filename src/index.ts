import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({
    status: "success",
    message: "Welcome to ElysiaJS + Bun + Drizzle + MySQL API",
  }))
  .get("/users", async ({ set }) => {
    try {
      const allUsers = await db.select().from(users);
      return {
        status: "success",
        data: allUsers,
      };
    } catch (error: any) {
      set.status = 500;
      return {
        status: "error",
        message: "Failed to fetch users from database",
        error: error?.message || String(error),
      };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`
);
