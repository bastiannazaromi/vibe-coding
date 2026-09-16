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
                    example: "John Doe",
                }),
                email: t.String({
                    format: "email",
                    maxLength: 255,
                    error: "Format email tidak valid atau terlalu panjang",
                    example: "john@example.com",
                }),
                password: t.String({
                    minLength: 6,
                    maxLength: 255,
                    error: "Password minimal 6 karakter dan maksimal 255 karakter",
                    example: "password123",
                }),
            }),
            response: {
                200: t.Object({
                    status: t.Boolean({ example: true }),
                    message: t.String({ example: "User registered successfully" }),
                    data: t.Object({
                        id: t.Number({ example: 1 }),
                        name: t.String({ example: "John Doe" }),
                        email: t.String({ example: "john@example.com" }),
                    }),
                }),
                400: t.Object({
                    status: t.Boolean({ example: false }),
                    message: t.String({ example: "Email already exists" }),
                }),
            },
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
            response: {
                200: t.Object({
                    status: t.Boolean({ example: true }),
                    message: t.String({ example: "User ditemukan" }),
                    data: t.Object({
                        id: t.Number({ example: 1 }),
                        name: t.String({ example: "John Doe" }),
                        email: t.String({ example: "john@example.com" }),
                        created_at: t.Any({ example: "2026-09-15T10:00:00.000Z" }),
                    }),
                }),
                401: t.Object({
                    status: t.Boolean({ example: false }),
                    message: t.String({ example: "Unauthorized" }),
                }),
            },
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
            response: {
                200: t.Object({
                    status: t.Boolean({ example: true }),
                    message: t.String({ example: "Berhasil logout" }),
                }),
                401: t.Object({
                    status: t.Boolean({ example: false }),
                    message: t.String({ example: "Unauthorized" }),
                }),
            },
            detail: {
                tags: ["Users"],
                summary: "Logout pengguna dan menghapus sesi aktif",
            },
        },
    );
