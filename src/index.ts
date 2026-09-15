import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db";
import { users } from "./db/schema";
import { usersRoutes } from "./routes/usersRoutes";
import { authRoutes } from "./routes/authRoutes";

const app = new Elysia()
    .use(
        swagger({
            path: "/swagger",
            documentation: {
                info: {
                    title: "Vibe Coding API Documentation",
                    version: "1.0.0",
                    description:
                        "Dokumentasi API interaktif untuk autentikasi dan manajemen user",
                },
            },
        }),
    )
    .use(usersRoutes)
    .use(authRoutes)
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
    `🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`,
);
