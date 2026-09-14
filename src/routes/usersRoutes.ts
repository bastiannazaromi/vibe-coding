import { Elysia, t } from "elysia";
import {
    registerUser,
    getCurrentUser,
    logoutUser,
} from "../services/usersServices";

export const usersRoutes = new Elysia({ prefix: "/api" })
    .post(
        "/users",
        async ({ body, set }) => {
            try {
                const newUser = await registerUser(body);
                return {
                    status: true,
                    message: "User registered successfully",
                    data: newUser,
                };
            } catch (error: any) {
                set.status = 400;
                return {
                    status: false,
                    message: error?.message || "Registration failed",
                };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                email: t.String(),
                password: t.String(),
            }),
        },
    )
    .get("/users/current", async ({ headers, set }) => {
        try {
            const authHeader = headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                set.status = 401;
                return {
                    status: false,
                    message: "Unauthorized",
                };
            }

            const token = authHeader.substring(7).trim();
            const currentUser = await getCurrentUser(token);

            return {
                status: true,
                message: "User ditemukan",
                data: currentUser,
            };
        } catch (error: any) {
            set.status = 401;
            return {
                status: false,
                message: "Unauthorized",
            };
        }
    })
    .get("/users/logout", async ({ headers, set }) => {
        try {
            const authHeader = headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                set.status = 401;
                return {
                    status: false,
                    message: "Unauthorized",
                };
            }

            const token = authHeader.substring(7).trim();
            await logoutUser(token);

            return {
                status: true,
                message: "Berhasil logout",
            };
        } catch (error: any) {
            set.status = 401;
            return {
                status: false,
                message: "Unauthorized",
            };
        }
    });
