import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For Supabase on Vercel: use Session pooler here (migrations).
    url: env("DIRECT_URL"),
  },
});

