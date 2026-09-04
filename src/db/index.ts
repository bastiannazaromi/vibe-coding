import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:root@localhost:3306/vibe_db";

export const connection = mysql.createPool(connectionString);
export const db = drizzle({ client: connection, schema, mode: "default" });
