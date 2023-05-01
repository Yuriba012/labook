import z from 'zod'

export interface PutLikeInputDTO {
    userId: string,
    postId: string,
    like: boolean
}

export const PutLikeInputSchema = z.object({
    userId: z.string().min(0),
    postId: z.string().min(0),
    like: z.boolean()
})