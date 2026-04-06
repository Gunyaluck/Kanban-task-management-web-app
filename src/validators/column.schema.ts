import { z } from "zod";

export const columnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50),
});