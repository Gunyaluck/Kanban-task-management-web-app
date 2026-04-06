import { z } from "zod";

export const boardSchema = z.object({
  name: z.string().min(1, "Board name is required").max(100),
  description: z.string().max(255).optional(),
  color: z.string().optional(),
});