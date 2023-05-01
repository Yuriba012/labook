import { Request, Response } from "express";
import { BaseError } from "../errors/BaseError";
import { PostsBusiness } from "../business/PostsBusiness";
import { GetPostsOutputDTO } from "../dto/getPosts.dto";
import { CreatePostInputSchema } from "../dto/createPost.dto";
import { EditPostInputSchema } from "../dto/editPost.dto";
import { PutLikeInputSchema } from "../dto/putLike.dto";

export class PostsController {
  constructor(private postsBusiness: PostsBusiness) {}

  public getPosts = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const output: GetPostsOutputDTO[] = await this.postsBusiness.getPosts(
        query
      );
      res.status(200).send(output);
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public createPost = async (req: Request, res: Response) => {
    try {
      const { content, creatorId } = req.body;
      const input = CreatePostInputSchema.parse({
        content,
        creatorId,
      });
      await this.postsBusiness.createPost(input);
      res.status(200).send("Post criado com sucesso.");
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public editPost = async (req: Request, res: Response) => {
    try {
      const input = EditPostInputSchema.parse({
        idToEdit: req.params.id,
        newContent: req.body.content,
      });

      await this.postsBusiness.editPost(input);

      res.status(200).send("Post atualizado com sucesso.");
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public putLike = async (req: Request, res: Response) => {
    try {
      const input = PutLikeInputSchema.parse({
        userId: req.body.userId,
        postId: req.params.id,
        like: req.body.like
      })

      await this.postsBusiness.putLike(input);

      res.status(200).send("Like inserido com sucesso.");
    } catch (error) {
      console.log(error);

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }

  }
}
