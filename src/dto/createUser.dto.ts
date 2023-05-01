import z from "zod";

export interface CreateUserInputDTO {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateUserOutputDTO {
  message: string;
  user: {
    id: string;
    name: string;
    createdAt: string;
  };
}

export const CreateUserInputSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/, {
        message: "A senha deve conter caracteres numéricos e alfanuméricos.",
      }),
    role: z.string().min(2),
  })
  .transform((data) => data as CreateUserInputDTO);
