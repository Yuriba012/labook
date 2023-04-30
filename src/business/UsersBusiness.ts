import { UsersDatabase } from "../database/UsersDatabase";
import { CreateUserInputDTO, CreateUserOutputDTO } from "../dto/createUser.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { User } from "../models/User";
import { UserDB } from "../types/UserDB";

export class UsersBusiness {
    
  constructor(private usersDatabase: UsersDatabase) {}

  public createUser = async (input: CreateUserInputDTO) => {
    const { name, email, password, role } = input;

    const id: string = JSON.stringify(Date.now());

    const userExists = await this.usersDatabase.getUserById(id);

    if (userExists) {
      throw new BadRequestError("Usuário já cadastrado.");
    }

    const user = new User(
      id,
      name,
      email,
      password,
      role,
      new Date().toISOString()
    );

    const userDB: UserDB = {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      password: user.getPassword(),
      role: user.getRole(),
      created_at: user.getCreatedAt(),
    };

    await this.usersDatabase.createUser(userDB);

    const output: CreateUserOutputDTO = {
      message: "Usuário cadastrado com sucesso.",
      user: {
        id: user.getId(),
        name: user.getName(),
        createdAt: user.getCreatedAt(),
      },
    };
    return output;
  };
}
