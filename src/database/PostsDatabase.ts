import { EditedPostToDB, PostInputDB, PostOutputDB, PostRawDB } from "../types/PostDB";
import { BaseDatabase } from "./BaseDatabase";

export class PostsDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_USERS = "users";

  public getPosts = async (
    query: string | undefined
  ): Promise<PostOutputDB[]> => {
    let postsDB;

    if (query) {
      const result: PostOutputDB[] = await BaseDatabase.connection
        .select(
          "posts.id",
          "posts.content",
          "posts.likes",
          "posts.dislikes",
          "posts.created_at",
          "posts.uploaded_at",
          "posts.creator_id",
          "users.name"
        )
        .from(PostsDatabase.TABLE_POSTS)
        .leftJoin(PostsDatabase.TABLE_USERS, (post_user) => {
          post_user.on("posts.creator_id", "=", "users.id");
        })
        .where("content", "LIKE", `%${query}%`);

      postsDB = result;
    } else {
      const result: PostOutputDB[] = await BaseDatabase.connection
        .select(
          "posts.id",
          "posts.content",
          "posts.likes",
          "posts.dislikes",
          "posts.created_at",
          "posts.updated_at",
          "posts.creator_id",
          "users.name"
        )
        .from(PostsDatabase.TABLE_POSTS)
        .leftJoin(PostsDatabase.TABLE_USERS, (post_user) => {
          post_user.on("posts.creator_id", "=", "users.id");
        });
      postsDB = result;
    }

    return postsDB;
  };

  public createPost = async (newPost: PostInputDB):Promise<void>=>{
    await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).insert(newPost);
  }


    public getPostByIdWithName = async (id: string): Promise<PostOutputDB|undefined> => {
        const [postDB]: PostOutputDB[] = await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).select(
            "posts.id",
            "posts.content",
            "posts.likes",
            "posts.dislikes",
            "posts.created_at",
            "posts.updated_at",
            "posts.creator_id",
            "users.name"
          )
          .from(PostsDatabase.TABLE_POSTS)
          .leftJoin(PostsDatabase.TABLE_USERS, (post_user) => {
            post_user.on("posts.creator_id", "=", "users.id");
          }).where({id})

        return postDB;
    }

    public getPostByIdRaw = async (id: string): Promise<PostRawDB|undefined> => {

        const [postDB]: PostRawDB[] = await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).where({id})

        return postDB;
    }

    public editPost = async (input: EditedPostToDB):Promise<void> => {
        const {idToEdit, newPost} = input

        await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).update(newPost).where({id: idToEdit})
    }

}
