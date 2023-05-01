import z from "zod";

export interface EditPostInputDTO {
  idToEdit: string;
  newContent: string;
}

export const EditPostInputSchema = z
  .object({
    idToEdit: z.string(),
    newContent: z.string().min(0),
  })
  .transform((data) => data as EditPostInputDTO);
