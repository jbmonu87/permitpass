import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 4000))
    .pipe(z.number().int().positive()),
  DATABASE_PATH: z.string().default("./data/permitpass.db")
});

const parsed = envSchema.parse(process.env);

export const appEnv = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  databasePath: parsed.DATABASE_PATH
};
