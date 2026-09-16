import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["candidate", "employer", "admin"]),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid work or personal email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Include at least one number" }),
  role: z.enum(["candidate", "employer"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service & Privacy Policy",
  }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const recoverSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export type RecoverFormValues = z.infer<typeof recoverSchema>;
