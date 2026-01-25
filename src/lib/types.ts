import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    // passcode removed for Magic Link flow
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const GameStateSchema = z.object({
    unlockedComponentIds: z.string(),
    isCompleted: z.boolean(),
    // Add other fields as needed for the frontend state
});
