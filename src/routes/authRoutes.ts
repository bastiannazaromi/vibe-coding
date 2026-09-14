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
            email: t.String(),
            password: t.String(),
        }),
    },
);
