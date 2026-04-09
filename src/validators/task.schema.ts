import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(100),
  description: z.string().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional(),
});