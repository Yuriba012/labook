import z from 'zod'

export interface CreatePostInputDTO {
    content: string,
    creatorId: string
}

export const CreatePostInputSchema = z.object({
    content: z.string().min(0),
    creatorId: z.string()
}).transform((data)=>data as CreatePostInputDTO)