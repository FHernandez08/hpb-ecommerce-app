import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool(
    process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    } : {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: Number(process.env.PG_PORT)
    }
)