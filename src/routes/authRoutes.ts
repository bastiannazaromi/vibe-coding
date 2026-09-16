import { Elysia, t } from "elysia";
import { loginUser } from "../services/authServices";

export const authRoutes = new Elysia({ prefix: "/api" }).post(
    "/auth/login",
    async ({ body, set }) => {
        try {
            const result = await loginUser(body);
            return {
                status: true,
                message: "Login successfully",
                data: result,
            };
        } catch (error: any) {
            set.status = 400;
            return {
                status: false,
                message: error?.message || "Email atau password salah",
            };
        }
    },
    {
        body: t.Object({
            email: t.String({ example: "john@example.com" }),
            password: t.String({ example: "password123" }),
        }),
        response: {
            200: t.Object({
                status: t.Boolean({ example: true }),
                message: t.String({ example: "Login successfully" }),
                data: t.Object({
                    token: t.String({ example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" }),
                }),
            }),
            400: t.Object({
                status: t.Boolean({ example: false }),
                message: t.String({ example: "Email atau password salah" }),
            }),
        },
        detail: {
            tags: ["Auth"],
            summary: "Login pengguna dan membuat token sesi baru",
        },
    },
);
