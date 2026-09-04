import { Elysia, t } from "elysia";
import { registerUser } from "../services/usersServices";

export const usersRoutes = new Elysia({ prefix: "/api" }).post(
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
  }
);
