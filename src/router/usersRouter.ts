import express  from "express";
import { UsersController } from "../controlller/UsersController";
import { UsersBusiness } from "../business/UsersBusiness";
import { UsersDatabase } from "../database/UsersDatabase";

export const usersRouter = express.Router();

const usersController = new UsersController(new UsersBusiness(new UsersDatabase));

usersRouter.post('/', usersController.createUser);
