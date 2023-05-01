import { PostsDatabase } from "../database/PostsDatabase";
import { UsersDatabase } from "../database/UsersDatabase";
import { CreatePostInputDTO } from "../dto/createPost.dto";
import { EditPostInputDTO } from "../dto/editPost.dto";
import { GetPostsOutputDTO } from "../dto/getPosts.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { InputLike } from "../types/InputLike";
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
      content: input.content,
    };

    const postExists = await this.postsDatabase.getPostByIdRaw(newPost.id);

    if (postExists) {
      throw new BadRequestError("Post já existe.");
    }

    await this.postsDatabase.createPost(newPost);
  };

  public editPost = async (input: EditPostInputDTO) => {
    const { idToEdit, newContent } = input;

    if (!input.idToEdit) {
      throw new BadRequestError("Post não existente.");
    }

    const inputDB: EditedPostToDB = {
      idToEdit,
      newPost: {
        content: newContent,
        updated_at: new Date().toISOString(),
      },
    };
    await this.postsDatabase.editPost(inputDB);
  };

  public putLike = async (input: InputLike) => {
    //Busca pelo post no banco de dados.
    const postDB = await this.postsDatabase.getPostByIdRaw(input.postId);

    //Verifica se o post existe.
    if (!postDB) {
      throw new NotFoundError("Post não existe.");
    }

    const usersDatabase = new UsersDatabase();

    const userDB = await usersDatabase.getUserById(input.userId);

    //Verifica se o usuário existe.
    if (!userDB) {
      throw new NotFoundError("Usuário não existe.");
    }

    //Verifica se o post não pertence ao próprio usuário.
    if (postDB?.creator_id === input.userId) {
      throw new BadRequestError("O usuário não pode reagir ao próprio post.");
    }

    const likeDB = await this.postsDatabase.getLike(input);

    //Verifica se o usuário já possui uma reação ao post.
    if (!likeDB) {
      //Caminho se for a primeira reação do usuário ao post.
      await this.postsDatabase.createLike(input);
      await this.postsDatabase.addLikeInPost(input);
    } else {
      //Caminho para o caso de o usuário já possuir uma reação ao post.
      //Verifica se o like/dislike é igual ao like/dislike já registrado para o post.
      if (likeDB.like === input.like) {
        //Caminho para o caso de que o like enviado pelo usuário é igual ao like enviado anteriormente;
        //Deleta o like/dislike feito anteriormente pelo usuário.
        await this.postsDatabase.deleteLike(input);
        //Decremento do like/dislike feito no post anteriormente pelo usuário.
        await this.postsDatabase.decreaseLikeInPost(input);
      } else{
        //Caminho para o caso de que o like enviado pelo usuário é diferente do like enviado anteriormente.
        //Inverte o like no banco de dados (tabela de relações user x post).
        await this.postsDatabase.changeLike(input);
        //Converte like em dislike ou vice-versa no post no banco de dados.
        await this.postsDatabase.overwriteLikeInPost(input);
      }
    }
  };
}
