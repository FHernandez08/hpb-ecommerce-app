import { z } from "zod";

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1, "Password is required!")
}).strict();

export default loginSchema;