import * as z from "zod";

export const UserSchema = z.object({
    id: z.uuid(),
    role: z.enum(["user", "admin"]),
    email: z.email().trim(),
    password_hash: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    avatar_url: z.string().nullable(),
    provider: z.enum(["local", "google", "facebook", "microsoft"]).optional(),
    provider_id: z.string(),
    last_login: z.coerce.date().nullable(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional()
});

export const UserResponseSchema = UserSchema.omit({
    password_hash: true
});

export const LoginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(1, "Password is required!")
}).strict();

export const RegisterSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(8, "Password must be at least 8 characters!"),
    first_name: z.string().trim().optional(),
    last_name: z.string().trim().optional()
}).strict();

// Inferred Types
export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;