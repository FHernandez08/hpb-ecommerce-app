import { email, z } from "zod";

const registerSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters!"),
    first_name: z.string().trim().optional(),
    last_name: z.string().trim().optional()
}).strict();

export default registerSchema;