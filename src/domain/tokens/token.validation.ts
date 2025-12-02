import { z } from "zod";

export const createTokenSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
  expiresInMinutes: z
    .number()
    .int("expiresInMinutes must be an integer")
    .positive("expiresInMinutes must be positive"),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
