import { Elysia, t } from "elysia";
import {
    registerUser,
    getCurrentUser,
    logoutUser,
} from "../services/usersServices";

function getBearerToken(headers: Record<string, string | undefined>): string {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
        throw new Error("Unauthorized");
    }
    return token;
}

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
                name: t.String({
                    minLength: 1,
                    maxLength: 255,
                    error: "Name harus diisi dan maksimal 255 karakter",
                }),
                email: t.String({
                    format: "email",
                    maxLength: 255,
                    error: "Format email tidak valid atau terlalu panjang",
                }),
                password: t.String({
                    minLength: 6,
                    maxLength: 255,
                    error: "Password minimal 6 karakter dan maksimal 255 karakter",
                }),
            }),
            detail: {
                tags: ["Users"],
                summary: "Registrasi pengguna baru",
            },
        },
    )
    .get(
        "/users/current",
        async ({ headers, set }) => {
            try {
                const token = getBearerToken(headers);
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
        },
        {
            detail: {
                tags: ["Users"],
                summary: "Mendapatkan profil pengguna yang sedang login",
            },
        },
    )
    .get(
        "/users/logout",
        async ({ headers, set }) => {
            try {
                const token = getBearerToken(headers);
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
        },
        {
            detail: {
                tags: ["Users"],
                summary: "Logout pengguna dan menghapus sesi aktif",
            },
        },
    );
