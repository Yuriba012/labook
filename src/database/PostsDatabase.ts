import { InputLike } from "../types/InputLike";
import { LikeDB } from "../types/LikeDB";
import {
  EditedPostToDB,
  PostInputDB,
  PostOutputDB,
  PostRawDB,
} from "../types/PostDB";
import { BaseDatabase } from "./BaseDatabase";

export class PostsDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_USERS = "users";
  public static TABLE_LIKES_DISLIKES = "likes_dislikes";

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

  public createPost = async (newPost: PostInputDB): Promise<void> => {
    await BaseDatabase.connection(PostsDatabase.TABLE_POSTS).insert(newPost);
  };

  public getPostByIdWithName = async (
    id: string
  ): Promise<PostOutputDB | undefined> => {
    const [postDB]: PostOutputDB[] = await BaseDatabase.connection(
      PostsDatabase.TABLE_POSTS
    )
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
      })
      .where({ id });

    return postDB;
  };

  public getPostByIdRaw = async (
    id: string
  ): Promise<PostRawDB | undefined> => {
    const [postDB]: PostRawDB[] = await BaseDatabase.connection(
      PostsDatabase.TABLE_POSTS
    ).where({ id });

    return postDB;
  };

  public editPost = async (input: EditedPostToDB): Promise<void> => {
    const { idToEdit, newPost } = input;

    await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
      .update(newPost)
      .where({ id: idToEdit });
  };

  public async getLike(input: InputLike): Promise<InputLike | undefined> {
    const { userId, postId } = input;

    let output: InputLike | undefined;

    const [likeDB]: LikeDB[] | undefined = await BaseDatabase.connection(
      PostsDatabase.TABLE_LIKES_DISLIKES
    ).where({ user_id: userId, post_id: postId });

    if (!likeDB) {
      output = likeDB;
    } else {
      output = {
        userId: likeDB.user_id,
        postId: likeDB.post_id,
        like: !!likeDB.like,
      };
    }
    return output;
  }

  public async createLike(input: InputLike): Promise<void> {
    const { userId, postId, like } = input;

    const likeDB: LikeDB = {
      user_id: userId,
      post_id: postId,
      like: +like,
    };

    await BaseDatabase.connection(PostsDatabase.TABLE_LIKES_DISLIKES).insert(
      likeDB
    );
  }

  public async addLikeInPost(input: InputLike): Promise<void> {
    const { postId, like } = input;

    if (like) {
      let [likesAmount] = await BaseDatabase.connection
        .select("likes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      likesAmount.likes++;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ likes: likesAmount.likes })
        .where({ id: postId });
    } else {
      let [dislikesAmount] = await BaseDatabase.connection
        .select("dislikes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      dislikesAmount.dislikes++;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ dislikes: dislikesAmount.dislikes })
        .where({ id: postId });
    }
  }

  public async deleteLike(input: InputLike): Promise<void> {
    const { userId, postId } = input;

    await BaseDatabase.connection(PostsDatabase.TABLE_LIKES_DISLIKES)
      .delete()
      .where({ user_id: userId, post_id: postId });
  }

  public async decreaseLikeInPost(input: InputLike): Promise<void> {
    const { postId, like } = input;

    if (like) {
      let [likesAmount] = await BaseDatabase.connection
        .select("likes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      likesAmount.likes--;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ likes: likesAmount.likes })
        .where({ id: postId });
    } else {
      let [dislikesAmount] = await BaseDatabase.connection
        .select("dislikes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      dislikesAmount.dislikes--;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ dislikes: dislikesAmount.dislikes })
        .where({ id: postId });
    }
  }

  public async changeLike(input: InputLike): Promise<void> {
    const { userId, postId, like } = input;

    const newLike = +like;

    await BaseDatabase.connection(PostsDatabase.TABLE_LIKES_DISLIKES)
      .update({ like: newLike })
      .where({ user_id: userId, post_id: postId });
  }

  public async overwriteLikeInPost(input: InputLike): Promise<void> {
    const { postId, like } = input;

    if (like) {
      let [amount] = await BaseDatabase.connection
        .select("likes", "dislikes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      amount.likes++;
      amount.dislikes--;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ likes: amount.likes, dislikes: amount.dislikes })
        .where({ id: postId });
    } else {
      let [ amount ] = await BaseDatabase.connection
        .select("likes", "dislikes")
        .from(PostsDatabase.TABLE_POSTS)
        .where({ id: postId });

      amount.likes--;
      amount.dislikes++;

      await BaseDatabase.connection(PostsDatabase.TABLE_POSTS)
        .update({ likes: amount.likes, dislikes: amount.dislikes })
        .where({ id: postId });
    }
  }
}
