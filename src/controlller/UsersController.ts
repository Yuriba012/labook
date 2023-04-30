import { Request, Response } from "express";
import { BaseError } from "../errors/BaseError";
import { UsersBusiness } from "../business/UsersBusiness";
import { CreateUserInputDTO } from "../dto/createUser.dto";

export class UsersController {
  constructor(private usersBusiness: UsersBusiness) {}

  public createUser = async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        role,
      }: { name: string; email: string; password: string; role: string } =
        req.body;
      const input: CreateUserInputDTO = {
        name,
        email,
        password,
        role,
      };

      const output = await this.usersBusiness.createUser(input);

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
}
