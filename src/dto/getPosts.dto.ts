export interface GetPostsOutputDTO{
    id: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string,
    creator: {
      id: string;
      name: string;
    }
}