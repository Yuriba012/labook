import { PostsDatabase } from "../database/PostsDatabase";
import { CreatePostInputDTO } from "../dto/createPost.dto";
import { EditPostInputDTO } from "../dto/editPost.dto";
import { GetPostsOutputDTO } from "../dto/getPosts.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { Post } from "../models/Post";
import { EditedPostToDB, PostInputDB, PostOutputDB } from "../types/PostDB";

export class PostsBusiness {
  constructor(private postsDatabase: PostsDatabase) {}

  public getPosts = async (query: string | undefined) => {
    const posts: PostOutputDB[] = await this.postsDatabase.getPosts(query);

    const checkedPosts: Post[] = posts.map(
      (post) =>
        new Post(
          post.id,
          post.content,
          post.likes,
          post.dislikes,
          post.created_at,
          post.updated_at,
          { id: post.creator_id, name: post.name }
        )
    );

    const output: GetPostsOutputDTO[] = checkedPosts.map((post) => {
      return {
        id: post.getId(),
        content: post.getContent(),
        likes: post.getLikes(),
        dislikes: post.getDislikes(),
        createdAt: post.getCreatedAt(),
        updatedAt: post.getUpdatedAt(),
        creator: post.getCreator(),
      };
    });
    return output;
  };

  public createPost = async (input: CreatePostInputDTO) => {
    const newPost: PostInputDB = {
        id: JSON.stringify(Date.now()),
        creator_id: input.creatorId,
        content: input.content
    }

    const postExists = await this.postsDatabase.getPostByIdRaw(newPost.id)

    if(postExists){
        throw new BadRequestError("Post já existe.")
    }

    await this.postsDatabase.createPost(newPost);
  }

  public editPost= async (input: EditPostInputDTO) =>{
    
    const {idToEdit, newContent} = input;

    if (!input.idToEdit){
        throw new BadRequestError("Post não existente.")
    }

    const inputDB: EditedPostToDB = {
        idToEdit,
        newPost: {
            content: newContent,
            updated_at: new Date().toISOString()
        }
    }
    await this.postsDatabase.editPost(inputDB);

  }
}
