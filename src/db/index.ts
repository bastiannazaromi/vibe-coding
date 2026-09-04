import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://admin:12345678@localhost:3306/vibe_coding";

export const connection = mysql.createPool(connectionString);
export const db = drizzle({ client: connection, schema, mode: "default" });
